import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { appointments } from '../db/schema'
import { requireAuth } from '../middleware/requireAdmin'

const router = Router()

router.post('/appointments', async (req, res) => {
  try {
    const { service, date, guestName, guestPhone, userId } = req.body

    if (!service || !date || !guestName || !guestPhone) {
      return res.status(400).json({ error: 'חסרים פרטים חובה' })
    }

    const [newAppointment] = await db
      .insert(appointments)
      .values({
        service,
        date: new Date(date),
        guestName,
        guestPhone,
        userId: userId || null,
      })
      .returning()

    res.status(201).json(newAppointment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.get('/appointments/user/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params

    if (req.userId !== userId) {
      return res.status(403).json({ error: 'אין הרשאה' })
    }

    const userAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))

    res.json(userAppointments)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

export default router