import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null; info: ErrorInfo | null };

export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info });
    if (__DEV__) {
      console.error('[RootErrorBoundary]', error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ error: null, info: null });
  };

  render() {
    const { error, info } = this.state;
    if (error) {
      return (
        <View style={styles.root}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.sub}>Please restart the app. If this keeps happening, contact support.</Text>
          <ScrollView style={styles.box}>
            <Text style={styles.mono}>{error.message}</Text>
            {info?.componentStack ? (
              <Text style={[styles.mono, styles.small]}>{info.componentStack}</Text>
            ) : null}
          </ScrollView>
          <TouchableOpacity style={styles.btn} onPress={this.handleReset} accessibilityRole="button" accessibilityLabel="Try again">
            <Text style={styles.btnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F5F0EB' },
  title: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
  sub: { fontSize: 15, color: '#555', marginBottom: 16 },
  box: { maxHeight: 200, marginBottom: 20, backgroundColor: '#fff', padding: 12, borderRadius: 8 },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: undefined }), fontSize: 12, color: '#333' },
  small: { marginTop: 8, fontSize: 11 },
  btn: { backgroundColor: '#2C1A0E', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
