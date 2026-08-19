import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      userRole?: string
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'נדרשת התחברות' })
  }

  const payload = verifyToken(token)

  if (!payload) {
    return res.status(401).json({ error: 'טוקן לא תקין' })
  }

  req.userId = payload.id
  req.userRole = payload.role
  next()
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'אין הרשאה' })
    }
    next()
  })
}