import { Router } from 'express'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { createToken } from '../utils/jwt'
import { requireAuth } from '../middleware/requireAdmin'
import { isValidIsraeliPhone } from '../utils/validation'
import { sendResetCodeEmail, sendVerificationEmail } from '../utils/email'


const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body

    if (!name || !phone || !password || !email) {
      return res.status(400).json({ error: 'חסרים פרטים חובה' })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'כתובת אימייל לא תקינה' })
    }

    if (!isValidIsraeliPhone(phone)) {
      return res.status(400).json({ error: 'מספר טלפון לא תקין - יש להזין מספר ישראלי תקין (למשל 0501234567)' })
    }

    const existingUser = await db.select().from(users).where(eq(users.phone, phone))
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'משתמש עם מספר טלפון זה כבר קיים' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        phone,
        email,
        password: hashedPassword,
        resetCode: verificationCode,
        resetCodeExpires: new Date(Date.now() + 15 * 60 * 1000),
      })
      .returning()

    await sendVerificationEmail(email, verificationCode)

    const token = createToken({ id: newUser.id, role: newUser.role })

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
      emailVerified: newUser.emailVerified,
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

    const { name, email } = req.body

    if (!name) {
      return res.status(400).json({ error: 'חסרים פרטים חובה' })
    }

    const [updatedUser] = await db
      .update(users)
      .set({ name, email })
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

router.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({ error: 'חסר מספר טלפון' })
    }

    const foundUsers = await db.select().from(users).where(eq(users.phone, phone))
    const user = foundUsers[0]

    if (!user) {
      return res.json({ success: true })
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000)

    await db
      .update(users)
      .set({ resetCode, resetCodeExpires })
      .where(eq(users.id, user.id))

    if (user.email) {
      await sendResetCodeEmail(user.email, resetCode)
    }

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { phone, code, newPassword } = req.body

    if (!phone || !code || !newPassword) {
      return res.status(400).json({ error: 'חסרים פרטים' })
    }

    const foundUsers = await db.select().from(users).where(eq(users.phone, phone))
    const user = foundUsers[0]

    if (!user || user.resetCode !== code) {
      return res.status(400).json({ error: 'קוד שגוי' })
    }

    if (!user.resetCodeExpires || new Date() > user.resetCodeExpires) {
      return res.status(400).json({ error: 'הקוד פג תוקף, בקשי קוד חדש' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await db
      .update(users)
      .set({ password: hashedPassword, resetCode: null, resetCodeExpires: null })
      .where(eq(users.id, user.id))

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.post('/verify-email', requireAuth, async (req, res) => {
  try {
    const { code } = req.body
    const userId = req.userId!

    if (!code) {
      return res.status(400).json({ error: 'חסר קוד אימות' })
    }

    const foundUsers = await db.select().from(users).where(eq(users.id, userId))
    const user = foundUsers[0]

    if (!user) {
      return res.status(404).json({ error: 'משתמשת לא נמצאה' })
    }

    if (user.emailVerified === 'true') {
      return res.json({ success: true, alreadyVerified: true })
    }

    if (user.resetCode !== code) {
      return res.status(400).json({ error: 'קוד שגוי' })
    }

    if (!user.resetCodeExpires || new Date() > user.resetCodeExpires) {
      return res.status(400).json({ error: 'הקוד פג תוקף, בקשי קוד חדש' })
    }

    await db
      .update(users)
      .set({ emailVerified: 'true', resetCode: null, resetCodeExpires: null })
      .where(eq(users.id, userId))

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.post('/resend-verification', requireAuth, async (req, res) => {
  try {
    const userId = req.userId!

    const foundUsers = await db.select().from(users).where(eq(users.id, userId))
    const user = foundUsers[0]

    if (!user) {
      return res.status(404).json({ error: 'משתמשת לא נמצאה' })
    }

    if (user.emailVerified === 'true') {
      return res.json({ success: true, alreadyVerified: true })
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    await db
      .update(users)
      .set({
        resetCode: verificationCode,
        resetCodeExpires: new Date(Date.now() + 15 * 60 * 1000),
      })
      .where(eq(users.id, userId))

    await sendVerificationEmail(user.email!, verificationCode)

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

export default router