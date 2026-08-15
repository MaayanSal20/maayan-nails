import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  email: text('email'),
  password: text('password').notNull(),
  role: text('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  service: text('service').notNull(),
  date: timestamp('date').notNull(),
  status: text('status').default('pending').notNull(),
  guestName: text('guest_name').notNull(),
  guestPhone: text('guest_phone').notNull(),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const pageViews = pgTable('page_views', {
  id: uuid('id').defaultRandom().primaryKey(),
  path: text('path').notNull(),
  visitorId: text('visitor_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: text('price').notNull(),
  salePrice: text('sale_price'),
  saleNote: text('sale_note'),
  active: text('active').default('true').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})