/**
 * Schema barrel
 *
 * Export every table/enum here so drizzle-kit can find them and so the rest
 * of the app can do:
 *   import { users, resourceItems } from '../db/schema/index.js';
 *
 * TODO: add exports for any new tables you create.
 */

export * from './users.js';
export * from './officials.js';
export * from './roles.js';
export * from './competencies.js';
export * from './evidence.js';
export * from './assessments.js';
export * from './recommendations.js';
export * from './resourceItems.js';
