import { faker } from '@faker-js/faker';
import { reset } from 'drizzle-seed';
import { db } from './index.ts';
import dbSchema from './schema.ts';

type UrlInsert = typeof dbSchema.urlsTable.$inferInsert;

export async function seed(count: number) {
  await reset(db, dbSchema);

  if (count <= 0) {
    return;
  }

  const urls: UrlInsert[] = Array.from({ length: count }, () => ({
    original_url: faker.internet.url(),
    short_url: faker.internet.domainWord(),
    access_count: faker.number.int({ min: 0, max: 9999 }),
  }));

  await db.insert(dbSchema.urlsTable).values(urls);
}
