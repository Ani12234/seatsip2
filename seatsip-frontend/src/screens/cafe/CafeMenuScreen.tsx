import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SectionList, Image, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, ScrollView, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cafesApi } from '../../services/api';
import { MenuCategory, MenuItem } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import { VegIndicator, Divider } from '../../components/ui';
import { useCart } from '../../context/CartContext';
import Svg, { Path } from 'react-native-svg';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CafeMenu'>;

// ─── Tag Helper ───────────────────────────────────────────────────────────────
function getItemTags(item: MenuItem): string[] {
  const tags: string[] = [];
  if (item.description) {
    const words = item.description.split(/[\s,]+/).filter(w => w.length > 3);
    tags.push(...words.slice(0, 3));
  }
  if (tags.length === 0) tags.push('Fresh', 'Special');
  return tags;
}

// ─── Image Map ────────────────────────────────────────────────────────────────
const CATEGORY_IMAGES: Record<string, string> = {
  'Hot Beverages':  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
  'Cold Beverages': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
  'Food':           'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  'Desserts':       'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
};
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400';

export default function CafeMenuScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { cart, addToCart, updateQuantity, cartCount } = useCart();

  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const listRef = useRef<SectionList>(null);

  useEffect(() => {
    cafesApi.getMenu(params.cafeId).then(r => {
      setMenu(r.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [params.cafeId]);

  const getCartQuantity = (itemId: string) => {
    const found = cart?.items.find(i => i.menu_item_id === itemId);
    return found?.quantity || 0;
  };

  const handleAdd = async (item: MenuItem) => {
    try {
      await addToCart(params.cafeId, item.id, 1);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not add to cart');
    }
  };

  const handleUpdate = async (item: MenuItem, delta: number) => {
    const found = cart?.items.find(i => i.menu_item_id === item.id);
    if (!found) { handleAdd(item); return; }
    const newQty = found.quantity + delta;
    try {
      await updateQuantity(found.id, newQty);
    } catch (e) {
      console.error(e);
    }
  };

  const sections = menu.map(cat => ({
    title: cat.name,
    data: cat.items,
    key: cat.id,
  }));

  // ─── Card Renderer ────────────────────────────────────────────────────────────
  const renderItem = ({ item, section }: { item: MenuItem; section: any }) => {
    const qty = getCartQuantity(item.id);
    const tags = getItemTags(item);
    const imgSrc = item.image_url || CATEGORY_IMAGES[section.title] || FALLBACK_IMG;

    return (
      <View style={styles.cardContainer}>
        {/* ── Image Area ── */}
        <View style={styles.cardImageArea}>
          {/* SVG Price Badge — sharp on 3 sides, outward curve bottom-left */}
          <View style={styles.priceBadge}>
            <Svg width={72} height={48} viewBox="0 0 72 48" style={StyleSheet.absoluteFill}>
              <Path d="M0,0 H72 V48 H24 Q0,48 0,24 V0 Z" fill="#f5f5f5" />
            </Svg>
            <Text style={styles.priceText}>₹{item.price}</Text>
          </View>

          {/* Product image */}
          <Image source={{ uri: imgSrc }} style={styles.cardImage} />

          {/* Bottom bar */}
          <View style={styles.deliveryBar}>
            <Text style={styles.deliveryText} numberOfLines={1}>
              {item.prep_time_minutes ? `Ready in ~${item.prep_time_minutes} min` : 'Freshly prepared for you'}
            </Text>
          </View>
        </View>

        {/* ── Card Content ── */}
        <View style={styles.cardContentBox}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleCol}>
              {!!item.is_popular && <Text style={styles.popularLabel}>★ Popular</Text>}
              <Text style={styles.cardTitle}>{item.name}</Text>
            </View>

            <View style={styles.cardControls}>
              {qty > 0 ? (
                <View style={styles.qtyControlsRow}>
                  <TouchableOpacity onPress={() => handleUpdate(item, -1)} style={styles.qtyBtnMinus}>
                    <Text style={styles.qtyBtnTxtMinus}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyNum}>{qty}</Text>
                  <TouchableOpacity onPress={() => handleUpdate(item, 1)} style={styles.qtyBtnPlus}>
                    <Text style={styles.qtyBtnTxtPlus}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => handleAdd(item)} style={styles.orderNowBtn}>
                  <Text style={styles.orderNowTxt}>Order Now ↗</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {tags.map((tag, idx) => (
              <View key={idx} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.calories ? (
              <View style={[styles.tagBadge, { backgroundColor: '#d1fae5' }]}>
                <Text style={[styles.tagText, { color: '#065f46' }]}>{item.calories} cal</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{params.cafeName}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
          <Text style={styles.cartIcon}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: 8 }}>
        {sections.map((s, i) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => {
              setActiveSection(i);
              listRef.current?.scrollToLocation({ sectionIndex: i, itemIndex: 0, animated: true, viewPosition: 0 });
            }}
            style={[styles.tab, activeSection === i && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeSection === i && styles.tabTextActive]}>{s.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: insets.bottom + (cartCount > 0 ? 120 : 40), paddingTop: 8 }}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems[0]?.section) {
            const idx = sections.findIndex(s => s.key === viewableItems[0].section.key);
            if (idx >= 0) setActiveSection(idx);
          }
        }}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        stickySectionHeadersEnabled
      />

      {/* Cart footer */}
      {cartCount > 0 && (
        <View style={[styles.cartFooter, { paddingBottom: insets.bottom + 8 }]}>
          <View>
            <Text style={styles.cartFooterCount}>{cartCount} item{cartCount > 1 ? 's' : ''}</Text>
            <Text style={styles.cartFooterAmount}>₹{cart?.total?.toFixed(0)}</Text>
          </View>
          <TouchableOpacity style={styles.viewCartBtn} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.viewCartText}>View Cart →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md, backgroundColor: Colors.surface, ...Shadow.sm,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  title: { flex: 1, fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  cartBtn: { padding: 4, position: 'relative' },
  cartIcon: { fontSize: 24 },
  cartBadge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: Colors.accent, borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { color: Colors.white, fontSize: 10, fontWeight: Typography.bold },

  // Tabs
  tabRow: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  tab: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.accent },
  tabText: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textMuted },
  tabTextActive: { color: Colors.accent, fontWeight: Typography.bold },

  // Section
  sectionHeader: {
    backgroundColor: Colors.surfaceElevated, paddingHorizontal: Spacing.base,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },

  // ─── Custom Card ──────────────────────────────────────────────────────────────
  cardContainer: {
    alignSelf: 'center',
    width: '90%',
    maxWidth: 340,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    padding: 12,
    marginVertical: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20 },
      android: { elevation: 6 },
      web: { boxShadow: '0 10px 20px rgba(0,0,0,0.08)' },
    }),
  },
  cardImageArea: {
    position: 'relative',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#9caf88',
  },
  priceBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 72,
    height: 48,
    zIndex: 10,
    alignItems: 'center',
    paddingTop: 8,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    zIndex: 11,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deliveryBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#6f8c55',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  deliveryText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
  },
  cardContentBox: {
    paddingHorizontal: 6,
    paddingTop: 14,
    paddingBottom: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitleCol: {
    flex: 1,
  },
  popularLabel: {
    fontSize: 11,
    color: '#4caf50',
    fontWeight: '700',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
  },
  cardControls: {
    flexShrink: 0,
  },
  orderNowBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  orderNowTxt: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  qtyControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    padding: 2,
  },
  qtyBtnMinus: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  qtyBtnPlus: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  qtyBtnTxtMinus: { fontSize: 16, fontWeight: '700', color: '#4b5563' },
  qtyBtnTxtPlus: { fontSize: 16, fontWeight: '700', color: '#fff' },
  qtyNum: { fontSize: 13, fontWeight: '700', color: '#111827', minWidth: 24, textAlign: 'center' },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingBottom: 4,
  },
  tagBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '500',
  },

  // Cart footer
  cartFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.base, paddingTop: Spacing.md,
    ...Shadow.lg,
  },
  cartFooterCount: { color: Colors.cream, fontSize: Typography.sm },
  cartFooterAmount: { color: Colors.white, fontWeight: Typography.bold, fontSize: Typography.lg },
  viewCartBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  viewCartText: { color: Colors.white, fontWeight: Typography.bold, fontSize: Typography.base },
});
