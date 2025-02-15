import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import { ILogin, IUser } from './auth.interface'
import { MUser } from './auth.model'
import bcrypt from 'bcryptjs'
import config from '../../config'

// Service to create user into database
const SCreateUserIntoDB = async (payload: IUser) => {
  const isExists = await await MUser.findOne({
    $or: [{ mobile: payload.phone }, { email: payload.email }],
  })
  if (isExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User already exists')
  }
  if (payload.role === 'user') payload.balance = 40
  else if (payload.role === 'agent')
    (payload.isActive = false), (payload.balance = 100000)
  return await MUser.create(payload)
}

// Service to login user into database
const SLoginUserToDB = async (payload: ILogin) => {
  // Check if user exists
  const authenticatedUser = await MUser.findOne({
    $or: [{ email: payload.identifier }, { phone: payload.identifier }],
  }).select('+pin')
  if (!authenticatedUser)
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials')
  const verifyPin = await bcrypt.compare(payload.pin, authenticatedUser.pin)
  if (!verifyPin)
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials')
  if (authenticatedUser.isBlocked)
    throw new AppError(StatusCodes.UNAUTHORIZED, 'User is blocked')
  if (authenticatedUser.isActive === false)
    throw new AppError(StatusCodes.UNAUTHORIZED, 'User is not active')

  // Generate JWT token
  const verifiedIdentity = {
    email: authenticatedUser.email,
    phone: authenticatedUser.phone,
    role: authenticatedUser.role,
    name: authenticatedUser.name,
  }
  const secret = config.jwt_access_token as string
  const token = jwt.sign(verifiedIdentity, secret, { expiresIn: '1d' })
  return { token }
}

// Service to update agent status
const SUpdateAgentStatus = async (id: string, status: boolean) =>
  await MUser.findByIdAndUpdate(id, { isActive: status }, { new: true })

// Service to update user
const SUpdateUserStatus = async (id: string) =>
  await MUser.findByIdAndUpdate(id, { isBlocked: true }, { new: true })

// Service to get one user
const SGetOneUser = async (phone: string) =>
  await MUser.findOne({ phone }).select('-pin')

// Service to get all users
const SGetUser = async () => await MUser.find().select('-pin')

export const SUser = {
  SCreateUserIntoDB,
  SLoginUserToDB,
  SUpdateAgentStatus,
  SUpdateUserStatus,
  SGetOneUser,
  SGetUser,
}
