import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

export const urlsTable = pgTable('urls', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  original_url: varchar().notNull(),
  short_url: varchar().notNull().unique(),
  access_count: integer().notNull().default(0),
  created_at: timestamp({ withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

const dbSchema = { urlsTable };
export default dbSchema;
