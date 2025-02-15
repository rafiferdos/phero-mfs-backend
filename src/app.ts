// Imports of express, cors, cookie-parser, and the router
import express, { Request, Response } from 'express'
import globalErrorHandler from './app/middlewares/globalErrorHandler'
import cors from 'cors'
import notFound from './app/middlewares/notFound'
import cookieParser from 'cookie-parser'
import router from './app/router'

// Create express app
const app = express()

// middlewares
app.use(express.json())
app.use(cookieParser())

// cors settings
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
}
app.use(cors(corsOptions))

// Routes
app.use('/api', router)

app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to the API',
  })
})

// Error handler
app.use(globalErrorHandler)

// Not found handler
app.use(notFound)

export default app
