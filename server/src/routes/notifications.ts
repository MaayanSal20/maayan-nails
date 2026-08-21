import { Router } from 'express'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db'
import { notifications } from '../db/schema'
import { requireAuth } from '../middleware/requireAdmin'

const router = Router()

router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const userId = req.userId!

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))

    res.json(userNotifications)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.patch('/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    const id = req.params.id as string
    const userId = req.userId!

    const [updated] = await db
      .update(notifications)
      .set({ read: 'true' })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning()

    if (!updated) {
      return res.status(404).json({ error: 'התראה לא נמצאה' })
    }

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.delete('/notifications/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id as string
    const userId = req.userId!

    const [deleted] = await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning()

    if (!deleted) {
      return res.status(404).json({ error: 'התראה לא נמצאה' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})


export default router