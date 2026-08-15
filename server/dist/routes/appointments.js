"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const router = (0, express_1.Router)();
router.post('/appointments', async (req, res) => {
    try {
        const { service, date, guestName, guestPhone, userId } = req.body;
        if (!service || !date || !guestName || !guestPhone) {
            return res.status(400).json({ error: 'חסרים פרטים חובה' });
        }
        const [newAppointment] = await db_1.db
            .insert(schema_1.appointments)
            .values({
            service,
            date: new Date(date),
            guestName,
            guestPhone,
            userId: userId || null,
        })
            .returning();
        res.status(201).json(newAppointment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});
router.get('/appointments/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userAppointments = await db_1.db
            .select()
            .from(schema_1.appointments)
            .where((0, drizzle_orm_1.eq)(schema_1.appointments.userId, userId));
        res.json(userAppointments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});
const WORKING_HOURS = ['09:00', '11:00', '13:00', '15:00', '17:00'];
router.get('/appointments/available', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: 'חסר תאריך' });
        }
        const allAppointments = await db_1.db.select().from(schema_1.appointments);
        const bookedTimes = allAppointments
            .filter((a) => {
            if (a.status === 'cancelled')
                return false;
            const apptDate = new Date(a.date).toLocaleDateString('en-CA', {
                timeZone: 'Asia/Jerusalem',
            });
            return apptDate === date;
        })
            .map((a) => new Date(a.date).toLocaleTimeString('he-IL', {
            timeZone: 'Asia/Jerusalem',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }));
        const availableSlots = WORKING_HOURS.filter((slot) => !bookedTimes.includes(slot));
        res.json(availableSlots);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});
exports.default = router;
