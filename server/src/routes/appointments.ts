import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { appointments } from '../db/schema'
import { requireAuth } from '../middleware/requireAdmin'
import { notifications, users } from '../db/schema'

const router = Router()

const WORKING_HOURS = ['09:00', '11:00', '13:00', '15:00', '17:00']

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

    const admins = await db.select().from(users).where(eq(users.role, 'admin'))

    for (const admin of admins) {
      await db.insert(notifications).values({
        userId: admin.id,
        message: `תור חדש ממתין לאישור: ${guestName} · ${service}`,
      })
    }

    res.status(201).json(newAppointment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.get('/appointments/available', async (req, res) => {
  try {
    const { date } = req.query as { date?: string }

    if (!date) {
      return res.status(400).json({ error: 'חסר תאריך' })
    }

    const allAppointments = await db.select().from(appointments)

    const bookedTimes = allAppointments
      .filter((a) => {
        if (a.status === 'cancelled') return false
        const apptDate = new Date(a.date).toLocaleDateString('en-CA', {
          timeZone: 'Asia/Jerusalem',
        })
        return apptDate === date
      })
      .map((a) =>
        new Date(a.date).toLocaleTimeString('he-IL', {
          timeZone: 'Asia/Jerusalem',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      )

    const now = new Date()
    const todayInIsrael = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' })
    const currentTimeInIsrael = now.toLocaleTimeString('he-IL', {
      timeZone: 'Asia/Jerusalem',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    const availableSlots = WORKING_HOURS.filter((slot) => {
      if (bookedTimes.includes(slot)) return false
      if (date === todayInIsrael && slot <= currentTimeInIsrael) return false
      return true
    })

    res.json(availableSlots)
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

router.patch('/appointments/:id/request-cancel', requireAuth, async (req, res) => {
  try {
    const id = req.params.id as string

    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id))

    if (!appointment) {
      return res.status(404).json({ error: 'תור לא נמצא' })
    }

    if (appointment.userId !== req.userId) {
      return res.status(403).json({ error: 'אין הרשאה' })
    }

    const [updated] = await db
      .update(appointments)
      .set({ cancelRequested: 'true' })
      .where(eq(appointments.id, id))
      .returning()

    const admins = await db.select().from(users).where(eq(users.role, 'admin'))
    for (const admin of admins) {
      await db.insert(notifications).values({
        userId: admin.id,
        message: `בקשת ביטול תור: ${appointment.guestName} · ${appointment.service}`,
      })
    }

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

export default router