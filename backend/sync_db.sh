#!/bin/bash
set -e
echo "Starting DB sync..."
rm -f seatsip.db seatsip.db-shm seatsip.db-wal
./node_modules/.bin/prisma db push --accept-data-loss
./node_modules/.bin/prisma generate
npx ts-node src/db/seed.ts
echo "DB sync complete!"
