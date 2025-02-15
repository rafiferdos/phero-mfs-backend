import { JwtPayload } from 'jsonwebtoken'
import { MUser } from '../Auth/auth.model'
import { ITransaction } from './transaction.interface'
import AppError from '../../errors/AppError'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import MTransaction, { MRequest } from './transaction.model'

const SGetTotalBalance = async () => {
  // Get total balance of all users
  const userBalance = await MUser.aggregate([
    { $match: { accountType: 'user' } },
    { $group: { _id: null, totalBalance: { $sum: '$balance' } } },
  ])
  // Get total balance of all agents
  const agentBalance = await MUser.aggregate([
    { $match: { accountType: 'agent' } },
    { $group: { _id: null, totalBalance: { $sum: '$balance' } } },
  ])
  return (
    (userBalance[0]?.totalBalance || 0) + (agentBalance[0]?.totalBalance || 0)
  )
}

const SSendMoney = async (payload: ITransaction, userData: JwtPayload) => {
  const reciever = await MUser.findOne({ phone: payload.recieverPhoneNumber })
  if (!reciever) throw new AppError(StatusCodes.NOT_FOUND, 'Reciever not found')
  if (reciever.isBlocked)
    throw new AppError(StatusCodes.FORBIDDEN, 'Reciever is blocked')

  const sender = await MUser.findOne({ phone: userData.phone })
  if (!sender) throw new AppError(StatusCodes.NOT_FOUND, 'Sender not found')
  if (sender.isBlocked)
    throw new AppError(StatusCodes.FORBIDDEN, 'Sender is blocked')

  const pinMatching = await bcrypt.compare(payload.pin, sender.pin)
  if (!pinMatching) throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid pin')

  const tempFee = payload.amount >= 100 ? 5 : 0
  const totalAmount = payload.amount + tempFee
  if (sender.balance! < totalAmount)
    throw new AppError(StatusCodes.BAD_REQUEST, 'Insufficient balance')

  if (payload.amount < 50)
    throw new AppError(StatusCodes.BAD_REQUEST, 'Minimum amount is 50 Taka')

  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    await MUser.findOneAndUpdate(
      { phone: sender.phone },
      { $inc: { balance: -totalAmount } },
      { session },
    )
    await MUser.findOneAndUpdate(
      { phone: reciever.phone },
      { $inc: { balance: payload.amount } },
      { session },
    )

    if (tempFee > 0) {
      await MUser.findOneAndUpdate(
        { phone: '01921479294' },
        { $inc: { balance: tempFee } },
        { session },
      )
    }
    const transaction = new MTransaction({
      sender: sender.phone,
      reciever: reciever.phone,
      amount: payload.amount,
      fee: tempFee,
      transactionType: 'sendMoney',
      timestamp: new Date(),
    })
    await transaction.save({ session })

    await session.commitTransaction()
    await session.endSession()
    return { message: 'Transaction successful', amount: payload.amount }
  } catch (error: any) {
    await session.abortTransaction()
    await session.endSession()
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const SCashOut = async (payload: ITransaction, userData: JwtPayload) => {
  const sender = await MUser.findOne({ phone: userData.phone }).select('+pin')
  if (!sender) {
    throw new AppError(404, 'User not found')
  }
  if (sender.isBlocked) {
    throw new AppError(400, 'Sender account is blocked')
  }
  const pinMatching = await bcrypt.compare(payload.pin, sender.pin)
  if (!pinMatching) throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid pin')

  const agent = await MUser.findOne({ phone: payload.recieverPhoneNumber })
  if (!agent || agent.role !== 'agent')
    throw new AppError(StatusCodes.NOT_FOUND, 'Agent not found')
  if (agent.isBlocked)
    throw new AppError(StatusCodes.FORBIDDEN, 'Agent is blocked')
  if (!agent.isActive)
    throw new AppError(StatusCodes.FORBIDDEN, 'Agent is not active')

  const cashOutFee = payload.amount * 0.015
  const agentIncome = payload.amount * 0.01
  const adminIncome = payload.amount * 0.005
  const totalDeduction = payload.amount + cashOutFee

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    await MUser.findOneAndUpdate(
      { phone: userData.phone },
      { $inc: { balance: -totalDeduction } },
      { session },
    )
    await MUser.findOneAndUpdate(
      { phone: payload.recieverPhoneNumber },
      { $inc: { balance: payload.amount, income: agentIncome } },
      { session },
    )
    await MUser.findOneAndUpdate(
      { role: 'admin' },
      { $inc: { balance: adminIncome } },
      { session },
    )
    const transaction = new MTransaction({
      sender: userData.phone,
      reciever: agent.phone,
      amount: payload.amount,
      fee: cashOutFee,
      transactionType: 'cashOut',
      timestamp: new Date(),
    })

    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()
    return { message: 'Cash out successful', amount: payload.amount }
  } catch (error: any) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const SCashIn = async (payload: ITransaction, agentData: JwtPayload) => {
  const agent = await MUser.findOne({ phone: agentData.phone }).select('+pin')
  if (!agent || agent.role !== 'agent')
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Only registered agents can cash in',
    )
  const pinMatching = await bcrypt.compare(payload.pin, agent.pin)
  if (!pinMatching) throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid pin')

  const reciever = await MUser.findOne({ phone: payload.recieverPhoneNumber })
  if (!reciever) throw new AppError(StatusCodes.NOT_FOUND, 'Reciever not found')

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    await MUser.findOneAndUpdate(
      { phone: payload.recieverPhoneNumber },
      { $inc: { balance: payload.amount } },
      { session },
    )
    await MUser.findOneAndUpdate(
      { phone: agent.phone },
      { $inc: { balance: -payload.amount } },
      { session },
    )
    const transaction = new MTransaction({
      sender: agent.phone,
      reciever: reciever.phone,
      amount: payload.amount,
      fee: 0,
      transactionType: 'cashIn',
    })
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()
    return { message: 'Cash in successful', amount: payload.amount }
  } catch (error: any) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const SGetOneUserTransaction = async (phone: string) =>
  await MTransaction.find({ $or: [{ sender: phone }, { reciever: phone }] })

const SGetTransaction = async (userData: JwtPayload) => {
  if (userData.role === 'user') {
    const transaction = await MTransaction.find({
      $or: [{ sender: userData.phone }, { reciever: userData.phone }],
    }).limit(100)
    return transaction
  } else if (userData.role === 'agent') {
    const transaction = await MTransaction.find({
      $or: [{ sender: userData.phone }, { reciever: userData.phone }],
    }).limit(100)
    return transaction
  } else if (userData.role === 'admin') {
    const transaction = await MTransaction.find().limit(100)
    return transaction
  }
  return []
}

const SCashRequest = async (
  userData: JwtPayload,
  body: { amount: number; pin: string },
) => {
  const agent = await MUser.findOne({ phone: userData.phone }).select('+pin')
  if (!agent) throw new AppError(StatusCodes.NOT_FOUND, 'Agent not found')

  const verifyPin = await bcrypt.compare(body.pin, agent.pin)
  if (!verifyPin) throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid pin')

  const newRequest = new MRequest({
    agent: userData.phone,
    type: 'cash',
    amount: body.amount,
    status: 'pending',
  })

  await newRequest.save()
  return { message: 'Cash request sent successfully' }
}

const SWithdrawRequest = async (
  userData: JwtPayload,
  body: { amount: number; pin: string },
) => {
  const agent = await MUser.findOne({ mobile: userData.phone }).select('+pin')
  if (!agent) throw new AppError(StatusCodes.NOT_FOUND, 'Agent not found')

  const verifyPin = await bcrypt.compare(body.pin, agent.pin)
  if (!verifyPin) throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid pin')

  const newRequest = new MRequest({
    agent: userData.phone,
    type: 'withdraw',
    amount: body.amount,
    status: 'pending',
  })
  await newRequest.save()
  return { message: 'Withdraw request sent successfully' }
}

const SApproveWithdrawRequest = async (id: string, status: boolean) => {
  const withdrawOwner = await MRequest.findById(id)
  if (!withdrawOwner)
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found')
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    if (status) {
      await MRequest.findByIdAndUpdate(
        id,
        { status: 'completed' },
        { session, new: true },
      )
      await MUser.findOneAndUpdate(
        { phone: withdrawOwner.agent },
        { $inc: { balance: -withdrawOwner.amount } },
        { session },
      )
    }
    if (!status) {
      await MRequest.findByIdAndUpdate(id, { status: 'failed' }, { new: true })
      return { message: 'Withdraw request failed!' }
    }
    await session.commitTransaction()
    session.endSession()
  } catch (error: any) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const SApproveCashRequest = async (id: string, status: string) => {
  const requestOwner = await MRequest.findById(id)
  if (!requestOwner) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Request not found')
  }
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    if (status) {
      await MRequest.findByIdAndUpdate(
        id,
        { status: 'completed' },
        { session, new: true },
      )
      await MUser.findOneAndUpdate(
        { phone: requestOwner.agent },
        { $inc: { balance: requestOwner.amount || 100000 } },
        { session },
      )
    }
    if (!status) {
      await MRequest.findByIdAndUpdate(id, { status: 'failed' }, { new: true })
      return { message: 'Cash request failed!' }
    }
    await session.commitTransaction()
    session.endSession()
  } catch (error: any) {
    await session.abortTransaction()
    session.endSession()
    throw new AppError(StatusCodes.BAD_REQUEST, error.message)
  }
}

const SGetAllWithdrawRequest = async () =>
  await MRequest.find({ type: 'withdraw' })

const SGetAllCashRequest = async () => await MRequest.find({ type: 'cash' })

export const STransaction = {
  SGetTotalBalance,
  SSendMoney,
  SCashOut,
  SCashIn,
  SGetOneUserTransaction,
  SGetTransaction,
  SCashRequest,
  SWithdrawRequest,
  SApproveWithdrawRequest,
  SApproveCashRequest,
  SGetAllWithdrawRequest,
  SGetAllCashRequest,
}
