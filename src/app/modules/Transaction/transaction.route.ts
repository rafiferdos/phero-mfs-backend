import { Router } from 'express'
import auth from '../../middlewares/auth'
import { CTransaction } from './transaction.controller'
import { validateRequest } from '../../middlewares/validateRequest'
import { VTransaction } from './transaction.validation'

const RTransaction = Router()

RTransaction.get(
  '/getAllWithdrawRequest',
  auth('admin'),
  CTransaction.CGetAllWithdrawRequest,
)

RTransaction.get(
  '/getAllCashRequest',
  auth('admin'),
  CTransaction.CGetAllCashRequest,
)

RTransaction.get('/totalBalance', auth('admin'), CTransaction.CGetTotalBalance)

RTransaction.get('/:phone', auth('admin'), CTransaction.CGetOneUserTransaction)

RTransaction.get(
  '/',
  auth('admin', 'agent', 'user'),
  CTransaction.CGetTransaction,
)

RTransaction.post(
  '/sendMoney',
  validateRequest(VTransaction.VSendMoney),
  auth('user'),
  CTransaction.CSendMoney,
)

RTransaction.post(
  '/cashOut',
  validateRequest(VTransaction.VCashFlow),
  auth('user'),
  CTransaction.CCashOut,
)

RTransaction.post(
  'cashIn',
  validateRequest(VTransaction.VCashFlow),
  auth('agent'),
  CTransaction.CCashIn,
)

RTransaction.post('/cashRequest', auth('agent'), CTransaction.CCashRequest)

RTransaction.post(
  '/withdrawRequest',
  auth('agent'),
  CTransaction.CWithdrawRequest,
)

RTransaction.patch(
  '/approveCashRequest',
  auth('admin'),
  CTransaction.CApproveCashRequest,
)

RTransaction.patch(
  '/approveWithdrawRequest',
  auth('admin'),
  CTransaction.CApproveWithdrawRequest,
)

export default RTransaction
