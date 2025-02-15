// Transaction Interface
export interface ITransaction {
  recieverPhoneNumber: string
  amount: number
  pin: string
}

// Transaction Type
export type TTransaction = {
  transactionType: string
  sender: string
  reciever: string
  amount: number
  fee?: number
}

// Request Interface
export interface IRequest {
  agent?: string
  type?: 'cash' | 'withdraw'
  amount: number
  status?: 'pending' | 'completed' | 'failed'
}
