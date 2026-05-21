import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Image, FlatList, Alert, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cafesApi, reservationsApi } from '../../services/api';
import { setPreOrderDraft } from '../../reservation/preOrderDraft';
import { MenuItem, MenuCategory } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { Spacing, Shadow } from '../../theme';
import { AppIcon, Button, Divider } from '../../components/ui';
import Svg, { Path } from 'react-native-svg';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'PreOrderMenu'>;

const THEME = {
  bg: '#F5EFE6',
  surface: '#FDFAF6',
  primary: '#4A2E0A',
  accent: '#C8A96E',
  secondary: '#7A6040',
  highlight: '#FFF3CD',
  border: '#EDE0CC',
};

export default function PreOrderMenuScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();

  const [menuLoading, setMenuLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [cart, setCart] = useState<Record<string, { item: MenuItem; quantity: number }>>({});
  const [view, setView] = useState<'menu' | 'summary'>('menu');

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const { data } = await cafesApi.getMenu(params.cafeId);
      setCategories(data.data);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load menu');
    } finally {
      setMenuLoading(false);
    }
  };

  const updateQty = (item: MenuItem, delta: number) => {
    setCart(prev => {
      const next = { ...prev };
      const current = next[item.id] || { item, quantity: 0 };
      const newQty = Math.max(0, current.quantity + delta);
      
      if (newQty === 0) {
        delete next[item.id];
      } else {
        next[item.id] = { ...current, quantity: newQty };
      }
      return next;
    });
  };

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
  const tax = Math.round(cartSubtotal * 0.05);
  const total = cartSubtotal + tax;

  const confirmOrder = async () => {
    if (cartCount === 0) {
      Alert.alert('Empty cart', 'Add at least one item to pre-order.');
      return;
    }
    setSubmitting(true);
    try {
      const lines = cartItems.map(({ item, quantity }) => ({ menu_item_id: item.id, quantity }));
      if (params.reservationId) {
        await reservationsApi.updatePreOrder(params.reservationId, { pre_order_items: lines });
        Alert.alert('Saved', 'Your pre-order has been updated.');
        navigation.goBack();
        return;
      }
      setPreOrderDraft(lines);
      Alert.alert(
        'Pre-order saved',
        'When you confirm your table booking, these items will be sent with the reservation.'
      );
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not save pre-order');
    } finally {
      setSubmitting(false);
    }
  };

  if (menuLoading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={THEME.primary} />
      </View>
    );
  }

  // ─── SUMMARY VIEW ───────────────────────────────────────────────────────────
  if (view === 'summary') {
    return (
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setView('menu')} style={styles.backBtn}>
            <AppIcon name="back" size={14} color={THEME.primary} />
            <Text style={styles.backBtnTxt}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Summary</Text>
        </View>

        <ScrollView contentContainerStyle={styles.summaryContent}>
          <View style={styles.summaryList}>
            {cartItems.map(({ item, quantity }) => (
              <View key={item.id} style={styles.summaryRow}>
                <View style={styles.summaryItemInfo}>
                  <Text style={styles.summaryItemName}>{item.name}</Text>
                  <Text style={styles.summaryItemQty}>×{quantity}</Text>
                </View>
                <Text style={styles.summaryItemPrice}>₹{item.price * quantity}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalVal}>₹{cartSubtotal}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST (5%)</Text>
              <Text style={styles.totalVal}>₹{tax}</Text>
            </View>
            <Divider style={{ marginVertical: 12 }} />
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalVal}>₹{total}</Text>
            </View>
          </View>

          <View style={styles.infoBanner}>
            <AppIcon name="card" size={18} color="#5A3E00" />
            <Text style={styles.infoTxt}>
              Payment will be collected at the venue. Your pre-order helps the café prepare in advance!
            </Text>
          </View>

          <Button
            title="Confirm Pre-order"
            onPress={confirmOrder}
            loading={submitting}
            fullWidth
            size="lg"
            style={{ backgroundColor: THEME.primary }}
            textStyle={{ color: THEME.highlight }}
          />
        </ScrollView>
      </View>
    );
  }

  // ─── MENU VIEW ──────────────────────────────────────────────────────────────
  const allItems = categories.flatMap(c => c.items);
  const filteredItems = activeTab === 'all' 
    ? allItems 
    : categories.find(c => c.name.toLowerCase().includes(activeTab))?.items || [];

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <AppIcon name="back" size={14} color={THEME.primary} />
          <Text style={styles.backBtnTxt}>Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Pre-order Menu</Text>
          <Text style={styles.headerSub}>{params.cafeName} · {params.reservationData?.date}</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {['all', 'drinks', 'food', 'desserts'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabTxt, activeTab === tab && styles.tabTxtActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.menuList}
        renderItem={({ item }) => {
          const qty = cart[item.id]?.quantity || 0;
          // Generate pseudo-tags for visual fidelity based on the item name
          const tags = item.name.split(' ').filter(w => w.length > 3).slice(0, 3);
          if (tags.length === 0) tags.push('Fresh', 'Special');
          
          return (
            <View style={styles.cardContainer}>
              {/* ── Image area ── */}
              <View style={styles.cardImageArea}>
                {/* Price badge */}
                <View style={styles.priceBadge}>
                  <Svg width={72} height={48} viewBox="0 0 72 48" style={StyleSheet.absoluteFill}>
                    <Path d="M0,0 H72 V48 H24 Q0,48 0,24 V0 Z" fill="#f5f5f5" />
                  </Svg>
                  <Text style={styles.priceText}>₹{item.price}</Text>
                </View>

                {/* Product image (fallback to Unsplash for visual fidelity) */}
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600' }}
                  style={styles.cardImage}
                />

                {/* Delivery bar */}
                <View style={styles.deliveryBar}>
                  <Text style={styles.deliveryText} numberOfLines={1}>
                    Prepared fresh for your arrival
                  </Text>
                </View>
              </View>

              {/* ── Card content ── */}
              <View style={styles.cardContentBox}>
                <View style={styles.cardHeaderBox}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  
                  <View style={styles.cardControls}>
                    {qty > 0 ? (
                      <View style={styles.qtyControlsBox}>
                        <TouchableOpacity onPress={() => updateQty(item, -1)} style={styles.qtyBtnMinusBox}>
                          <Text style={styles.qtyBtnTxtMinusBox}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyNumBox}>{qty}</Text>
                        <TouchableOpacity onPress={() => updateQty(item, 1)} style={styles.qtyBtnPlusBox}>
                          <Text style={styles.qtyBtnTxtPlusBox}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={() => updateQty(item, 1)} style={styles.orderNowBtn}>
                        <Text style={styles.orderNowTxt}>Pre-order</Text>
                        <AppIcon name="arrow-up-right" size={13} color="#4b5563" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Ingredient tags */}
                <View style={styles.tagsContainer}>
                  {tags.map((tag, idx) => (
                    <View key={idx} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          );
        }}
      />

      {cartCount > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartCountLabel}>{cartCount} {cartCount === 1 ? 'item' : 'items'}</Text>
            <Text style={styles.cartTotalLabel}>₹{cartSubtotal}</Text>
          </View>
          <TouchableOpacity onPress={() => setView('summary')} style={styles.reviewBtn}>
            <Text style={styles.reviewBtnTxt}>Review Order</Text>
            <AppIcon name="arrow" size={15} color={THEME.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.base,
    backgroundColor: THEME.surface, gap: 12, borderBottomWidth: 1, borderBottomColor: THEME.border,
  },
  backBtn: { backgroundColor: '#F0E8D8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtnTxt: { fontSize: 13, fontWeight: '600', color: THEME.primary },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#2C1A00' },
  headerSub: { fontSize: 12, color: THEME.secondary, marginTop: 2 },
  tabsContainer: { backgroundColor: THEME.surface, paddingVertical: 12 },
  tabsScroll: { paddingHorizontal: Spacing.base, gap: 8 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#D6C4A0', backgroundColor: '#fff',
  },
  tabActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  tabTxt: { fontSize: 13, fontWeight: '600', color: THEME.secondary },
  tabTxtActive: { color: THEME.highlight },
  menuList: { padding: Spacing.base, gap: 24, paddingBottom: 100 },
  
  // Custom Card Styles
  cardContainer: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    padding: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20 },
      android: { elevation: 6 },
      web: { boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }
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
    color: '#1f2937', // gray-800
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
  cardHeaderBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827', // gray-900
    lineHeight: 22,
  },
  cardControls: {
    flexShrink: 0,
  },
  orderNowBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  orderNowTxt: {
    fontSize: 12,
    color: '#4b5563', // gray-600
    fontWeight: '600',
  },
  qtyControlsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    padding: 2,
  },
  qtyBtnMinusBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  qtyBtnPlusBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center' },
  qtyBtnTxtMinusBox: { fontSize: 16, fontWeight: '700', color: '#4b5563' },
  qtyBtnTxtPlusBox: { fontSize: 16, fontWeight: '700', color: '#fff' },
  qtyNumBox: { fontSize: 13, fontWeight: '700', color: '#111827', minWidth: 24, textAlign: 'center' },
  
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
    color: '#4b5563', // gray-600
    fontWeight: '500',
  },
  cartBar: {
    position: 'absolute', bottom: 20, left: 16, right: 16,
    backgroundColor: THEME.primary, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    ...Shadow.lg,
  },
  cartCountLabel: { fontSize: 12, color: 'rgba(255,243,205,0.7)' },
  cartTotalLabel: { fontSize: 18, fontWeight: '800', color: THEME.highlight },
  reviewBtn: { backgroundColor: THEME.highlight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  reviewBtnTxt: { fontSize: 14, fontWeight: '700', color: THEME.primary },
  summaryContent: { padding: Spacing.base },
  summaryList: { marginBottom: 20 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: THEME.border,
  },
  summaryItemInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryItemName: { fontSize: 14, fontWeight: '600', color: '#2C1A00' },
  summaryItemQty: { fontSize: 13, color: THEME.secondary },
  summaryItemPrice: { fontSize: 14, fontWeight: '700', color: '#2C1A00' },
  totalsSection: { marginBottom: 24 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { fontSize: 14, color: THEME.secondary },
  totalVal: { fontSize: 14, fontWeight: '600', color: '#2C1A00' },
  grandTotalLabel: { fontSize: 16, fontWeight: '800', color: '#2C1A00' },
  grandTotalVal: { fontSize: 18, fontWeight: '800', color: '#2C1A00' },
  infoBanner: {
    backgroundColor: THEME.highlight, borderRadius: 10, padding: 14,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoTxt: { flex: 1, fontSize: 13, color: '#5A3E00', lineHeight: 18 },
});
