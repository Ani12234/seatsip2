import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const Divider = () => <View style={styles.divider} />;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  
  const recentSearches = ['Biryani', 'Fine dining', 'Table for 4', 'Roof top'];
  const categories = [
    { icon: '🍽️', name: 'Restaurants' },
    { icon: '☕', name: 'Cafes' },
    { icon: '🍕', name: 'Fast Food' },
    { icon: '🥗', name: 'Healthy' },
    { icon: '🍰', name: 'Desserts' },
    { icon: '🍹', name: 'Bars' },
  ];
  
  const trending = [
    { name: 'Spice Route Kitchen', type: 'Indian • ₹₹₹', rating: '4.6' },
    { name: 'The Pasta Bowl', type: 'Italian • ₹₹', rating: '4.3' },
    { name: 'Sushi Central', type: 'Japanese • ₹₹₹₹', rating: '4.8' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Search</Text>
      
      <View style={styles.searchBar}>
        <Text>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Restaurants, cuisines, dishes..."
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader title="RECENT SEARCHES" />
        <View style={styles.chipRow}>
          {recentSearches.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.chip}>
              <Text style={styles.chipText}>🕒 {item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <SectionHeader title="BROWSE CATEGORIES" />
        <View style={styles.categoryGrid}>
          {categories.map((cat, idx) => (
            <TouchableOpacity key={idx} style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <SectionHeader title="TRENDING NEAR YOU" />
        {trending.map((item, idx) => (
          <View key={idx}>
            <TouchableOpacity style={styles.trendingItem}>
              <View style={styles.trendingImagePlaceholder}>
                <Text>🍽️</Text>
              </View>
              <View style={styles.trendingInfo}>
                <Text style={styles.trendingName}>{item.name}</Text>
                <Text style={styles.trendingMeta}>{item.type}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {item.rating}</Text>
              </View>
            </TouchableOpacity>
            {idx < trending.length - 1 && <Divider />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F7F4' },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: '#9E9E9E', letterSpacing: 1, marginTop: 24, marginBottom: 8, paddingHorizontal: 20 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1A1A1A' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 8 },
  chip: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#EFEBE6' },
  chipText: { fontSize: 13, color: '#5D4037', fontWeight: '500' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  categoryCard: { width: '30%', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  categoryIcon: { fontSize: 28, marginBottom: 8 },
  categoryName: { fontSize: 13, fontWeight: '500', color: '#424242' },
  trendingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  trendingImagePlaceholder: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#EFEBE6', alignItems: 'center', justifyContent: 'center' },
  trendingInfo: { flex: 1, marginLeft: 14 },
  trendingName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  trendingMeta: { fontSize: 13, color: '#9E9E9E', marginTop: 2 },
  ratingBadge: { backgroundColor: '#FFF8E1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#F57C00' },
});
