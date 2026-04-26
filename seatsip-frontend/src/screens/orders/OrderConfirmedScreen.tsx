import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ordersApi } from '../../services/api';
import { Order } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import { Button } from '../../components/ui';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'OrderConfirmed'>;

export default function OrderConfirmedScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getById(params.orderId)
      .then(r => setOrder(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.orderId]);

  if (loading) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  const estTime = order?.estimated_ready_at
    ? new Date(order.estimated_ready_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.successCircle}>
          <Text style={styles.successEmoji}>✅</Text>
        </View>
        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>Your order has been placed successfully</Text>

        {order && (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Café</Text>
              <Text style={styles.value}>{order.cafe_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Order ID</Text>
              <Text style={styles.value}>#{order.id.slice(0, 8).toUpperCase()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Items</Text>
              <Text style={styles.value}>{order.items?.length || 0} item(s)</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total</Text>
              <Text style={[styles.value, { color: Colors.accent, fontWeight: Typography.bold }]}>₹{order.total?.toFixed(0)}</Text>
            </View>
            {estTime && (
              <View style={[styles.row, styles.readyRow]}>
                <Text style={styles.readyLabel}>⏱ Estimated Ready</Text>
                <Text style={styles.readyTime}>{estTime}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Track Order"
            onPress={() => navigation.replace('OrderTracking', { orderId: params.orderId })}
            fullWidth
            size="lg"
          />
          <Button
            title="Back to Home"
            onPress={() => navigation.navigate('MainTabs')}
            variant="outline"
            fullWidth
            size="lg"
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  successCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.success + '20', alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  successEmoji: { fontSize: 50 },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: Spacing.xl },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base,
    width: '100%', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
    marginBottom: Spacing.xl,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  label: { fontSize: Typography.sm, color: Colors.textSecondary },
  value: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.medium },
  readyRow: { borderBottomWidth: 0, marginTop: 4, backgroundColor: Colors.accent + '15', borderRadius: Radius.md, paddingHorizontal: 8 },
  readyLabel: { fontSize: Typography.sm, color: Colors.accent, fontWeight: Typography.semibold },
  readyTime: { fontSize: Typography.base, color: Colors.accent, fontWeight: Typography.extrabold },
  actions: { width: '100%' },
});
