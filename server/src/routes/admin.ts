import { Router } from 'express'
import { sql, eq, gte } from 'drizzle-orm'
import { db } from '../db'
import { users, appointments, pageViews } from '../db/schema'
import { requireAdmin } from '../middleware/requireAdmin'
import { notifications } from '../db/schema'

const router = Router()

router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const [totalUsersResult] = await db.select({ count: sql<number>`count(*)::int` }).from(users)
    const [newUsersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(gte(users.createdAt, oneMonthAgo))
    const [totalViewsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(pageViews)
    const [uniqueVisitorsResult] = await db
      .select({ count: sql<number>`count(distinct visitor_id)::int` })
      .from(pageViews)

    const allAppointments = await db.select().from(appointments)

    const appointmentsByService = allAppointments.reduce((acc: Record<string, number>, a) => {
      acc[a.service] = (acc[a.service] || 0) + 1
      return acc
    }, {})

    const appointmentsByStatus = allAppointments.reduce((acc: Record<string, number>, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1
      return acc
    }, {})

    res.json({
      totalUsers: totalUsersResult.count,
      newUsersThisMonth: newUsersResult.count,
      totalPageViews: totalViewsResult.count,
      uniqueVisitors: uniqueVisitorsResult.count,
      totalAppointments: allAppointments.length,
      appointmentsByService,
      appointmentsByStatus,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.get('/admin/appointments', requireAdmin, async (req, res) => {
  try {
    const allAppointments = await db.select().from(appointments)
    const sorted = allAppointments.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    res.json(sorted)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.patch('/admin/appointments/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id as string
    const { status } = req.body

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'סטטוס לא תקין' })
    }

    const [updated] = await db
      .update(appointments)
      .set({ status, cancelRequested: 'false' })
      .where(eq(appointments.id, id))
      .returning()

    if (!updated) {
      return res.status(404).json({ error: 'תור לא נמצא' })
    }

    if (updated.userId && (status === 'confirmed' || status === 'cancelled')) {
      const statusText = status === 'confirmed' ? 'אושר' : 'בוטל'
      await db.insert(notifications).values({
        userId: updated.userId,
        message: `התור שלך ל${updated.service} ${statusText}`,
      })
    }

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

export default router