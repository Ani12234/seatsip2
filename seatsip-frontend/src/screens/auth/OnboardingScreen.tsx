import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { PhoneOff, ArrowRight } from 'lucide-react-native';
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <View style={styles.logoText}>
            <Text style={styles.logoSeat}>SEAT</Text>
            <Text style={styles.logoSip}>SIP</Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          {/* Background Glow Effects */}
          <View style={styles.glow1} />
          <View style={styles.glow2} />

          {/* Digital Detox Badge */}
          <View style={styles.badge}>
            <PhoneOff size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.badgeText}>Digital Detox Zone</Text>
          </View>

          {/* Main Title */}
          <Text style={styles.mainTitle}>SEAT</Text>
          <Text style={styles.subTitle}>SIP</Text>

          {/* Description */}
          <Text style={styles.description}>
            Disconnect to reconnect. A café designed for presence, 
            conversation, and the lost art of doing nothing.
          </Text>

        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* START Button - Fixed at bottom */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={styles.primaryBtn}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.primaryBtnText}>START</Text>
          <ArrowRight size={18} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // Navigation Bar
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(10,10,10,0.8)',
  },
  logoText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSeat: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  logoSip: {
    fontSize: 24,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: -1,
  },
  
  // Hero Section
  hero: {
    paddingHorizontal: 24,
    paddingTop: 20,
    position: 'relative',
  },
  glow1: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  glow2: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 24,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  mainTitle: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 70,
    letterSpacing: -2,
  },
  subTitle: {
    fontSize: 72,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 70,
    letterSpacing: -2,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 24,
    maxWidth: 320,
    marginBottom: 32,
  },
  
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  primaryBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  
  bottomSpacing: {
    height: 100,
  },
  
  // Bottom Button
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
});
