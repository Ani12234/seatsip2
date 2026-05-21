import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ordersApi } from '../../services/api';
import { Order } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import { Button } from '../../components/ui';
import AppIcon from '../../components/ui/AppIcon';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'OrderTracking'>;

const STEPS = [
  { key: 'CONFIRMED', label: 'Order Confirmed', icon: '✅', desc: 'Your order has been confirmed' },
  { key: 'PREPARING', label: 'Preparing', icon: '👨‍🍳', desc: 'The kitchen is preparing your order' },
  { key: 'READY', label: 'Ready', icon: '🎉', desc: 'Your order is ready for pickup!' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🏁', desc: 'Enjoy your meal!' },
];

export default function OrderTrackingScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<Order | null>(null);
  const intervalRef = useRef<any>(null);

  const loadOrder = async () => {
    try {
      const { data } = await ordersApi.getById(params.orderId);
      setOrder(data.data);
      if (['DELIVERED', 'CANCELLED'].includes(data.data.status)) {
        clearInterval(intervalRef.current);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadOrder();
    intervalRef.current = setInterval(loadOrder, 15000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            await ordersApi.cancel(params.orderId);
            await loadOrder();
          } catch (e: any) {
            Alert.alert('Cannot cancel', e?.response?.data?.message || 'Order cannot be cancelled now.');
          }
        },
      },
    ]);
  };

  const currentStepIndex = order ? STEPS.findIndex(s => s.key === order.status) : 0;
  const isCancelled = order?.status === 'CANCELLED';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><AppIcon name="back" size={22} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.title}>Order Status</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        {order && (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.cafeNameText}>{order.cafe_name}</Text>
              <Text style={styles.orderIdText}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
              <Text style={styles.orderTotal}>₹{order.total?.toFixed(0)} · {order.items?.length} item(s)</Text>
            </View>

            {isCancelled ? (
              <View style={styles.cancelledBadge}>
                <View style={styles.cancelledRow}><AppIcon name="close" size={22} color={Colors.error} /><Text style={styles.cancelledText}>Order Cancelled</Text></View>
              </View>
            ) : (
              <View style={styles.stepsContainer}>
                {STEPS.map((step, i) => {
                  const isDone = i < currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  return (
                    <View key={step.key} style={styles.stepRow}>
                      <View style={styles.stepLeft}>
                        <View style={[styles.stepDot, isDone && styles.stepDotDone, isCurrent && styles.stepDotCurrent]}>
                          <AppIcon name={isDone ? 'check' : step.icon} size={16} color={isDone || isCurrent ? Colors.white : Colors.textSecondary} />
                        </View>
                        {i < STEPS.length - 1 && (
                          <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
                        )}
                      </View>
                      <View style={styles.stepRight}>
                        <Text style={[styles.stepLabel, isCurrent && styles.stepLabelCurrent]}>{step.label}</Text>
                        {isCurrent && <Text style={styles.stepDesc}>{step.desc}</Text>}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {['CONFIRMED', 'PENDING'].includes(order.status) && (
              <Button title="Cancel Order" onPress={handleCancel} variant="danger" size="sm" style={{ marginTop: Spacing.lg }} />
            )}
          </>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <Button title="Back to Home" onPress={() => navigation.navigate('MainTabs')} variant="outline" fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  title: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  content: { flex: 1, padding: Spacing.base },
  infoCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base,
    marginBottom: Spacing.xl,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
    alignItems: 'center',
  },
  cafeNameText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  orderIdText: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
  orderTotal: { fontSize: Typography.base, color: Colors.accent, fontWeight: Typography.semibold, marginTop: 6 },
  cancelledBadge: {
    backgroundColor: Colors.error + '15', borderRadius: Radius.xl,
    padding: Spacing.xl, alignItems: 'center',
  },
  cancelledRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cancelledText: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.error },
  stepsContainer: { gap: 0 },
  stepRow: { flexDirection: 'row', gap: 16 },
  stepLeft: { alignItems: 'center', width: 40 },
  stepDot: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceElevated, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  stepDotCurrent: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  stepIcon: { fontSize: 16 },
  stepLine: { width: 2, flex: 1, backgroundColor: Colors.border, marginVertical: 4 },
  stepLineDone: { backgroundColor: Colors.success },
  stepRight: { flex: 1, paddingTop: 8, paddingBottom: Spacing.lg },
  stepLabel: { fontSize: Typography.base, color: Colors.textSecondary, fontWeight: Typography.medium },
  stepLabelCurrent: { color: Colors.textPrimary, fontWeight: Typography.bold, fontSize: Typography.md },
  stepDesc: { fontSize: Typography.sm, color: Colors.accent, marginTop: 4 },
  footer: {
    padding: Spacing.base, backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: Colors.divider,
  },
});
