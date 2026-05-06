import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AppIcon from '../../components/ui/AppIcon';

const MENU_CARDS = [
  {
    id: '1',
    title: 'Main Menu',
    description: 'A wide variety of meals to satisfy every craving.',
    time: '48 mins',
    timeColor: '#2D6A4F',
    timeBg: '#D8F3DC',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
  },
  {
    id: '2',
    title: 'Express Menu',
    description: 'Quick bites and favorites, delivered in no time.',
    time: '2 hrs',
    timeColor: '#7B4F00',
    timeBg: '#FFE8A3',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
  },
  {
    id: '3',
    title: 'Custom Cakes',
    description: 'Beautiful, delicious cakes made just for you.',
    time: '72 hrs',
    timeColor: '#4A1A7A',
    timeBg: '#E0C3FC',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  },
  {
    id: '4',
    title: 'Hot Pies',
    description: 'Warm, crispy & packed with flavor. Perfect anytime!',
    time: '3 hrs',
    timeColor: '#7A1A00',
    timeBg: '#FFD6CC',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Sub-components ───────────────────────────────────────────────────────────

const MenuCard = ({ item, onPress }: { item: any, onPress: () => void }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
    <Image
      source={{ uri: item.image }}
      style={styles.cardImage}
      resizeMode="cover"
    />
    <View style={styles.cardOverlay} />

    <View style={[styles.timeBadge, { backgroundColor: item.timeBg }]}>
      <AppIcon name="time" size={12} color={item.timeColor} />
      <Text style={[styles.timeText, { color: item.timeColor }]}>{item.time}</Text>
    </View>

    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc}>{item.description}</Text>
      <View style={styles.arrowBtn}>
        <AppIcon name="→" size={18} color="#FFFFFF" />
      </View>
    </View>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ExploreScreen() {
  const navigation = useNavigation<Nav>();
  const [searchText, setSearchText] = useState('');

  const handleCardPress = (title: string) => {
    navigation.navigate('Menu', { 
      cafeId: title.toLowerCase().replace(' ', '_'), 
      cafeName: title 
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Explore</Text>
            <Text style={styles.headerSub}>Discover delicious food, delivered fast</Text>
          </View>
          <TouchableOpacity 
            style={styles.bellBtn} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('NotificationsScreen')}
          >
            <AppIcon name="notification" size={18} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchBar}>
          <AppIcon name="search" size={16} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search the full catalog"
            placeholderTextColor="#AAAAAA"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity>
            <AppIcon name="filter" size={18} color="#555" />
          </TouchableOpacity>
        </View>

        {/* ── Menu Cards ── */}
        <View style={styles.cardList}>
          {MENU_CARDS.map((item) => (
            <MenuCard 
              key={item.id} 
              item={item} 
              onPress={() => handleCardPress(item.title)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F0EB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 4,
  },
  bellIcon: {
    fontSize: 18,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  filterIcon: {
    fontSize: 18,
    color: '#555',
  },

  // Cards
  cardList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  cardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  timeBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
    gap: 4,
  },
  timeClock: {
    fontSize: 12,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: 12,
    maxWidth: '60%',
  },
  arrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
