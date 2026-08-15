import { Request, Response, NextFunction } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.header('x-user-id')

    if (!userId) {
      return res.status(401).json({ error: 'נדרשת התחברות' })
    }

    const foundUsers = await db.select().from(users).where(eq(users.id, userId))
    const user = foundUsers[0]

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'אין הרשאה' })
    }

    next()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
}