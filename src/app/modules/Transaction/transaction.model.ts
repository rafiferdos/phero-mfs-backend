import mongoose, { Schema } from 'mongoose'
import { IRequest, TTransaction } from './transaction.interface'

// Transaction Schema
const transactionSchema = new Schema<TTransaction>(
  {
    sender: {
      type: String,
      required: true,
    },
    reciever: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    fee: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false },
)

// Transaction Model
const MTransaction = mongoose.model<TTransaction>(
  'Transaction',
  transactionSchema,
)

export default MTransaction

const RequestSchema = new Schema<IRequest>(
  {
    agent: {
      type: String,
    },
    type: {
      type: String,
    },
    amount: {
      type: Number,
      default: 100000, // 1 Lakh Taka
      max: 100000, // 1 Lakh Taka
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },

  { timestamps: true, versionKey: false },
)
