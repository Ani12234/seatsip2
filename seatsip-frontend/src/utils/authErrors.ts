import { AxiosError } from 'axios';

/** Turns API validation / auth errors into a single user-facing string. */
export function formatAuthApiError(err: unknown): string {
  if (!err || typeof err !== 'object') return 'Something went wrong. Please try again.';
  const ax = err as AxiosError<{ message?: string; errors?: { fieldErrors?: Record<string, string[]> } }>;
  const data = ax.response?.data;
  if (data?.message && typeof data.message === 'string') return data.message;
  const fe = data?.errors?.fieldErrors;
  if (fe && typeof fe === 'object') {
    const parts: string[] = [];
    for (const [, msgs] of Object.entries(fe)) {
      if (Array.isArray(msgs) && msgs[0]) parts.push(String(msgs[0]));
    }
    if (parts.length) return parts.join(' ');
  }
  if (ax.message) return ax.message;
  return 'Something went wrong. Please try again.';
}
