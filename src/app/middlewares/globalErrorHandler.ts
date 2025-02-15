/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import config from '../config'
import AppError from '../errors/AppError'
import handleCastError from '../errors/handleCastError'
import handleDuplicateError from '../errors/handleDuplicateErrror'
import handleValidationError from '../errors/handleValidationError'
import handleZodError from '../errors/handleZodError'
import { TErrorSources } from '../interface/error'

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  //setting default values
  let statusCode = 500
  let message = 'Something went wrong!'
  let errorDetails = {}
  // let errorSources: TErrorSources = [
  //   {
  //     path: '',
  //     message: 'Something went wrong',
  //   },
  // ]

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err)
    statusCode = simplifiedError?.statusCode
    message = simplifiedError?.message
    errorDetails = simplifiedError?.errorSources
  } else if (err?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err)
    statusCode = simplifiedError?.statusCode
    message = simplifiedError?.message
    errorDetails = simplifiedError?.errorSources
  } else if (err?.name === 'CastError') {
    const simplifiedError = handleCastError(err)
    statusCode = simplifiedError?.statusCode
    message = simplifiedError?.message
    errorDetails = simplifiedError?.errorSources
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err)
    statusCode = simplifiedError?.statusCode
    message = simplifiedError?.message
    errorDetails = simplifiedError?.errorSources
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode
    message = err.message
    errorDetails = {
      path: err?.stack?.split('\n')[1]?.trim()?.split(' ')[1] || 'Unknown Path',
      message: err?.message,
    }
  } else if (err instanceof Error) {
    message = err.message
    errorDetails = {
      path: err?.stack?.split('\n')[1]?.trim()?.split(' ')[1] || 'Unknown Path',
      message: err?.message,
    }
  }
  //ultimate return
  res.status(statusCode).json({
    success: false,
    message,
    // errorSources,
    statusCode,
    error: errorDetails,
    stack: config.NODE_ENV === 'development' ? err?.stack : null,
  })
}

export default globalErrorHandler
