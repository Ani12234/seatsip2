/**
 * Expo config — merges app.json and injects env-driven extras (EAS / local .env).
 * Set EXPO_PUBLIC_API_URL, EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in EAS secrets or .env.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const appJson = require('./app.json');

module.exports = () => ({
  ...appJson,
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      config: {
        ...(appJson.expo.android?.config || {}),
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || appJson.expo.android?.config?.googleMaps?.apiKey || '',
        },
      },
    },
    extra: {
      ...(appJson.expo.extra || {}),
      apiUrl: process.env.EXPO_PUBLIC_API_URL || '',
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      // iOS: use dedicated iOS OAuth client when set; otherwise fall back to web client (common for small apps).
      googleClientIdIos:
        process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      googleClientIdAndroid: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '',
      easProjectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || '',
    },
  },
});
