import { OAuth2Client } from 'google-auth-library';
import { env } from '../security/env';

let client: OAuth2Client | null = null;

function googleAudiences(): string[] {
  const ids = [
    env('GOOGLE_CLIENT_ID'),
    env('GOOGLE_CLIENT_ID_WEB'),
    env('GOOGLE_CLIENT_ID_IOS'),
    env('GOOGLE_CLIENT_ID_ANDROID'),
  ].filter((v): v is string => !!v && v.length > 0);
  return [...new Set(ids)];
}

export function isGoogleAuthConfigured(): boolean {
  return googleAudiences().length > 0;
}

export async function verifyGoogleIdToken(idToken: string) {
  const audiences = googleAudiences();
  if (!audiences.length) {
    throw new Error('Google Sign-In is not configured (missing GOOGLE_CLIENT_ID*)');
  }
  if (!client) {
    client = new OAuth2Client();
  }
  const ticket = await client.verifyIdToken({
    idToken,
    audience: audiences.length === 1 ? audiences[0] : audiences,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new Error('Invalid Google token: no email');
  }
  return {
    email: String(payload.email).toLowerCase(),
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture || null,
    googleId: payload.sub,
    /** Google marks whether the email is verified on their side (required for linking to password accounts). */
    emailVerified: Boolean(payload.email_verified),
  };
}
