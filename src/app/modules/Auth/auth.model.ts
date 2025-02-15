import { string } from 'zod'
import { IUser } from './auth.interface'
import { model, Schema } from 'mongoose'
import config from '../../config'
import bcrypt from 'bcrypt'

// User schema for MongoDB
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    pin: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 5,
      match: /^\d{5}$/, // PIN must be a number of 5 digits
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['agent', 'user'],
      required: true,
    },
    nid: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 17,
      trim: true,
    },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    balance: { type: Number, default: 0 },
    income: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
)

// Hashing the PIN before saving into the database
userSchema.pre('save', async function (next) {
  const salt_round = Number(config.bcrypt_salt_rounds)
  this.pin = await bcrypt.hash(this.pin, salt_round)
})

// Private pin after saving into the database
userSchema.post('save', function (doc, next) {
  doc.pin = '******'
  next()
})

export const MUser = model<IUser>('user', userSchema)
