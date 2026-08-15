"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const requireAdmin_1 = require("../middleware/requireAdmin");
const router = (0, express_1.Router)();
router.get('/admin/stats', requireAdmin_1.requireAdmin, async (req, res) => {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const [totalUsersResult] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.users);
        const [newUsersResult] = await db_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.gte)(schema_1.users.createdAt, oneMonthAgo));
        const [totalViewsResult] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)::int` }).from(schema_1.pageViews);
        const [uniqueVisitorsResult] = await db_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(distinct visitor_id)::int` })
            .from(schema_1.pageViews);
        const allAppointments = await db_1.db.select().from(schema_1.appointments);
        const appointmentsByService = allAppointments.reduce((acc, a) => {
            acc[a.service] = (acc[a.service] || 0) + 1;
            return acc;
        }, {});
        const appointmentsByStatus = allAppointments.reduce((acc, a) => {
            acc[a.status] = (acc[a.status] || 0) + 1;
            return acc;
        }, {});
        res.json({
            totalUsers: totalUsersResult.count,
            newUsersThisMonth: newUsersResult.count,
            totalPageViews: totalViewsResult.count,
            uniqueVisitors: uniqueVisitorsResult.count,
            totalAppointments: allAppointments.length,
            appointmentsByService,
            appointmentsByStatus,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});
router.get('/admin/appointments', requireAdmin_1.requireAdmin, async (req, res) => {
    try {
        const allAppointments = await db_1.db.select().from(schema_1.appointments);
        const sorted = allAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        res.json(sorted);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});
router.patch('/admin/appointments/:id', requireAdmin_1.requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'סטטוס לא תקין' });
        }
        const [updated] = await db_1.db
            .update(schema_1.appointments)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(schema_1.appointments.id, id))
            .returning();
        if (!updated) {
            return res.status(404).json({ error: 'תור לא נמצא' });
        }
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});
exports.default = router;
