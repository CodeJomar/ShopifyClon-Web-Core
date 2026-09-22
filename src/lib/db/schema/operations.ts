import { pgTable, serial, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { auditFields } from './core';

export const tables = pgTable('tables', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  capacity: integer('capacity').notNull().default(2),
  isAvailable: boolean('is_available').default(true).notNull(),
  ...auditFields,
});