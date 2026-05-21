import React, { useEffect, useState } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

export function SecureAppShell({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setHidden(state !== 'active');
    });
    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.root}>
      {children}
      {hidden ? <BlurView style={StyleSheet.absoluteFill} intensity={80} tint="light" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

