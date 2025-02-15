// User Interface
export interface IUser {
  name: string
  pin: string //? will be 5 digit number
  phone: string
  email: string
  role: 'agent' | 'user'
  nid: string
  balance?: number
  income?: number
  isBlocked?: boolean //! by default false
  isDeleted?: boolean //! by default false
  isActive?: boolean //* by default true
}

// Login Interface
export interface ILogin {
  pin: string
  identifier: string
}
