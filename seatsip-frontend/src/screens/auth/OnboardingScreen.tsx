import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, StatusBar, ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius } from '../../theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '☕',
    title: 'Discover Your\nPerfect Café',
    subtitle: 'Find cafés that match your mood — whether you want to work, date, or just chill.',
    bg: '#2C1810',
  },
  {
    id: '2',
    emoji: '🪑',
    title: 'Reserve Your\nTable Instantly',
    subtitle: 'Book a table in seconds. Choose your spot, pick a time, and pre-order your favourites.',
    bg: '#1A0F08',
  },
  {
    id: '3',
    emoji: '🛍️',
    title: 'Order Before\nYou Arrive',
    subtitle: 'Pre-order from the menu so your food is ready the moment you sit down.',
    bg: '#2C1810',
  },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(prev => prev + 1);
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <FlatList
        ref={flatRef}
        data={slides}
        keyExtractor={s => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: item.bg }]}>
            <View style={styles.slide_content}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dot_active]} />
          ))}
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.next_btn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.next_text}>
            {activeIndex === slides.length - 1 ? "Let's Go →" : 'Next →'}
          </Text>
        </TouchableOpacity>

        {activeIndex < slides.length - 1 && (
          <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.skip_btn}>
            <Text style={styles.skip_text}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logo */}
      <View style={styles.logo_row}>
        <Text style={styles.logo}>☕ SeatSip</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center' },
  slide_content: { alignItems: 'center', paddingHorizontal: 40, marginTop: 60 },
  emoji: { fontSize: 80, marginBottom: 32 },
  title: {
    fontSize: Typography['3xl'], fontWeight: Typography.extrabold,
    color: Colors.white, textAlign: 'center', lineHeight: 44, marginBottom: 20,
  },
  subtitle: {
    fontSize: Typography.base, color: Colors.cream, textAlign: 'center',
    lineHeight: 24, opacity: 0.85,
  },
  bottom: {
    position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 32,
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white, opacity: 0.3 },
  dot_active: { width: 28, opacity: 1, backgroundColor: Colors.accent },
  next_btn: {
    backgroundColor: Colors.accent, width: '100%', height: 56,
    borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center',
  },
  next_text: { color: Colors.white, fontSize: Typography.md, fontWeight: Typography.bold },
  skip_btn: { marginTop: 16, padding: 8 },
  skip_text: { color: Colors.white, opacity: 0.6, fontSize: Typography.base },
  logo_row: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center' },
  logo: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.cream, opacity: 0.8 },
});
