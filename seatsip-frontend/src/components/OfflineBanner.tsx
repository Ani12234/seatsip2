import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) => {
      const connected = state.isConnected === true && state.isInternetReachable !== false;
      setOffline(!connected && state.isConnected !== null);
    });
    NetInfo.fetch().then((state) => {
      const connected = state.isConnected === true && state.isInternetReachable !== false;
      setOffline(!connected);
    });
    return () => sub();
  }, []);

  if (!offline || Platform.OS === 'web') return null;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#B71C1C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
