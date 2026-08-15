import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { services } from '../db/schema'
import { requireAdmin } from '../middleware/requireAdmin'

const router = Router()

// ציבורי - כל אחת יכולה לראות שירותים פעילים
router.get('/services', async (req, res) => {
  try {
    const allServices = await db.select().from(services).where(eq(services.active, 'true'))
    res.json(allServices)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

// לאדמין - רואה גם שירותים לא-פעילים
router.get('/admin/services', requireAdmin, async (req, res) => {
  try {
    const allServices = await db.select().from(services)
    res.json(allServices)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.post('/admin/services', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, salePrice, saleNote } = req.body

    if (!name || !price) {
      return res.status(400).json({ error: 'חסרים פרטי חובה' })
    }

    const [newService] = await db
      .insert(services)
      .values({ name, description, price, salePrice, saleNote })
      .returning()

    res.status(201).json(newService)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.patch('/admin/services/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id as string
    const { name, description, price, salePrice, saleNote, active } = req.body



    const [updated] = await db
      .update(services)
      .set({ name, description, price, salePrice, saleNote, active })
      .where(eq(services.id, id))
      .returning()

    if (!updated) {
      return res.status(404).json({ error: 'שירות לא נמצא' })
    }

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.delete('/admin/services/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id as string

    const [deleted] = await db.delete(services).where(eq(services.id, id)).returning()

    if (!deleted) {
      return res.status(404).json({ error: 'שירות לא נמצא' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

export default router