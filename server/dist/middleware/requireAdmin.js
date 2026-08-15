"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
async function requireAdmin(req, res, next) {
    try {
        const userId = req.header('x-user-id');
        if (!userId) {
            return res.status(401).json({ error: 'נדרשת התחברות' });
        }
        const foundUsers = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        const user = foundUsers[0];
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'אין הרשאה' });
        }
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאת שרת' });
    }
}
