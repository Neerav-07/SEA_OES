import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const sourceDocuments = pgTable('source_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  externalId: text('external_id'),
  name: text('name').notNull(),
  documentType: text('document_type').default('PDF').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  externalIdIdx: index('source_documents_external_id_idx').on(table.externalId),
}));

export const sourceDocumentVersions = pgTable('source_document_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => sourceDocuments.id, { onDelete: 'cascade' }).notNull(),
  version: integer('version').default(1).notNull(),
  checksum: text('checksum'),
  status: text('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  documentIdx: index('source_document_versions_document_idx').on(table.documentId),
  documentStatusIdx: index('source_document_versions_document_status_idx').on(table.documentId, table.status),
}));

export const sourceChunks = pgTable('source_chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentVersionId: uuid('document_version_id').references(() => sourceDocumentVersions.id, { onDelete: 'cascade' }).notNull(),
  chunkReference: text('chunk_reference').notNull(),
  pageNumber: integer('page_number'),
  sectionReference: text('section_reference'),
  text: text('text').notNull(),
  textStart: integer('text_start'),
  textEnd: integer('text_end'),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  documentVersionIdx: index('source_chunks_document_version_idx').on(table.documentVersionId),
  pageIdx: index('source_chunks_page_idx').on(table.documentVersionId, table.pageNumber),
}));