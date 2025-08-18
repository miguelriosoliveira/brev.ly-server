import { faker } from '@faker-js/faker';
import { drizzle } from 'drizzle-orm/node-postgres';
import { reset } from 'drizzle-seed';
import { env } from '../env.ts';
// biome-ignore lint/performance/noNamespaceImport: need to whole db schema
import * as dbSchema from './schema.ts';

const db = drizzle(env.DATABASE_URL);

async function main() {
  await reset(db, dbSchema);

  const data: (typeof dbSchema.urlsTable.$inferInsert)[] = [];

  for (let i = 0; i < 10; i++) {
    data.push({
      original_url: faker.internet.url(),
      short_url: faker.internet.domainWord(),
    });
  }

  await db.insert(dbSchema.urlsTable).values(data);
}

main();
