import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const urlsTable = pgTable('urls', {
  id: uuid().primaryKey().defaultRandom(),
  original_url: varchar().notNull(),
  short_url: varchar().notNull().unique(),
  access_count: integer().notNull().default(0),
  created_at: timestamp({ withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});
