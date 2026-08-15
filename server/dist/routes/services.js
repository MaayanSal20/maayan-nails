"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const requireAdmin_1 = require("../middleware/requireAdmin");
const router = (0, express_1.Router)();
// ציבורי - כל אחת יכולה לראות שירותים פעילים
router.get('/services', async (req, res) => {
    try {
        const allServices = await db_1.db.select().from(schema_1.services).where((0, drizzle_orm_1.eq)(schema_1.services.active, 'true'));
        res.json(allServices);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});
// לאדמין - רואה גם שירותים לא-פעילים
router.get('/admin/services', requireAdmin_1.requireAdmin, async (req, res) => {
    try {
        const allServices = await db_1.db.select().from(schema_1.services);
        res.json(allServices);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});
router.post('/admin/services', requireAdmin_1.requireAdmin, async (req, res) => {
    try {
        const { name, description, price, salePrice, saleNote } = req.body;
        if (!name || !price) {
            return res.status(400).json({ error: 'חסרים פרטי חובה' });
        }
        const [newService] = await db_1.db
            .insert(schema_1.services)
            .values({ name, description, price, salePrice, saleNote })
            .returning();
        res.status(201).json(newService);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});
router.patch('/admin/services/:id', requireAdmin_1.requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description, price, salePrice, saleNote, active } = req.body;
        const [updated] = await db_1.db
            .update(schema_1.services)
            .set({ name, description, price, salePrice, saleNote, active })
            .where((0, drizzle_orm_1.eq)(schema_1.services.id, id))
            .returning();
        if (!updated) {
            return res.status(404).json({ error: 'שירות לא נמצא' });
        }
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});
router.delete('/admin/services/:id', requireAdmin_1.requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const [deleted] = await db_1.db.delete(schema_1.services).where((0, drizzle_orm_1.eq)(schema_1.services.id, id)).returning();
        if (!deleted) {
            return res.status(404).json({ error: 'שירות לא נמצא' });
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});
exports.default = router;
