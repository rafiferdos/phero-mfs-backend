import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import { SUser } from './auth.service'
import sendResponse from '../../utils/sendResponse'
import { StatusCodes } from 'http-status-codes'

// Controller to create user
const CCreateUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body
  const result = await SUser.SCreateUserIntoDB(payload)
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'User created successfully',
    data: result,
  })
})

// Controller to login user
const CLoginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body
  const { token } = await SUser.SLoginUserToDB(payload)

  res.cookie('token', token, {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development',
  })

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User logged in successfully',
    data: token,
  })
})

// Controller to get one user
const CGetOneUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.phone
  const result = await SUser.SGetOneUser(id)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User fetched successfully',
    data: result,
  })
})

// Controller to get users
const CGetUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await SUser.SGetUser()
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users fetched successfully',
    data: result,
  })
})

// Controller to update user account status
const CUpdateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await SUser.SUpdateUserStatus(id)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  })
})

// Controller to update agent account status
const CUpdateAgentStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const status = req.body.isActive
  const result = await SUser.SUpdateAgentStatus(id, status)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Agent status updated successfully',
    data: result,
  })
})

export const CAuth = {
  CCreateUser,
  CLoginUser,
  CGetUsers,
  CUpdateUserStatus,
  CUpdateAgentStatus,
  CGetOneUser,
}
