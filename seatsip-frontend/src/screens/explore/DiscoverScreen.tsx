import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, MapPin, Star, TrendingUp, Clock, Compass } from 'lucide-react-native';
import { AppIcon } from '../../components/ui';

const CATEGORIES = [
  { id: '1', name: 'Fine Dining', icon: '🍽️', count: '24 places' },
  { id: '2', name: 'Cafes', icon: '☕', count: '42 places' },
  { id: '3', name: 'Fast Food', icon: '🍕', count: '18 places' },
  { id: '4', name: 'Healthy', icon: '🥗', count: '15 places' },
  { id: '5', name: 'Desserts', icon: '🍰', count: '31 places' },
  { id: '6', name: 'Rooftop', icon: '🌃', count: '8 places' },
];

const TRENDING_PLACES = [
  {
    id: '1',
    name: 'Spice Route Kitchen',
    type: 'Indian • ₹₹₹',
    rating: 4.6,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
    distance: '2.3 km',
  },
  {
    id: '2',
    name: 'The Pasta Bowl',
    type: 'Italian • ₹₹',
    rating: 4.3,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80',
    distance: '1.8 km',
  },
  {
    id: '3',
    name: 'Sushi Central',
    type: 'Japanese • ₹₹₹₹',
    rating: 4.8,
    reviews: 412,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
    distance: '3.1 km',
  },
];

const RECENT_SEARCHES = ['Biryani', 'Fine dining', 'Table for 4', 'Rooftop'];

const FEATURED_COLLECTIONS = [
  {
    id: '1',
    title: 'Date Night',
    subtitle: 'Romantic spots for two',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
    count: '12 places',
  },
  {
    id: '2',
    title: 'Work From Cafe',
    subtitle: 'Best cafes with WiFi',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
    count: '18 places',
  },
];

export default function DiscoverScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#F9F7F4' }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Discover</Text>
              <Text style={styles.subtitle}>Find your perfect spot</Text>
            </View>
            <TouchableOpacity style={styles.mapButton}>
              <MapPin size={20} color="#1a1a2e" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={18} color="#8e8e93" />
              <TextInput
                style={styles.searchInput}
                placeholder="Restaurants, cuisines, dishes..."
                value={query}
                onChangeText={setQuery}
                placeholderTextColor="#8e8e93"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <AppIcon name="close" size={16} color="#8e8e93" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Recent Searches */}
            {RECENT_SEARCHES.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Clock size={14} color="#9E9E9E" />
                  <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipScroll}
                >
                  {RECENT_SEARCHES.map((item, idx) => (
                    <TouchableOpacity key={idx} style={styles.chip}>
                      <Text style={styles.chipText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Categories */}
            <View style={styles.sectionHeader}>
              <Compass size={14} color="#9E9E9E" />
              <Text style={styles.sectionTitle}>BROWSE CATEGORIES</Text>
            </View>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat.id} style={styles.categoryCard}>
                  <AppIcon name={cat.icon} size={28} color="#8D6E63" style={styles.categoryIcon} />
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryCount}>{cat.count}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Featured Collections */}
            <View style={styles.sectionHeader}>
              <TrendingUp size={14} color="#9E9E9E" />
              <Text style={styles.sectionTitle}>FEATURED COLLECTIONS</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.collectionScroll}
            >
              {FEATURED_COLLECTIONS.map((collection) => (
                <TouchableOpacity key={collection.id} style={styles.collectionCard}>
                  <Image source={{ uri: collection.image }} style={styles.collectionImage} />
                  <View style={styles.collectionOverlay}>
                    <Text style={styles.collectionTitle}>{collection.title}</Text>
                    <Text style={styles.collectionSubtitle}>{collection.subtitle}</Text>
                    <View style={styles.collectionBadge}>
                      <Text style={styles.collectionCount}>{collection.count}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Trending Places */}
            <View style={styles.sectionHeader}>
              <TrendingUp size={14} color="#9E9E9E" />
              <Text style={styles.sectionTitle}>TRENDING NEAR YOU</Text>
            </View>
            {TRENDING_PLACES.map((place, idx) => (
              <TouchableOpacity key={place.id} style={styles.trendingItem}>
                <Image source={{ uri: place.image }} style={styles.trendingImage} />
                <View style={styles.trendingInfo}>
                  <Text style={styles.trendingName}>{place.name}</Text>
                  <Text style={styles.trendingMeta}>{place.type}</Text>
                  <View style={styles.trendingFooter}>
                    <View style={styles.ratingBadge}>
                      <Star size={12} color="#F57C00" fill="#F57C00" />
                      <Text style={styles.ratingText}>{place.rating}</Text>
                    </View>
                    <Text style={styles.reviewText}>({place.reviews})</Text>
                    <Text style={styles.distanceText}>• {place.distance}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            
            <View style={styles.bottomPadding} />
          </ScrollView>
        </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 4,
  },
  mapButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E9E9E',
    letterSpacing: 1,
  },
  chipScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  chipText: {
    fontSize: 13,
    color: '#5D4037',
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
  },
  categoryCount: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
  },
  collectionScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  collectionCard: {
    width: 280,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  collectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  collectionBadge: {
    position: 'absolute',
    top: -40,
    right: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  collectionCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  trendingImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  trendingInfo: {
    flex: 1,
    marginLeft: 14,
  },
  trendingName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  trendingMeta: {
    fontSize: 13,
    color: '#9E9E9E',
    marginTop: 2,
  },
  trendingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F57C00',
  },
  reviewText: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  distanceText: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  bottomPadding: {
    height: 24,
  },
});
