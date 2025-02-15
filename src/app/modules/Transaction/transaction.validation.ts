import { z } from 'zod'

// Validation schema for send money
const VSendMoney = z.object({
  recieverNumber: z
    .string({ invalid_type_error: 'Invalid phone number' })
    .nonempty({ message: 'Phone number is required' }),
  amount: z
    .number({ invalid_type_error: 'Invalid amount' })
    .positive({ message: 'Amount must be greater than zero' })
    .min(50, { message: 'Amount must be greater than or equal to 50 Taka' }),
  pin: z
    .string({ invalid_type_error: 'Invalid pin' })
    .nonempty({ message: 'Pin is required' }),
})

// Validation schema for cash flow
const VCashFlow = z.object({
  recieverNumber: z
    .string({ invalid_type_error: 'Invalid phone number' })
    .nonempty({ message: 'Phone number is required' }),
  amount: z
    .number({ invalid_type_error: 'Invalid amount' })
    .positive({ message: 'Amount must be greater than zero' }),
  pin: z
    .string({ invalid_type_error: 'Invalid pin' })
    .nonempty({ message: 'Pin is required' }),
})

// Export validation schema
export const VTransaction = {
  VSendMoney,
  VCashFlow,
}
