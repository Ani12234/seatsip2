module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...(config.android?.config || {}),
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || config.android?.config?.googleMaps?.apiKey || '',
        },
      },
    },
    extra: {
      ...(config.extra || {}),
      apiUrl: process.env.EXPO_PUBLIC_API_URL || '',
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      googleClientIdIos:
        process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      googleClientIdAndroid: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '',
      easProjectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || '',
    },
  };
};
