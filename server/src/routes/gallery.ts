import { Router } from 'express'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db'
import { galleryImages } from '../db/schema'
import { requireAdmin } from '../middleware/requireAdmin'

const router = Router()

router.get('/gallery', async (req, res) => {
  try {
    const images = await db
      .select()
      .from(galleryImages)
      .orderBy(desc(galleryImages.createdAt))

    res.json(images)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.post('/admin/gallery', requireAdmin, async (req, res) => {
  try {
    const { url, alt } = req.body

    if (!url) {
      return res.status(400).json({ error: 'חסר קישור תמונה' })
    }

    const [newImage] = await db
      .insert(galleryImages)
      .values({ url, alt })
      .returning()

    res.status(201).json(newImage)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

router.delete('/admin/gallery/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id as string

    const [deleted] = await db
      .delete(galleryImages)
      .where(eq(galleryImages.id, id))
      .returning()

    if (!deleted) {
      return res.status(404).json({ error: 'תמונה לא נמצאה' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'שגיאת שרת' })
  }
})

export default router