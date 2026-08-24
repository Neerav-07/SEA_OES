import { boolean, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['free', 'pro']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  refreshTokenHash: text('refresh_token_hash'),
  plan: planEnum('plan').default('free').notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  notifyOnHighPriority: boolean('notify_on_high_priority').default(true).notNull(),
  notifyDigest: boolean('notify_digest').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
