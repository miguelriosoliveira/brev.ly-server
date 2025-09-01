import { faker } from '@faker-js/faker';
import { reset } from 'drizzle-seed';
import { db } from './index.ts';
import dbSchema, { urlsTable } from './schema.ts';

type UrlInsert = typeof dbSchema.urlsTable.$inferInsert;

export async function seed(count: number) {
  if (count <= 0) {
    return;
  }

  await reset(db, urlsTable);

  const urls: UrlInsert[] = Array.from({ length: count }, () => ({
    original_url: faker.internet.url(),
    short_url: faker.internet.domainWord(),
  }));

  await db.insert(dbSchema.urlsTable).values(urls);
}
