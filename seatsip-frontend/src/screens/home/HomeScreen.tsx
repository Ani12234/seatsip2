import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, RefreshControl, StatusBar, useColorScheme, Platform, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { cafesApi } from '../../services/api';
import { Cafe, MenuItem } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { SpecialMenuBanner, OpenTodayBanner, BuyOneGetOneBanner } from './PromoBanners';
import { cafesApi as cafesMenuApi } from '../../services/api';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Theme ────────────────────────────────────────────────────────────────────

const LIGHT = {
  bg: '#F5F0EB',
  surface: '#FFFFFF',
  surfaceAlt: '#EDEAE4',
  catStrip: '#F0E8DC',
  catCircle: '#FFFFFF',
  catCircleBorder: '#E0D8CC',
  filterActive: '#1A1A1A',
  filterActiveTxt: '#FFFFFF',
  filterInactive: '#FFFFFF',
  filterInactiveTxt: '#333333',
  filterBorder: '#DDDDDD',
  promo: '#2D1206',
  tabBar: '#FFFFFF',
  tabBorder: '#ECE6DF',
  accent: '#C8382A',
  green: '#22863A',
  gold: '#F5A623',
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textMuted: '#999999',
  cardBorder: '#E8E0D8',
  sectionBar: '#C8382A',
  distanceBadgeBg: 'rgba(255,255,255,0.95)',
  distanceBadgeTxt: '#1A1A1A',
};

const DARK = {
  bg: '#141414',
  surface: '#222222',
  surfaceAlt: '#222222',
  catStrip: '#1A1A1A',
  catCircle: '#2A2A2A',
  catCircleBorder: '#3A3A3A',
  filterActive: '#FFFFFF',
  filterActiveTxt: '#141414',
  filterInactive: '#2A2A2A',
  filterInactiveTxt: '#CCCCCC',
  filterBorder: '#3A3A3A',
  promo: '#1C0D08',
  tabBar: '#1C1C1C',
  tabBorder: '#2A2A2A',
  accent: '#C8382A',
  green: '#3CA85A',
  gold: '#F5A623',
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted: '#666666',
  cardBorder: '#333333',
  sectionBar: '#C8382A',
  distanceBadgeBg: 'rgba(30,30,30,0.90)',
  distanceBadgeTxt: '#FFFFFF',
};

type Theme = typeof LIGHT;

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',       label: 'All',        emoji: '☕' },
  { id: 'bubbletea', label: 'Bubble Tea', emoji: '🧋' },
  { id: 'bakery',    label: 'Bakery',     emoji: '🥐' },
  { id: 'desserts',  label: 'Desserts',   emoji: '🍰' },
  { id: 'tea',       label: 'Tea',        emoji: '🫖' },
  { id: 'work',      label: 'Work',       emoji: '💻' },
  { id: 'date',      label: 'Date',       emoji: '💕' },
];

const FILTERS = ['Filters', 'Under ₹150', 'Great offers', 'Top rated'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, t, onSeeAll }: { title: string; t: Theme; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionBar, { backgroundColor: t.sectionBar }]} />
        <Text style={[styles.sectionTitle, { color: t.textPrimary }]}>{title}</Text>
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[styles.seeAll, { color: t.green }]}>See all →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Image Helpers ──────────────────────────────────────────────────────────

const CAFE_IMAGES = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600',
  'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600',
  'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=600',
  'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
];

function getCafeImage(name: string): string {
  // Simple hash from name to deterministically pick an image
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
  return CAFE_IMAGES[Math.abs(hash) % CAFE_IMAGES.length];
}

const ITEM_IMAGES: Record<string, string> = {
  cappuccino:   'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600',
  espresso:     'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600',
  latte:        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
  mocha:        'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=600',
  coffee:       'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
  chai:         'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600',
  tea:          'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600',
  cold:         'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600',
  iced:         'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600',
  brew:         'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=600',
  smoothie:     'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=600',
  mango:        'https://images.unsplash.com/photo-1546173159-315724a31696?w=600',
  toast:        'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600',
  avocado:      'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600',
  sandwich:     'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600',
  brownie:      'https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=600',
  cake:         'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600',
  cookie:       'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600',
  croissant:    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600',
  pancake:      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
  waffle:       'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600',
  flat:         'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
};
const ITEM_FALLBACK = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600';

function getItemImage(name: string, imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(ITEM_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return ITEM_FALLBACK;
}

function CafeCard({ cafe, t, onPress }: { cafe: Cafe; t: Theme; onPress: () => void }) {
  const tagsArray = Array.isArray(cafe.tags) ? cafe.tags : (typeof cafe.tags === 'string' ? JSON.parse(cafe.tags) : []);
  const isPopular = tagsArray.includes('Popular');
  const tagBg = isPopular ? '#2A1020' : '#FEF0D6';
  const tagTxt = isPopular ? t.accent : '#C47D0A';
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: t.surface, borderColor: t.cardBorder }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.cardImage, { backgroundColor: cafe.coverColor ?? '#5C3320' }]}>
        <Image source={{ uri: getCafeImage(cafe.name) }} style={styles.cardImg} />
        <View style={[styles.distanceBadge, { backgroundColor: t.distanceBadgeBg }]}>
          <Text style={[styles.distanceBadgeTxt, { color: t.distanceBadgeTxt }]}>{cafe.distance ?? '2.4 km'}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: t.textPrimary }]}>{cafe.name}</Text>
        <View style={styles.ratingRow}>
          <Text style={[styles.star, { color: t.gold }]}>★</Text>
          <Text style={[styles.ratingVal, { color: t.gold }]}>{cafe.rating}</Text>
          <Text style={[styles.ratingCount, { color: t.textMuted }]}> ({cafe.review_count || cafe.reviewCount})</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={[styles.tag, { backgroundColor: tagBg }]}>
            <Text style={[styles.tagTxt, { color: tagTxt }]}>{tagsArray[0] ?? 'Café'}</Text>
          </View>
          <Text style={[styles.walkTxt, { color: t.textMuted }]}>{cafe.walkTime ?? '15 min'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Extended type for popular items displayed on home
interface PopularItem extends MenuItem {
  cafeName: string;
  cafeId: string;
  emoji: string;
  coverColor: string;
  categoryTag: string;
  rating: number;
  reviewCount: number;
}

const ITEM_EMOJIS: Record<string, string> = {
  cappuccino: '☕', espresso: '☕', latte: '☕', coffee: '☕', mocha: '☕',
  chai: '🍵', tea: '🍵',
  cold: '🧊', iced: '🧊', brew: '🧊',
  smoothie: '🥤', juice: '🍋', mango: '🥭',
  toast: '🍞', avocado: '🥑', sandwich: '🥪',
  brownie: '🍫', cake: '🍰', cookie: '🍪',
  croissant: '🥐', pancake: '🥞', waffle: '🧇',
  egg: '🍳', omelette: '🍳',
};
const ITEM_COLORS = ['#3D2B1F', '#4A3020', '#2D4A3E', '#4A2040', '#1E3D5C', '#5C3D1E'];

function getItemEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(ITEM_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return '🍽';
}

function PopularItemCard({ item, t, onPress }: { item: PopularItem; t: Theme; onPress: () => void }) {
  const tagLabel = item.is_popular ? 'Bestseller' : (item.is_veg ? 'Veg' : 'New');
  const tagBg = item.is_popular ? '#C8382A' : (item.is_veg ? '#22863A' : '#F5A623');
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: t.surface, borderColor: t.cardBorder }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.cardImage, { backgroundColor: item.coverColor }]}>
        <Image source={{ uri: getItemImage(item.name, item.image_url) }} style={styles.cardImg} />
        <View style={[styles.forYouBadge, { backgroundColor: tagBg }]}>
          <Text style={styles.forYouTxt}>{tagLabel}</Text>
        </View>
        <View style={[styles.distanceBadge, { backgroundColor: t.distanceBadgeBg }]}>
          <Text style={[styles.distanceBadgeTxt, { color: t.distanceBadgeTxt }]}>₹{item.price}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: t.textPrimary }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.itemCafeName, { color: t.textMuted }]} numberOfLines={1}>{item.cafeName}</Text>
        <View style={styles.ratingRow}>
          <Text style={[styles.star, { color: t.gold }]}>★</Text>
          <Text style={[styles.ratingVal, { color: t.gold }]}>{item.rating}</Text>
          <Text style={[styles.ratingCount, { color: t.textMuted }]}> ({item.reviewCount})</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={[styles.tag, { backgroundColor: item.is_veg ? '#E8F5E9' : '#FEF0D6' }]}>
            <Text style={[styles.tagTxt, { color: item.is_veg ? '#22863A' : '#C47D0A' }]}>{item.is_veg ? 'Veg' : 'Non-Veg'}</Text>
          </View>
          <Text style={[styles.walkTxt, { color: t.textMuted }]}>⏱ {item.prep_time_minutes} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TrendingCard({ cafe, t, onPress }: { cafe: Cafe; t: Theme; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: t.surface, borderColor: t.cardBorder }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.cardImage, { backgroundColor: cafe.coverColor ?? '#1E3D5C', overflow: 'hidden' }]}>
        <Image source={{ uri: getCafeImage(cafe.name) }} style={styles.cardImg} />
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeTxt}>{cafe.discount ?? '15% OFF'}</Text>
        </View>
        <View style={[styles.distanceBadge, { backgroundColor: t.distanceBadgeBg }]}>
          <Text style={[styles.distanceBadgeTxt2, { color: t.distanceBadgeTxt }]}>{cafe.distance ?? '3.1 km'}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: t.textPrimary }]}>{cafe.name}</Text>
        <View style={styles.ratingRow}>
          <Text style={[styles.star, { color: t.gold }]}>★</Text>
          <Text style={[styles.ratingVal, { color: t.gold }]}>{cafe.rating}</Text>
          <Text style={[styles.ratingCount, { color: t.textMuted }]}> ({cafe.review_count || cafe.reviewCount})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const t = isDark ? DARK : LIGHT;

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [trending, setTrending] = useState<Cafe[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('Filters');

  const loadCafes = useCallback(async () => {
    try {
      const params: any = { limit: 6 };
      if (selectedCat !== 'all') params.mood = selectedCat;
      const [nearRes, trendRes] = await Promise.all([
        cafesApi.list(params),
        cafesApi.list({ sort: 'trending', limit: 6 }),
      ]);
      const nearbyCafes: Cafe[] = nearRes.data.data;
      setCafes(nearbyCafes);
      setTrending(trendRes.data.data);

      // Fetch menus from the first 3 nearby cafes and extract popular items
      try {
        const menuPromises = nearbyCafes.slice(0, 3).map(c => cafesMenuApi.getMenu(c.id).then(r => ({ cafe: c, cats: r.data.data })));
        const menus = await Promise.all(menuPromises);
        const items: PopularItem[] = [];
        menus.forEach(({ cafe, cats }) => {
          cats.forEach((cat: any) => {
            (cat.items || []).forEach((mi: MenuItem, idx: number) => {
              items.push({
                ...mi,
                cafeName: cafe.name,
                cafeId: cafe.id,
                emoji: getItemEmoji(mi.name),
                coverColor: ITEM_COLORS[idx % ITEM_COLORS.length],
                categoryTag: mi.is_popular ? 'Bestseller' : 'New',
                rating: cafe.rating,
                reviewCount: cafe.review_count || (cafe as any).reviewCount || 0,
              });
            });
          });
        });
        // Sort popular first, then shuffle slightly for variety
        items.sort((a, b) => (b.is_popular || 0) - (a.is_popular || 0));
        setPopularItems(items.slice(0, 12));
      } catch (menuErr) {
        console.warn('Could not load popular items', menuErr);
      }
    } catch (e) {
      console.error('loadCafes error', e);
    } finally {
      setRefreshing(false);
    }
  }, [selectedCat]);

  useEffect(() => { loadCafes(); }, [loadCafes]);
  const onRefresh = () => { setRefreshing(true); loadCafes(); };
  const goToCafe = (id: string) => navigation.navigate('CafeDetail', { cafeId: id });

  return (
    <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={t.bg}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />}
      >

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <View style={styles.locationRow}>
              <Text style={[styles.locationPin, { color: t.accent }]}>📍</Text>
              <Text style={[styles.locationLabel, { color: t.textPrimary }]}>Home</Text>
              <Text style={[styles.locationChevron, { color: t.textSecondary }]}>▾</Text>
            </View>
            <Text style={[styles.locationSub, { color: t.textSecondary }]}>Hubballi, Karnataka</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: t.surfaceAlt }]} onPress={() => setIsDark(!isDark)}>
              <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: t.surfaceAlt }]} onPress={() => navigation.navigate('NotificationsScreen')}>
              <Text style={{ fontSize: 16 }}>✉️</Text>
              <View style={[styles.badge, { backgroundColor: t.accent }]}>
                <Text style={styles.badgeTxt}>2</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: t.surfaceAlt }]} onPress={() => navigation.navigate('Profile' as any)}>
              <Text style={{ fontSize: 16 }}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SEARCH (Neumorphic Style) */}
        <TouchableOpacity 
          style={[
            styles.searchBar, 
            { 
              backgroundColor: isDark ? '#1A1A1A' : '#e8e8e8',
              // @ts-ignore
              boxShadow: Platform.OS === 'web' 
                ? (isDark ? '10px 10px 30px #0a0a0a, -10px -10px 30px #1e1e1e' : '20px 20px 60px #c5c5c5, -20px -20px 60px #ffffff')
                : undefined
            }
          ]} 
          onPress={() => navigation.navigate('SearchTab' as any)} 
          activeOpacity={0.9}
        >
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <Text style={[styles.searchPlaceholder, { color: isDark ? '#888' : '#999999' }]}>Search cafes, moods, vibes...</Text>
        </TouchableOpacity>

        {/* CATEGORY CIRCLES */}
        <View style={[styles.catStrip, { backgroundColor: t.catStrip }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
            {CATEGORIES.map(cat => {
              const active = selectedCat === cat.id;
              return (
                <TouchableOpacity key={cat.id} style={styles.catItem} onPress={() => setSelectedCat(cat.id)} activeOpacity={0.75}>
                  <View style={[styles.catCircle, { backgroundColor: active ? t.accent : t.catCircle, borderColor: active ? t.accent : t.catCircleBorder }]}>
                    <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
                  </View>
                  <Text style={[styles.catLabel, { color: active ? t.accent : t.textSecondary }, active && { fontWeight: '700' }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* FILTER CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {FILTERS.map(f => {
            const active = selectedFilter === f;
            return (
              <TouchableOpacity key={f} onPress={() => setSelectedFilter(f)}
                style={[styles.filterChip, { backgroundColor: active ? t.filterActive : t.filterInactive, borderColor: active ? t.filterActive : t.filterBorder }]}>
                {f === 'Filters' && <Text style={{ fontSize: 12, marginRight: 4 }}>⚙️</Text>}
                <Text style={[styles.filterTxt, { color: active ? t.filterActiveTxt : t.filterInactiveTxt }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <SpecialMenuBanner onPress={() => navigation.navigate('SearchResults', {})} />

        {/* CAFES NEAR YOU */}
        <View style={styles.section}>
          <SectionHeader title="Cafes Near You" t={t} onSeeAll={() => navigation.navigate('SearchResults', {})} />
          <FlatList data={cafes} keyExtractor={c => c.id} horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
            renderItem={({ item }) => <CafeCard cafe={item} t={t} onPress={() => goToCafe(item.id)} />}
          />
        </View>

        <BuyOneGetOneBanner onPress={() => navigation.navigate('SearchResults', {})} />

        {/* POPULAR NEAR YOU */}
        <View style={styles.section}>
          <SectionHeader title="Popular Near You" t={t} onSeeAll={() => navigation.navigate('SearchResults', {})} />
          <FlatList data={popularItems} keyExtractor={(c, i) => c.id + i} horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
            renderItem={({ item }) => (
              <PopularItemCard
                item={item}
                t={t}
                onPress={() => navigation.navigate('ProductDetail', { item, cafeId: item.cafeId })}
              />
            )}
          />
        </View>

        <OpenTodayBanner onPress={() => navigation.navigate('SearchResults', {})} />

        {/* TRENDING */}
        <View style={[styles.section, { paddingBottom: insets.bottom + 90 }]}>
          <SectionHeader title="Trending" t={t} onSeeAll={() => navigation.navigate('SearchResults', {})} />
          <FlatList data={trending} keyExtractor={c => c.id} horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
            renderItem={({ item }) => <TrendingCard cafe={item} t={t} onPress={() => goToCafe(item.id)} />}
          />
        </View>

      </ScrollView>

      {/* Note: Bottom tab bar is managed by App.tsx navigation */}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationPin: { fontSize: 12 },
  locationLabel: { fontSize: 18, fontWeight: '800' },
  locationChevron: { fontSize: 12 },
  locationSub: { fontSize: 12, marginTop: 2 },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeTxt: { fontSize: 9, fontWeight: '700', color: '#fff' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    // Base Shadows for Mobile
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      }
    }),
  },
  searchPlaceholder: { fontSize: 14, fontWeight: '500' },
  catStrip: { paddingVertical: 14 },
  catList: { paddingHorizontal: 16, gap: 16 },
  catItem: { alignItems: 'center', gap: 6 },
  catCircle: { width: 58, height: 58, borderRadius: 29, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: 11 },
  filterList: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterTxt: { fontSize: 12, fontWeight: '600' },
  section: { marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionBar: { width: 3, height: 20, borderRadius: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  seeAll: { fontSize: 12, fontWeight: '600' },
  cardList: { paddingHorizontal: 16, gap: 12 },
  card: { width: 152, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5 },
  cardImage: { height: 108, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  cardImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' },
  distanceBadge: { position: 'absolute', top: 8, right: 8, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  distanceBadgeTxt: { fontSize: 11, fontWeight: '700' },
  distanceBadgeTxt2: { fontSize: 11, fontWeight: '700' },
  forYouBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#F5A623', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  forYouTxt: { fontSize: 10, fontWeight: '700', color: '#fff' },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#C8382A', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  discountBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#fff' },
  cardBody: { padding: 10 },
  cardName: { fontSize: 14, fontWeight: '800' },
  itemCafeName: { fontSize: 11, marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  star: { fontSize: 12 },
  ratingVal: { fontSize: 12, fontWeight: '600' },
  ratingCount: { fontSize: 11 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  tag: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  tagTxt: { fontSize: 11, fontWeight: '700' },
  walkTxt: { fontSize: 11 },
});
