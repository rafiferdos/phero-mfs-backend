import { Router } from 'express'

const router = Router()

const routers = [
  
]

routers.forEach((route) => router.use(route.path, route.router))

export default router
