import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { STransaction } from './transaction.service'
import sendResponse from '../../utils/sendResponse'
import { StatusCodes } from 'http-status-codes'
import { JwtPayload } from 'jsonwebtoken'

const CGetTotalBalance = catchAsync(async (req: Request, res: Response) => {
  const result = await STransaction.SGetTotalBalance()
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sent Successfully',
    data: result,
  })
})

const CSendMoney = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body
  const { user } = req as JwtPayload
  const result = await STransaction.SSendMoney(payload, user)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sent Successfully',
    data: result,
  })
})

const CCashOut = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body
  const { user } = req as JwtPayload
  const result = await STransaction.SCashOut(payload, user)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sent Successfully',
    data: result,
  })
})

const CCashIn = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body
  const { user } = req as JwtPayload
  const result = await STransaction.SCashIn(payload, user)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sent Successfully',
    data: result,
  })
})

const CGetOneUserTransaction = catchAsync(
  async (req: Request, res: Response) => {
    const phone = req.params.phone
    const result = await STransaction.SGetOneUserTransaction(phone)
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Transaction retrieved successfully',
      data: result,
    })
  },
)

const CGetTransaction = catchAsync(async (req: Request, res: Response) => {
  const { user } = req as JwtPayload
  const result = await STransaction.SGetTransaction(user)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Transaction retrieved successfully',
    data: result,
  })
})

const CCashRequest = catchAsync(async (req: Request, res: Response) => {
  const { user } = req as JwtPayload
  const body = req.body
  const result = await STransaction.SCashRequest(user, body)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cash request sent successfully',
    data: result,
  })
})

const CWithdrawRequest = catchAsync(async (req: Request, res: Response) => {
  const { user } = req as JwtPayload
  const body = req.body
  const result = await STransaction.SWithdrawRequest(user, body)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Withdraw request sent successfully',
    data: result,
  })
})

const CApproveCashRequest = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const body = req.body.isApproved
  const result = await STransaction.SApproveCashRequest(id, body)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cash request approved successfully',
    data: result,
  })
})

const CApproveWithdrawRequest = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id
    const body = req.body.isApproved
    const result = await STransaction.SApproveWithdrawRequest(id, body)
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Withdraw request approved successfully',
      data: result,
    })
  },
)

const CGetAllCashRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await STransaction.SGetAllCashRequest()
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cash request retrieved successfully',
    data: result,
  })
})

const CGetAllWithdrawRequest = catchAsync(
  async (req: Request, res: Response) => {
    const result = await STransaction.SGetAllWithdrawRequest()
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Withdraw request retrieved successfully',
      data: result,
    })
  },
)

export const CTransaction = {
  CGetTotalBalance,
  CSendMoney,
  CCashOut,
  CCashIn,
  CGetOneUserTransaction,
  CGetTransaction,
  CCashRequest,
  CWithdrawRequest,
  CApproveCashRequest,
  CApproveWithdrawRequest,
  CGetAllCashRequest,
  CGetAllWithdrawRequest,
}
