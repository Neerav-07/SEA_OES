import { boolean, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['free', 'pro']);

/**
 * V2: platformRole distinguishes ADMIN (training coordinator / NSSTA admin)
 * from EMPLOYEE (government official / learner). Replaces the previous
 * multi-role management system — only 2 roles per Mission Karmayogi FRAC model.
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  refreshTokenHash: text('refresh_token_hash'),
  plan: planEnum('plan').default('free').notNull(),
  // V2: 2-role platform access model
  platformRole: text('platform_role').default('EMPLOYEE').notNull(), // 'ADMIN' | 'EMPLOYEE'
  // V2: FRAC-linked identity fields (captured at registration)
  designation: text('designation'), // e.g. 'Senior Statistical Officer'
  department: text('department'),   // e.g. 'DIID', 'NSSO', 'FOD', 'NAD'
  cadre: text('cadre'),             // e.g. 'ISS', 'SSS', 'CSS'
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  notifyOnHighPriority: boolean('notify_on_high_priority').default(true).notNull(),
  notifyDigest: boolean('notify_digest').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
