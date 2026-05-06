import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AppIcon from '../../components/ui/AppIcon';

// ─── Constants ────────────────────────────────────────────────────────────────
const BROWN = '#2C1A0E';
const ACCENT = '#8B5E3C';
const BG = '#F5F0EB';

const FILTERS = [
  { id: 'all',       label: 'All Orders',  icon: '🛍' },
  { id: 'delivered', label: 'Delivered',   icon: '✅' },
  { id: 'cancelled', label: 'Cancelled',   icon: '❌' },
  { id: 'reordered', label: 'Reordered',   icon: '🔄' },
];

const ORDERS = [
  {
    id: '1',
    restaurant: 'Punjab Grill',
    date: '24 Apr 2026',
    time: '8:30 PM',
    items: 'Butter Chicken, Naan (2), Rice',
    orderId: '#PG12456',
    price: '₹1,240',
    status: 'delivered',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=80',
  },
  {
    id: '2',
    restaurant: 'Dominos Pizza',
    date: '20 Apr 2026',
    time: '7:15 PM',
    items: 'Pepperoni Pizza, Garlic Bread',
    orderId: '#DP98765',
    price: '₹689',
    status: 'delivered',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&q=80',
  },
  {
    id: '3',
    restaurant: 'Chinese Wok',
    date: '18 Apr 2026',
    time: '1:20 PM',
    items: 'Hakka Noodles, Manchurian',
    orderId: '#CW54321',
    price: '₹450',
    status: 'cancelled',
    image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300&q=80',
  },
  {
    id: '4',
    restaurant: 'Starbucks',
    date: '15 Apr 2026',
    time: '11:05 AM',
    items: 'Caramel Frappuccino, Sandwich',
    orderId: '#SB11223',
    price: '₹580',
    status: 'delivered',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=80',
  },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const config: any = {
    delivered: { label: 'Delivered', bg: '#E8F5E9', color: '#2E7D32', icon: '✓' },
    cancelled:  { label: 'Cancelled', bg: '#FFEBEE', color: '#C62828', icon: '✕' },
    reordered:  { label: 'Reordered', bg: '#FFF8E1', color: '#B8860B', icon: '↺' },
  }[status] || {};

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.statusText, { color: config.color }]}>
        {config.label}
      </Text>
      <View style={[styles.statusDot, { backgroundColor: config.color }]}>
        <AppIcon name={config.icon} size={9} color="#FFFFFF" />
      </View>
    </View>
  );
};

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order }: { order: any }) => {
  const isCancelled = order.status === 'cancelled';

  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <Image source={{ uri: order.image }} style={styles.cardImage} />
        <View style={styles.cardMeta}>
          <View style={styles.cardMetaTop}>
            <Text style={styles.cardRestaurant}>{order.restaurant}</Text>
            <StatusBadge status={order.status} />
          </View>
          <Text style={styles.cardDate}>{order.date}  •  {order.time}</Text>
          <Text style={styles.cardItems}>{order.items}</Text>
          <Text style={styles.cardOrderId}>Order ID: {order.orderId}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Bottom row */}
      <View style={styles.cardBottom}>
        <Text style={styles.cardPrice}>{order.price}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.viewDetailsBtn} activeOpacity={0.7}>
            <View style={styles.viewDetailsRow}><Text style={styles.viewDetailsText}>View Details</Text><AppIcon name="▾" size={12} color="#555" /></View>
          </TouchableOpacity>
          {isCancelled ? (
            <TouchableOpacity style={styles.removeBtn} activeOpacity={0.7}>
              <AppIcon name="trash" size={13} color="#C62828" />
              <Text style={styles.removeBtnText}>Remove</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.reorderBtn} activeOpacity={0.85}>
              <AppIcon name="refresh" size={13} color="#FFFFFF" />
              <Text style={styles.reorderText}>Reorder</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MyOrdersScreen() {
  const navigation = useNavigation<Nav>();
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = ORDERS.filter(
    (o) => activeFilter === 'all' || o.status === activeFilter
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}
        >
          <AppIcon name="back" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSub}>Track, reorder or manage your past orders.</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.75}>
          <AppIcon name="filter" size={16} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterPill, activeFilter === f.id && styles.filterPillActive]}
            onPress={() => setActiveFilter(f.id)}
            activeOpacity={0.75}
          >
            {activeFilter !== f.id && (
              <AppIcon name={f.icon} size={13} color="#555" />
            )}
            <Text style={[styles.filterPillText, activeFilter === f.id && styles.filterPillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Cards */}
        {filtered.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}

        {/* Help Banner */}
        <View style={styles.helpBanner}>
          <View style={styles.helpIconBox}>
            <AppIcon name="support" size={22} color="#fff" />
          </View>
          <View style={styles.helpInfo}>
            <Text style={styles.helpTitle}>Need help with an order?</Text>
            <Text style={styles.helpSub}>Visit our Help Center for support</Text>
          </View>
          <TouchableOpacity 
            style={styles.helpBtn} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('HelpCenter' as any)}
          >
            <Text style={styles.helpBtnText}>Help Center</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  backIcon: { fontSize: 20, color: '#1A1A1A' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#1A1A1A', letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: '#888', marginTop: 1 },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  filterIcon: { fontSize: 16, color: '#555' },

  // Filter pills
  filterRow: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
    flexDirection: 'row',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  filterPillActive: { backgroundColor: BROWN },
  filterPillIcon: { fontSize: 13 },
  filterPillText: { fontSize: 14, fontWeight: '600', color: '#555' },
  filterPillTextActive: { color: '#FFFFFF' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 4 },

  // Order Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
    backgroundColor: '#EEE',
  },
  cardMeta: { flex: 1 },
  cardMetaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardRestaurant: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  cardDate: { fontSize: 12, color: '#999', marginBottom: 5 },
  cardItems: { fontSize: 13, color: '#555', marginBottom: 3 },
  cardOrderId: { fontSize: 12, color: '#AAA' },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 50,
    gap: 4,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDotIcon: { fontSize: 9, color: '#FFFFFF', fontWeight: '900' },

  cardDivider: { height: 1, backgroundColor: '#F2F2F2', marginBottom: 12 },

  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPrice: { fontSize: 20, fontWeight: '900', color: '#1A1A1A' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  viewDetailsBtn: {
    backgroundColor: '#F5F0EB',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 50,
  },
  viewDetailsRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  viewDetailsText: { fontSize: 12, fontWeight: '600', color: '#555' },

  reorderBtn: {
    backgroundColor: BROWN,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
    gap: 6,
  },
  reorderIcon: { fontSize: 13 },
  reorderText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  removeBtn: {
    borderWidth: 1.5,
    borderColor: '#C62828',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
    gap: 6,
  },
  removeBtnIcon: { fontSize: 13 },
  removeBtnText: { fontSize: 13, fontWeight: '700', color: '#C62828' },

  // Help Banner
  helpBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 4,
  },
  helpIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#C49A6C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpIcon: { fontSize: 22 },
  helpInfo: { flex: 1 },
  helpTitle: { fontSize: 14, fontWeight: '800', color: '#1A1A1A' },
  helpSub: { fontSize: 12, color: '#999', marginTop: 1 },
  helpBtn: {
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
  },
  helpBtnText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
});
