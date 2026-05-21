import type { CookieOptions, Response } from 'express';

/** HttpOnly refresh cookie name (browser clients; native typically uses JSON body). */
export const REFRESH_COOKIE_NAME = 'seatsip_refresh';

function refreshCookiePath(): string {
  return '/api/v1/auth/refresh';
}

export function refreshCookieMaxAgeMs(): number {
  return Number(process.env.JWT_REFRESH_TTL_SECONDS || 30 * 24 * 60 * 60) * 1000;
}

/** True when client is likely a browser (Origin present) — omit refresh token from JSON and use httpOnly cookie. */
export function useBrowserRefreshCookie(req: { get(name: string): string | undefined }): boolean {
  const o = req.get('origin');
  return typeof o === 'string' && o.length > 0;
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  const prod = process.env.NODE_ENV === 'production';
  const crossSite = process.env.CORS_CREDENTIALS_CROSS_SITE === '1';
  const sameSite: CookieOptions['sameSite'] = prod && crossSite ? 'none' : 'lax';
  const secure = prod || crossSite;
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: refreshCookieMaxAgeMs(),
    path: refreshCookiePath(),
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  const prod = process.env.NODE_ENV === 'production';
  const crossSite = process.env.CORS_CREDENTIALS_CROSS_SITE === '1';
  res.clearCookie(REFRESH_COOKIE_NAME, {
    path: refreshCookiePath(),
    httpOnly: true,
    secure: prod || crossSite,
    sameSite: prod && crossSite ? 'none' : 'lax',
  });
}
