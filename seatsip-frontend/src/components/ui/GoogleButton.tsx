import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface GoogleButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ onPress, disabled, loading, style }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: false, friction: 6 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: false, friction: 6 }).start();
  };

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
        accessibilityHint="Opens Google sign-in to use your Google account"
        accessibilityState={{ disabled: !!isDisabled }}
        android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
        style={({ pressed }) => [
          styles.button,
          isDisabled ? styles.buttonDisabled : null,
          pressed && Platform.OS === 'ios' ? styles.pressedIos : null,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#444" style={{ marginRight: 8 }} />
        ) : (
          <View style={styles.svgContainer}>
            <Svg viewBox="0 0 256 262" width={22} height={22}>
              <Path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
              <Path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
              <Path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" />
              <Path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
            </Svg>
          </View>
        )}
        <Text style={styles.text}>{loading ? 'Signing in…' : 'Continue with Google'}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    backgroundColor: '#fff',
    gap: 10,
    minHeight: 52,
  },
  pressedIos: {
    opacity: 0.92,
  },
  svgContainer: {
    height: 24,
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3c4043',
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
