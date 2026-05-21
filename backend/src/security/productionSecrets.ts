import { env } from './env';

const PLACEHOLDER_SUBSTRINGS = ['change-me', 'placeholder', 'your-secret', 'example', 'dev-access-secret'];

function isWeakSecret(value: string): boolean {
  const v = value.toLowerCase();
  if (v.length < 32) return true;
  return PLACEHOLDER_SUBSTRINGS.some((p) => v.includes(p));
}

/**
 * Call after dotenv / env is loaded. Exits the process in production when JWT secrets are missing or trivial.
 */
export function validateProductionSecrets(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const access = (env('JWT_ACCESS_SECRET_CURRENT') || env('JWT_SECRET') || '').trim();
  const refresh = (env('JWT_REFRESH_SECRET_CURRENT') || env('JWT_REFRESH_SECRET') || '').trim();

  if (!access || !refresh) {
    console.error(
      'FATAL: In production, set JWT_ACCESS_SECRET_CURRENT (or JWT_SECRET) and JWT_REFRESH_SECRET_CURRENT (each min 32 characters).'
    );
    process.exit(1);
  }
  if (isWeakSecret(access) || isWeakSecret(refresh)) {
    console.error('FATAL: JWT secrets in production must be at least 32 characters and must not use placeholder values.');
    process.exit(1);
  }
  if (access === refresh) {
    console.error('FATAL: JWT_REFRESH_SECRET_CURRENT must differ from JWT_ACCESS_SECRET_CURRENT in production.');
    process.exit(1);
  }
}
