import { z } from 'zod'

// Validation schema for registration
const VRegistration = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 3 characters')
    .max(255, 'Name must be at most 255 characters'),
  pin: z
    .string()
    .length(5, 'PIN must be 5 digit number')
    .regex(/^\d{5}$/, 'PIN must be a number'),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['agent', 'user']),
  nid: z
    .string()
    .min(10, 'NID must be at least 10 characters')
    .max(17, 'NID must be at most 17 characters'),
  isBlocked: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
})

// Validation schema for login
const Vlogin = z.object({
  identifier: z.string(),
  pin: z
    .string()
    .length(5, 'PIN must be 5 digit number')
    .regex(/^\d{5}$/, 'PIN must be a number'),
})

export const VUserAuth = {
  VRegistration,
  Vlogin,
}
