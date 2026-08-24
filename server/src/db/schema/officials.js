import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { roles } from './roles.js';

export const officials = pgTable('officials', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),
  designation: text('designation').notNull(),
  department: text('department').notNull(), // e.g. DIID, NSSO, FOD, NAD
  cadre: text('cadre'), // e.g. ISS, SSS
  experienceYears: integer('experience_years').default(0),
  education: text('education'),
  preferredLanguage: text('preferred_language').default('en'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
