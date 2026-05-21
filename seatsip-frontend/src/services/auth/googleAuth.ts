import { useMemo } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import type { AuthSessionResult } from 'expo-auth-session';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

type GoogleExtra = {
  googleClientId?: string;
  googleClientIdIos?: string;
  googleClientIdAndroid?: string;
};

export function readGoogleAuthExtra(): GoogleExtra {
  return (Constants.expoConfig?.extra || {}) as GoogleExtra;
}

/**
 * Metro inlines EXPO_PUBLIC_* at bundle time. On web dev, `Constants.expoConfig.extra`
 * can be empty while env vars are still set — merge both so `webClientId` is never missing.
 */
function readExpoPublicGoogleEnv(): { web: string; android: string; ios: string } {
  // @ts-ignore
  const env = typeof process !== 'undefined' ? process.env : {};
  return {
    web: String(env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '').trim(),
    android: String(env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '').trim(),
    ios: String(env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '').trim(),
  };
}

/** Real Google OAuth client IDs (no placeholders). */
export function resolveGoogleClientIds(): {
  webId: string;
  androidId: string;
  iosId: string;
  /** Best client id to pass as Expo `webClientId` (required on web). */
  webClientId: string;
} {
  const extra = readGoogleAuthExtra();
  const env = readExpoPublicGoogleEnv();
  const webId = (extra.googleClientId || env.web || '').trim();
  const androidId = (extra.googleClientIdAndroid || env.android || '').trim();
  const iosId = (extra.googleClientIdIos || env.ios || webId || androidId || '').trim();
  const webClientId = (webId || androidId || iosId || '').trim();
  return { webId, androidId, iosId, webClientId };
}

export function isGoogleClientConfigured(): boolean {
  const { webId, androidId, iosId } = resolveGoogleClientIds();
  return !!(webId || androidId || iosId);
}

/** Satisfies Expo invariant on web when no real id is set (button stays disabled). */
const MISSING_WEB_CLIENT_PLACEHOLDER = '000000000000-missing.apps.googleusercontent.com';

function extractIdToken(result: AuthSessionResult): string | null {
  if (result.type !== 'success') return null;
  const r = result as AuthSessionResult & {
    params?: Record<string, string>;
    authentication?: { idToken?: string; accessToken?: string };
  };
  const p = r.params || {};
  const fromParams = p.id_token || p.idToken;
  if (fromParams) return fromParams;
  const auth = r.authentication;
  if (auth?.idToken) return auth.idToken;
  return null;
}

/** Call from a React component only (uses hooks). */
export function useGoogleIdTokenAuth() {
  const { webId, androidId, iosId, webClientId: resolved } = resolveGoogleClientIds();
  // expo-auth-session: `webClientId` must be a non-empty string on web (never undefined).
  const webClientIdForExpo = resolved || MISSING_WEB_CLIENT_PLACEHOLDER;

  // Google Error 400 redirect_uri_mismatch: redirect_uri must exactly match an entry under the
  // *Web* OAuth client's "Authorized redirect URIs" (and origin under "Authorized JavaScript origins").
  const oauthRedirectUri = useMemo(() => {
    if (Platform.OS !== 'web') return undefined;
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return makeRedirectUri({ preferLocalhost: true });
  }, []);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: webClientIdForExpo,
    iosClientId: iosId || webId || androidId || undefined,
    androidClientId: androidId || undefined,
    ...(oauthRedirectUri ? { redirectUri: oauthRedirectUri } : {}),
  });

  const promptForIdToken = async (): Promise<string> => {
    if (!isGoogleClientConfigured()) {
      throw new Error('Google Sign-In is not configured. Set EXPO_PUBLIC_GOOGLE_CLIENT_ID (and Android/iOS IDs) in .env and restart Expo.');
    }
    if (!request) {
      throw new Error('Google Sign-In is still initializing. Try again in a moment.');
    }
    const result = await promptAsync({ showInRecents: true });
    if (result.type === 'success') {
      const idToken = extractIdToken(result);
      if (idToken && idToken.length >= 100) return idToken;
    }
    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Google sign-in was cancelled');
    }
    throw new Error('Google sign-in did not return an ID token. Check OAuth client IDs (web + iOS + Android) in Google Cloud and EAS env.');
  };

  return { request, response, promptAsync, promptForIdToken };
}
