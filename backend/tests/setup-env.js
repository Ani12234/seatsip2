/** Runs before any test file (Jest setupFiles). */
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET_CURRENT = 'jest-access-secret-min-32-chars-long!!';
process.env.JWT_REFRESH_SECRET_CURRENT = 'jest-refresh-secret-min-32-chars-long!!';

/** PostgreSQL URL for integration tests (override in CI). */
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@127.0.0.1:5432/seatsip_test?schema=public';
}
