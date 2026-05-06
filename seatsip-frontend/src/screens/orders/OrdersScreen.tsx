import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ordersApi } from '../../services/api';
import { Order } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import { EmptyState } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import AppIcon from '../../components/ui/AppIcon';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_COLORS: Record<string, string> = {
  PENDING: Colors.warning,
  CONFIRMED: Colors.info,
  PREPARING: Colors.accent,
  READY: Colors.success,
  DELIVERED: Colors.textMuted,
  CANCELLED: Colors.error,
};

export default function OrdersScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const { data } = await ordersApi.list({ limit: 20 });
      setOrders(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => {
    if (isAuthenticated) loadOrders();
    else setLoading(false);
  }, [isAuthenticated]));

  if (!isAuthenticated) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, backgroundColor: Colors.background }]}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <EmptyState
          emoji="🔐"
          title="Sign in to view orders"
          subtitle="Track your past and current orders"
          action={{ label: 'Sign In', onPress: () => navigation.navigate('Login') }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: Colors.background }]}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.headerTitle}>My Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} tintColor={Colors.accent} />}
        contentContainerStyle={{ padding: Spacing.base, paddingBottom: insets.bottom + 80, flexGrow: 1 }}
        ListEmptyComponent={!loading ? (
          <EmptyState
            emoji="📋"
            title="No orders yet"
            subtitle="Your order history will appear here"
            action={{ label: 'Explore Cafés', onPress: () => navigation.navigate('MainTabs') }}
          />
        ) : null}
        renderItem={({ item: order }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
            activeOpacity={0.85}
          >
            <View style={styles.cardTop}>
              {order.cafe_image ? (
                <Image source={{ uri: order.cafe_image }} style={styles.cafeImg} resizeMode="cover" />
              ) : (
                <View style={[styles.cafeImg, { backgroundColor: Colors.accent + '30', alignItems: 'center', justifyContent: 'center' }]}>
                  <AppIcon name="coffee" size={24} color={Colors.accent} />
                </View>
              )}
              <View style={styles.cardInfo}>
                <Text style={styles.cafeName}>{order.cafe_name}</Text>
                <Text style={styles.orderMeta}>{order.items?.length} item(s) · ₹{order.total?.toFixed(0)}</Text>
                <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[order.status] || Colors.textMuted) + '20' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] || Colors.textMuted }]}>{order.status}</Text>
              </View>
            </View>

            {['CONFIRMED', 'PREPARING', 'READY'].includes(order.status) && (
              <TouchableOpacity
                style={styles.trackBtn}
                onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
              >
                <View style={styles.trackBtnRow}><Text style={styles.trackBtnText}>Track Order</Text><AppIcon name="→" size={14} color={Colors.accent} /></View>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerTitle: {
    fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: Colors.textPrimary,
    paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.base,
  },
  orderCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    marginBottom: Spacing.md, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: 'row', padding: Spacing.base, gap: 12, alignItems: 'center' },
  cafeImg: { width: 60, height: 60, borderRadius: Radius.md },
  cardInfo: { flex: 1 },
  cafeName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  orderMeta: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  orderDate: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { fontSize: 10, fontWeight: Typography.bold },
  trackBtn: {
    borderTopWidth: 1, borderTopColor: Colors.divider,
    padding: Spacing.md, alignItems: 'center',
  },
  trackBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trackBtnText: { fontSize: Typography.sm, color: Colors.accent, fontWeight: Typography.semibold },
});
