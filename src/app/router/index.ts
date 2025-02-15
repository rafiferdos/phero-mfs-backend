import { Router } from 'express'
import RUser from '../modules/Auth/auth.route'
import RTransaction from '../modules/Transaction/transaction.route'

const router = Router()

const routers = [
  {
    path: '/',
    router: RUser,
  },
  {
    path: '/transaction',
    router: RTransaction,
  },
]

routers.forEach((route) => router.use(route.path, route.router))

export default router
