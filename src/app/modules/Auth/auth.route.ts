import { Router } from 'express'
import { validateRequest } from '../../middlewares/validateRequest'
import { VUserAuth } from './auth.validation'
import { CAuth } from './auth.controller'
import auth from '../../middlewares/auth'

const RUser = Router()

// Route for registration
RUser.post(
  '/auth/register',
  validateRequest(VUserAuth.VRegistration),
  CAuth.CCreateUser,
)

// Route for login
RUser.post('/auth/login', validateRequest(VUserAuth.VLogin), CAuth.CLoginUser)

// Route for updating user status
RUser.patch('/auth/user/:id', auth('admin'), CAuth.CUpdateUserStatus)

// Route for updating agent status
RUser.patch('/auth/agent/:id', auth('admin'), CAuth.CUpdateAgentStatus)

// Route for getting one user
RUser.get('/users/:phone', auth('admin'), CAuth.CGetOneUser)

// Route for getting all users
RUser.get('/users', auth('admin'), CAuth.CGetUsers)

export default RUser
