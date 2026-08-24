import { getDb } from '../config/database.js';

export { getDb };

/**
 * Proxy for db client that forwards calls to getDb() dynamically.
 * This allows controllers to use `import { db } from '../db/index.js'`
 * seamlessly after database connection initialization.
 */
export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const activeDb = getDb();
      const value = activeDb[prop];
      return typeof value === 'function' ? value.bind(activeDb) : value;
    },
  }
);
