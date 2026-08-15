"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const router = (0, express_1.Router)();
router.post('/analytics/pageview', async (req, res) => {
    try {
        const { path, visitorId } = req.body;
        if (!path || !visitorId) {
            return res.status(400).json({ error: 'חסרים פרטים' });
        }
        await db_1.db.insert(schema_1.pageViews).values({ path, visitorId });
        res.status(201).json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});
exports.default = router;
