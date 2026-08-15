"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.services = exports.pageViews = exports.appointments = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    phone: (0, pg_core_1.text)('phone').notNull().unique(),
    email: (0, pg_core_1.text)('email'),
    password: (0, pg_core_1.text)('password').notNull(),
    role: (0, pg_core_1.text)('role').default('user').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.appointments = (0, pg_core_1.pgTable)('appointments', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    service: (0, pg_core_1.text)('service').notNull(),
    date: (0, pg_core_1.timestamp)('date').notNull(),
    status: (0, pg_core_1.text)('status').default('pending').notNull(),
    guestName: (0, pg_core_1.text)('guest_name').notNull(),
    guestPhone: (0, pg_core_1.text)('guest_phone').notNull(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.pageViews = (0, pg_core_1.pgTable)('page_views', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    path: (0, pg_core_1.text)('path').notNull(),
    visitorId: (0, pg_core_1.text)('visitor_id').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.services = (0, pg_core_1.pgTable)('services', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    price: (0, pg_core_1.text)('price').notNull(),
    salePrice: (0, pg_core_1.text)('sale_price'),
    saleNote: (0, pg_core_1.text)('sale_note'),
    active: (0, pg_core_1.text)('active').default('true').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
