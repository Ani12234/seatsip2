import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cafesApi } from '../../services/api';
import { Cafe } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import { CafeCard } from '../../components/cards/CafeCard';
import { EmptyState } from '../../components/ui';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SORT_OPTIONS = [
  { id: 'rating', label: '⭐ Rating' },
  { id: 'name', label: '🔤 Name' },
  { id: 'price', label: '💰 Price' },
];

const MOOD_FILTERS = [
  { id: '', label: 'All' },
  { id: 'work', label: '💻 Work' },
  { id: 'date', label: '💕 Date' },
  { id: 'chill', label: '😌 Chill' },
  { id: 'art', label: '🎨 Art' },
  { id: 'rooftop', label: '🌆 Rooftop' },
  { id: 'breakfast', label: '🍳 Breakfast' },
];

export default function ExploreScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState('rating');
  const [mood, setMood] = useState('');
  const [total, setTotal] = useState(0);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await cafesApi.list({
        search: query || undefined,
        mood: mood || undefined,
        sort,
        limit: 30,
      });
      setCafes(data.data);
      setTotal(data.meta.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query, mood, sort]);

  useEffect(() => {
    const t = setTimeout(search, 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.headerArea}>
        <Text style={styles.title}>Explore Cafés</Text>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, area…"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mood filter chips */}
        <FlatList
          data={MOOD_FILTERS}
          keyExtractor={i => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setMood(item.id)}
              style={[styles.chip, mood === item.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, mood === item.id && styles.chipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Sort */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort:</Text>
          {SORT_OPTIONS.map(o => (
            <TouchableOpacity
              key={o.id}
              onPress={() => setSort(o.id)}
              style={[styles.sortBtn, sort === o.id && styles.sortBtnActive]}
            >
              <Text style={[styles.sortText, sort === o.id && styles.sortTextActive]}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.resultCount}>{total} cafés found</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 40 }} />
      ) : cafes.length === 0 ? (
        <EmptyState emoji="🔍" title="No cafés found" subtitle="Try a different search or mood filter" />
      ) : (
        <FlatList
          data={cafes}
          keyExtractor={c => c.id}
          renderItem={({ item }) => (
            <CafeCard cafe={item} onPress={() => navigation.navigate('CafeDetail', { cafeId: item.id })} />
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  headerArea: {
    paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Typography['2xl'], fontWeight: Typography.extrabold,
    color: Colors.textPrimary, paddingTop: Spacing.md, marginBottom: Spacing.md,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    paddingHorizontal: Spacing.base, height: 50,
    marginBottom: Spacing.md, ...Shadow.sm,
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary },
  clearBtn: { fontSize: 16, color: Colors.textMuted, padding: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  chipTextActive: { color: Colors.white },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.sm },
  sortLabel: { fontSize: Typography.sm, color: Colors.textMuted },
  sortBtn: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
  },
  sortBtnActive: { backgroundColor: Colors.accent },
  sortText: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.medium },
  sortTextActive: { color: Colors.white },
  resultCount: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 8, marginBottom: 4 },
});
