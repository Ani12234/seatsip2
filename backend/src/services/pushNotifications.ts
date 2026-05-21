import { env } from '../security/env';
import { prisma } from '../db';
import { secureLogger } from '../security/logger';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const PUSH_TIMEOUT_MS = 10_000;

export async function savePushToken(userId: string, token: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { push_token: token, push_token_updated_at: new Date() },
  });
}

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<void> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { push_token: true },
  });
  const to = row?.push_token;
  if (!to) return;

  const expoAccessToken = env('EXPO_ACCESS_TOKEN');
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
  };
  if (expoAccessToken) {
    headers.Authorization = `Bearer ${expoAccessToken}`;
  }

  const payload = {
    to,
    sound: 'default' as const,
    title,
    body,
    data,
    priority: 'high' as const,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PUSH_TIMEOUT_MS);

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      secureLogger.error('Expo push HTTP error', { status: res.status, body: text.slice(0, 500) });
      return;
    }

    const parsed = (await res.json().catch(() => null)) as { data?: unknown } | null;
    const raw = parsed?.data;
    const tickets = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object'
        ? [raw as { status?: string; details?: { error?: string } }]
        : [];
    for (const t of tickets) {
      if (t?.status === 'error' && t?.details?.error === 'DeviceNotRegistered') {
        await prisma.user.updateMany({
          where: { push_token: to },
          data: { push_token: null, push_token_updated_at: null },
        });
        break;
      }
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      secureLogger.error('Expo push request timed out', { userId, timeoutMs: PUSH_TIMEOUT_MS });
    } else {
      secureLogger.error('Push notification failed', err);
    }
  }
}
