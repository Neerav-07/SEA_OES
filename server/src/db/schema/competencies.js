import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const competencies = pgTable('competencies', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').unique().notNull(), // e.g. SAMPLING_DESIGN, PRICE_STATS
  name: text('name').notNull(),
  category: text('category').notNull(), // Statistical, Technical, Digital Governance, Behavioural
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
