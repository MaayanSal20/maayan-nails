import { Router } from 'express'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { createToken } from '../utils/jwt'
import { requireAuth } from '../middleware/requireAdmin'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'חסרים פרטים חובה' })
    }

    const existingUser = await db.select().from(users).where(eq(users.phone, phone))
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'משתמש עם מספר טלפון זה כבר קיים' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [newUser] = await db
      .insert(users)
      .values({ name, phone, email, password: hashedPassword })
      .returning()

    const token = createToken({ id: newUser.id, role: newUser.role })

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
      token,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body

    if (!phone || !password) {
      return res.status(400).json({ error: 'חסרים פרטים' })
    }

    const foundUsers = await db.select().from(users).where(eq(users.phone, phone))
    const user = foundUsers[0]

    if (!user) {
      return res.status(401).json({ error: 'טלפון או סיסמה שגויים' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'טלפון או סיסמה שגויים' })
    }

    const token = createToken({ id: user.id, role: user.role })

    res.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.patch('/users/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id as string

    if (req.userId !== id) {
      return res.status(403).json({ error: 'אין הרשאה' })
    }

    const { name, email, phone } = req.body

    if (!name || !phone) {
      return res.status(400).json({ error: 'חסרים פרטים חובה' })
    }

    const [updatedUser] = await db
      .update(users)
      .set({ name, email, phone })
      .where(eq(users.id, id))
      .returning()

    if (!updatedUser) {
      return res.status(404).json({ error: 'משתמשת לא נמצאה' })
    }

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      phone: updatedUser.phone,
    })
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(400).json({ error: 'מספר הטלפון כבר בשימוש' })
    }
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

export default router