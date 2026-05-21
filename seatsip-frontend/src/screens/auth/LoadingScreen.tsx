import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth infinite loading animation for the bar
    const startAnimation = () => {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
      }).start(() => startAnimation());
    };
    startAnimation();
  }, [progress]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={require('../../../assets/images/loading_bg.png')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.branding}>
              <Text style={styles.logoText}>SEAT<Text style={{color: '#8B9D5E'}}>SIP</Text></Text>
              <Text style={styles.subtitle}>CRAFTING YOUR EXPERIENCE</Text>
            </View>

            <View style={styles.loaderWrapper}>
              <BlurView intensity={30} tint="light" style={styles.loaderTrack}>
                <Animated.View style={[styles.loaderBar, { width: barWidth }]} />
              </BlurView>
              <Text style={styles.loadingText}>Preparing your table...</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bgImage: {
    width,
    height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 10,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 4,
    marginTop: 8,
    fontWeight: '600',
  },
  loaderWrapper: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  loaderTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  loaderBar: {
    height: '100%',
    backgroundColor: '#8B9D5E',
    borderRadius: 3,
    shadowColor: '#8B9D5E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    letterSpacing: 1,
  },
});
