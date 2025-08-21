import { faker } from '@faker-js/faker';
import { reset } from 'drizzle-seed';
import { db } from './index.ts';
import dbSchema from './schema.ts';

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
