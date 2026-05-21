import { Platform } from 'react-native';

// Native security modules only available on iOS/Android
const JailMonkey = Platform.OS !== 'web' ? require('jail-monkey').default : null;
const ReactNativeBiometrics = Platform.OS !== 'web' ? require('react-native-biometrics').default : null;

export function getDeviceRisk() {
  if (Platform.OS === 'web') {
    return { rootedOrJailbroken: false, debugged: false };
  }
  return {
    rootedOrJailbroken: JailMonkey.isJailBroken(),
    debugged: JailMonkey.isDebuggedMode(),
  };
}

export async function requireBiometric(reason: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    void reason;
    if (typeof window === 'undefined') return false;
    if (!('PublicKeyCredential' in window)) return false;
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          allowCredentials: [],
          userVerification: 'required',
          timeout: 60000,
        } as PublicKeyCredentialRequestOptions,
      });
      return !!credential;
    } catch {
      return false;
    }
  }
  const biometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
  const available = await biometrics.isSensorAvailable();
  if (!available.available) return true;
  const result = await biometrics.simplePrompt({ promptMessage: reason });
  return result.success;
}
