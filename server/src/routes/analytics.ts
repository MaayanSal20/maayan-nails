import { Router } from 'express'
import { db } from '../db'
import { pageViews } from '../db/schema'

const router = Router()

router.post('/analytics/pageview', async (req, res) => {
  try {
    const { path, visitorId } = req.body

    if (!path || !visitorId) {
      return res.status(400).json({ error: 'חסרים פרטים' })
    }

    await db.insert(pageViews).values({ path, visitorId })

    res.status(201).json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

export default router