/**
 * Legacy entrypoint. Schema is managed with Prisma CLI.
 * Use `npm run db:push` (dev) or `npm run db:migrate` (apply migrations in deploy).
 */
import { initDb, prisma } from './index';

async function main() {
  await initDb();
  await prisma.$disconnect();
  console.log('Schema: prisma/schema.prisma — run npm run db:push or npm run db:migrate');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
