import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import { useCart } from '../../context/CartContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ProductDetail'>;

const THEME = {
  bg: '#F5F0EB',
  surface: '#FDFAF6',
  primary: '#3D2B1F',
  accent: '#C8382A',
  gold: '#C8851A',
  greenBg: '#E8F5E9',
  greenTxt: '#22863A',
  tagBg: '#EDE4D4',
  tagTxt: '#5A3E28',
  muted: '#9E9E9E',
  border: '#EDE0CC',
  cream: '#FFF3CD',
};

const IMG_FALLBACK_MAP: Record<string, string> = {
  cappuccino:   'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800',
  espresso:     'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800',
  latte:        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
  cold:         'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800',
  iced:         'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800',
  brew:         'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800',
  chai:         'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
  tea:          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
  smoothie:     'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=800',
  toast:        'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=800',
  avocado:      'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800',
  cake:         'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800',
  brownie:      'https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=800',
  croissant:    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800',
  pancake:      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
};
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800';

function getItemImage(name: string, imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(IMG_FALLBACK_MAP)) {
    if (lower.includes(key)) return url;
  }
  return DEFAULT_IMG;
}

const ALLERGEN_MAP: Record<string, string[]> = {
  cappuccino: ['Dairy', 'Caffeine'],
  espresso:   ['Caffeine'],
  latte:      ['Dairy', 'Caffeine'],
  chai:       ['Dairy', 'Gluten'],
  croissant:  ['Gluten', 'Dairy', 'Eggs'],
  cake:       ['Gluten', 'Dairy', 'Eggs'],
  brownie:    ['Gluten', 'Dairy', 'Eggs', 'Nuts'],
  pancake:    ['Gluten', 'Dairy', 'Eggs'],
};
function getAllergens(name: string): string[] {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(ALLERGEN_MAP)) {
    if (lower.includes(k)) return v;
  }
  return [];
}

const PAIRINGS: string[] = ['Croissant', 'Brownie', 'Banana Bread'];

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={pill.wrap}>
      <Text style={pill.label}>{label}</Text>
      <Text style={pill.value}>{value}</Text>
    </View>
  );
}

const pill = StyleSheet.create({
  wrap: { alignItems: 'center', backgroundColor: THEME.surface, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8, minWidth: 74, borderWidth: 1, borderColor: THEME.border },
  label: { fontSize: 10, color: THEME.muted, fontWeight: '500', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 16, fontWeight: '800', color: THEME.primary },
});

export default function MenuItemDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const item = params.item;
  const cafeId = params.cafeId;
  const imgSrc = getItemImage(item.name, item.image_url);
  const allergens = getAllergens(item.name);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(cafeId, item.id, qty);
      Alert.alert('Added to cart ✅', `${qty}× ${item.name} added to your cart.`, [
        { text: 'Continue browsing', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Hero Image ── */}
      <View style={s.hero}>
        <Image source={{ uri: imgSrc }} style={s.heroImg} />
        {/* Gradient overlay */}
        <View style={s.heroOverlay} />

        {/* Back button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={[s.backBtn, { top: 12 }]}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>

        {/* Veg/Non-veg indicator */}
        <View style={[s.vegBadge, { backgroundColor: item.is_veg ? THEME.greenBg : '#FFF3CD', top: 12, right: 16 }]}>
          <View style={[s.vegDot, { backgroundColor: item.is_veg ? '#22863A' : '#E65C00' }]} />
          <Text style={[s.vegTxt, { color: item.is_veg ? THEME.greenTxt : '#E65C00' }]}>
            {item.is_veg ? 'Pure Veg' : 'Non-Veg'}
          </Text>
        </View>

        {/* Hero bottom info overlay */}
        <View style={s.heroBottom}>
          {item.is_popular ? (
            <View style={s.popularChip}>
              <Text style={s.popularChipTxt}>★ Bestseller</Text>
            </View>
          ) : null}
          <Text style={s.heroTitle}>{item.name}</Text>
          {item.cafeName && (
            <Text style={s.heroCafe}>from {item.cafeName}</Text>
          )}
        </View>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* ── Quick Info Pills ── */}
        <View style={s.pillsRow}>
          <InfoPill label="Price" value={`₹${item.price}`} />
          <InfoPill label="Prep Time" value={`${item.prep_time_minutes ?? '—'} min`} />
          {item.calories ? <InfoPill label="Calories" value={`${item.calories}`} /> : null}
          <InfoPill label="Serves" value="1" />
        </View>

        {/* ── Description ── */}
        {item.description ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>About this item</Text>
            <Text style={s.descTxt}>{item.description}</Text>
          </View>
        ) : null}

        {/* ── Highlights ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Highlights</Text>
          <View style={s.tagsWrap}>
            {item.is_popular ? <View style={[s.tagChip, { backgroundColor: '#FEE2E2' }]}><Text style={[s.tagChipTxt, { color: THEME.accent }]}>🔥 Bestseller</Text></View> : null}
            {item.is_veg ? <View style={[s.tagChip, { backgroundColor: THEME.greenBg }]}><Text style={[s.tagChipTxt, { color: THEME.greenTxt }]}>🥦 Vegetarian</Text></View> : <View style={[s.tagChip, { backgroundColor: '#FFF3CD' }]}><Text style={[s.tagChipTxt, { color: '#E65C00' }]}>🍖 Non-Veg</Text></View>}
            {item.prep_time_minutes <= 10 ? <View style={s.tagChip}><Text style={s.tagChipTxt}>⚡ Quick Prep</Text></View> : null}
            {(item.calories ?? 999) < 200 ? <View style={s.tagChip}><Text style={s.tagChipTxt}>💚 Low Calorie</Text></View> : null}
            <View style={s.tagChip}><Text style={s.tagChipTxt}>✨ Made Fresh</Text></View>
          </View>
        </View>

        {/* ── Allergens ── */}
        {allergens.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Allergen Info</Text>
            <View style={s.tagsWrap}>
              {allergens.map((a) => (
                <View key={a} style={[s.tagChip, { backgroundColor: '#FFF3CD', borderColor: '#F5A623' }]}>
                  <Text style={[s.tagChipTxt, { color: '#9A6200' }]}>⚠️ {a}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* ── Pairs Well With ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Pairs Well With</Text>
          <View style={s.tagsWrap}>
            {PAIRINGS.map((p) => (
              <View key={p} style={[s.tagChip, { backgroundColor: '#EDE4D4', borderColor: THEME.border }]}>
                <Text style={[s.tagChipTxt, { color: THEME.tagTxt }]}>☕ {p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── View Café CTA ── */}
        <TouchableOpacity
          style={s.viewCafeBtn}
          onPress={() => navigation.navigate('CafeDetail', { cafeId })}
          activeOpacity={0.8}
        >
          <Text style={s.viewCafeTxt}>🏠 View {item.cafeName ?? 'Café'} Details</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Sticky Footer: Qty + Add to Cart ── */}
      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={s.qtyBox}>
          <TouchableOpacity onPress={() => setQty(q => Math.max(1, q - 1))} style={s.qtyBtn}>
            <Text style={s.qtyBtnTxt}>−</Text>
          </TouchableOpacity>
          <Text style={s.qtyNum}>{qty}</Text>
          <TouchableOpacity onPress={() => setQty(q => q + 1)} style={s.qtyBtn}>
            <Text style={s.qtyBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.addBtn} onPress={handleAddToCart} activeOpacity={0.8} disabled={adding}>
          <Text style={s.addBtnTxt}>{adding ? 'Adding...' : `Add to Cart  ₹${item.price * qty}`}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },

  // Hero
  hero: { height: 320, position: 'relative', overflow: 'hidden' },
  heroImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTxt: { color: '#fff', fontSize: 20, fontWeight: '600' },
  vegBadge: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  vegDot: { width: 8, height: 8, borderRadius: 4 },
  vegTxt: { fontSize: 11, fontWeight: '700' },
  heroBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 20,
  },
  popularChip: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.accent,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  popularChipTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', lineHeight: 34 },
  heroCafe: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  // Body
  body: { flex: 1 },

  // Pills row
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  // Sections
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: THEME.primary, marginBottom: 10 },
  descTxt: { fontSize: 15, color: '#5A5A5A', lineHeight: 24 },

  // Tags
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    backgroundColor: THEME.tagBg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  tagChipTxt: { fontSize: 12, fontWeight: '600', color: THEME.tagTxt },

  // View Café CTA
  viewCafeBtn: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: THEME.surface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    }),
  },
  viewCafeTxt: { fontSize: 14, fontWeight: '700', color: THEME.primary },

  // Sticky Footer
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 12 },
      web: { boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' },
    }),
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E8D8',
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center' },
  qtyBtnTxt: { fontSize: 18, fontWeight: '700', color: '#fff' },
  qtyNum: { fontSize: 16, fontWeight: '800', color: THEME.primary, minWidth: 32, textAlign: 'center' },
  addBtn: {
    flex: 1,
    backgroundColor: THEME.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnTxt: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});
