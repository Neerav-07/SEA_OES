import { index, integer, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { assessments, questions } from './assessments.js';

export const assessmentQuestionItems = pgTable('assessment_question_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  assessmentId: uuid('assessment_id').references(() => assessments.id, { onDelete: 'cascade' }).notNull(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'restrict' }).notNull(),
  questionVersionId: uuid('question_version_id').notNull(),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  assessmentPositionUnique: uniqueIndex('assessment_question_items_position_uidx').on(table.assessmentId, table.position),
  assessmentQuestionUnique: uniqueIndex('assessment_question_items_question_uidx').on(table.assessmentId, table.questionId),
  assessmentIdx: index('assessment_question_items_assessment_idx').on(table.assessmentId),
  questionVersionIdx: index('assessment_question_items_question_version_idx').on(table.questionVersionId),
}));
