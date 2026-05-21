import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AppIcon from '../../components/ui/AppIcon';
import { ordersApi } from '../../services/api';
import { Order } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────
const BROWN = '#2C1A0E';
const ACCENT = '#8B5E3C';
const BG = '#F5F0EB';

const FILTERS = [
  { id: 'all',       label: 'All Orders',  icon: null },
  { id: 'delivered', label: 'Delivered',   icon: 'check' },
  { id: 'cancelled', label: 'Cancelled',   icon: 'close' },
  { id: 'reordered', label: 'Reordered',   icon: 'refresh' },
];

function formatOrderWhen(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
  };
}

function orderUiStatus(o: Order): 'delivered' | 'cancelled' | 'active' {
  if (o.status === 'DELIVERED') return 'delivered';
  if (o.status === 'CANCELLED') return 'cancelled';
  return 'active';
}

function mapOrder(o: Order & { items?: unknown }) {
  let itemList: any[] = [];
  if (Array.isArray(o.items)) itemList = o.items;
  else if (typeof o.items === 'string') {
    try {
      itemList = JSON.parse(o.items);
    } catch {
      itemList = [];
    }
  }
  const { date, time } = formatOrderWhen(o.created_at);
  const itemsStr = itemList.map((i: any) => `${i.quantity}x ${i.name}`).join(', ');
  return {
    raw: o,
    id: o.id,
    restaurant: o.cafe_name,
    date,
    time,
    items: itemsStr || '—',
    orderId: o.id.slice(0, 8).toUpperCase(),
    price: `₹${Number(o.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
    uiStatus: orderUiStatus(o),
    image: o.cafe_image || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=80',
  };
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const config: any = {
    delivered: { label: 'Delivered', bg: '#E8F5E9', color: '#2E7D32', icon: '✓' },
    cancelled:  { label: 'Cancelled', bg: '#FFEBEE', color: '#C62828', icon: '✕' },
    active:  { label: 'In progress', bg: '#FFF8E1', color: '#B8860B', icon: '⏱' },
    reordered:  { label: 'Reordered', bg: '#FFF8E1', color: '#B8860B', icon: '↺' },
  }[status] || { label: status, bg: '#F5F5F5', color: '#555', icon: '•' };

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
const OrderCard = ({
  order,
  onViewDetails,
  onReorder,
}: {
  order: any;
  onViewDetails: (id: string) => void;
  onReorder: (o: Order) => void;
}) => {
  const isCancelled = order.uiStatus === 'cancelled';

  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <Image source={{ uri: order.image }} style={styles.cardImage} />
        <View style={styles.cardMeta}>
          <View style={styles.cardMetaTop}>
            <Text style={styles.cardRestaurant}>{order.restaurant}</Text>
            <StatusBadge status={order.uiStatus} />
          </View>
          <Text style={styles.cardDate}>{order.date}  •  {order.time}</Text>
          <Text style={styles.cardItems}>{order.items}</Text>
          <Text style={styles.cardOrderId}>Order ID: #{order.orderId}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Bottom row */}
      <View style={styles.cardBottom}>
        <Text style={styles.cardPrice}>{order.price}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.viewDetailsBtn} activeOpacity={0.7} onPress={() => onViewDetails(order.raw.id)}>
            <View style={styles.viewDetailsRow}><Text style={styles.viewDetailsText}>View Details</Text><AppIcon name="▾" size={12} color="#555" /></View>
          </TouchableOpacity>
          {isCancelled ? (
            <TouchableOpacity style={styles.removeBtn} activeOpacity={0.7}>
              <AppIcon name="trash" size={13} color="#C62828" />
              <Text style={styles.removeBtnText}>Remove</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.reorderBtn} activeOpacity={0.85} onPress={() => onReorder(order.raw)}>
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
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await ordersApi.list({ limit: 50 });
      setOrders((data.data || []).map((o: Order) => mapOrder(o)));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = orders.filter((o) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'reordered') return false;
    return o.uiStatus === activeFilter;
  });

  const onViewDetails = (orderId: string) => {
    navigation.navigate('OrderTracking', { orderId });
  };

  const onReorder = (o: Order) => {
    navigation.navigate('Menu', { cafeId: o.cafe_id, cafeName: o.cafe_name });
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/app_bg.png')} 
      style={styles.safeArea}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

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
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterPill, 
                  isActive ? styles.filterPillActive : styles.filterPillInactive
                ]}
                onPress={() => setActiveFilter(f.id)}
                activeOpacity={0.8}
              >
                {f.icon && (
                  <AppIcon 
                    name={f.icon} 
                    size={14} 
                    color={isActive ? "#fff" : "#4A3520"} 
                    strokeWidth={2}
                  />
                )}
                <Text style={[
                  styles.filterPillText, 
                  isActive ? styles.filterPillTextActive : styles.filterPillTextInactive
                ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadOrders();
            }}
            tintColor={ACCENT}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : (
          filtered.map((order) => (
            <OrderCard key={order.id} order={order} onViewDetails={onViewDetails} onReorder={onReorder} />
          ))
        )}

        {!loading && filtered.length === 0 && (
          <View style={styles.emptyOrders}>
            <Text style={styles.emptyOrdersText}>No orders in this category yet.</Text>
          </View>
        )}

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
    </ImageBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, width: '100%' },

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
  filterContainer: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 10,
    flexDirection: 'row',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  filterPillActive: { 
    backgroundColor: '#4A3520',
    borderColor: '#4A3520',
  },
  filterPillInactive: {
    backgroundColor: '#F9F5F1',
    borderColor: '#E8DED3',
  },
  filterPillText: { 
    fontSize: 14, 
    fontWeight: '600',
  },
  filterPillTextActive: { 
    color: '#FFFFFF' 
  },
  filterPillTextInactive: {
    color: '#4A3520'
  },

  scrollContent: { paddingHorizontal: 20, paddingTop: 4, width: '100%' },

  loadingBox: { paddingVertical: 40, alignItems: 'center' },
  emptyOrders: { paddingVertical: 32, alignItems: 'center' },
  emptyOrdersText: { fontSize: 14, color: '#888' },

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
