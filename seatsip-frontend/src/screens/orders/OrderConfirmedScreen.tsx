import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import { ordersApi } from '../../services/api';
import { Order } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import AppIcon from '../../components/ui/AppIcon';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'OrderConfirmed'>;

function generateBars() {
  const pattern = [2,1,3,1,2,2,1,1,3,1,2,1,1,2,3,1,1,2,1,3,2,1,1,2,1,1,3,2,1,1,2,3,1,2,1,1,3,1,2,1,1,2,1,3,1,2,2,1,1,3,1,2,1,1,2,1];
  const bars: { x: number; w: number }[] = [];
  let x = 4;
  pattern.forEach((w, i) => {
    if (i % 2 === 0) bars.push({ x, w: w * 3 });
    x += w * 3;
  });
  return bars;
}

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
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const ticketId = order?.id ? order.id.slice(0, 8).toUpperCase() : "01200343";
  const amount = order?.total ? `₹${order.total.toFixed(0)}` : "₹0";
  const dateObj = order?.created_at ? new Date(order.created_at) : new Date();
  const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateTime = `${dateStr} • ${timeStr}`;
  const paymentMethod = order?.payment_method || 'WALLET';
  const paymentLabel = paymentMethod === 'CARD' ? 'Card' : paymentMethod === 'UPI' ? 'UPI' : 'Wallet';

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.centerContainer}>
        <View style={styles.card}>
          
          {/* Top */}
          <View style={styles.topSection}>
            <AppIcon name="🎉" size={48} color="#111827" style={styles.confirmIcon} />
            <Text style={styles.title}>Thank you!</Text>
            <Text style={styles.subtitle}>Your order has been placed{'\n'}successfully</Text>
          </View>

          {/* Tear divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.cutoutLeft} />
            <View style={styles.cutoutRight} />
            <View style={styles.dashedLine} />
          </View>

          {/* Body */}
          <View style={styles.bodySection}>
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>ORDER ID</Text>
                <Text style={styles.value}>{ticketId}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>AMOUNT</Text>
                <Text style={styles.value}>{amount}</Text>
              </View>
            </View>

            <View style={styles.rowSingle}>
              <Text style={styles.label}>DATE & TIME</Text>
              <Text style={styles.value}>{dateTime}</Text>
            </View>

            {/* Card pill */}
            <View style={styles.cardPill}>
              <View style={styles.mcLogo}>
                <AppIcon name={paymentMethod === 'WALLET' ? 'wallet' : 'payments'} size={22} color="#111827" />
              </View>
              <View>
                <Text style={styles.cardName}>Payment via {paymentLabel}</Text>
                <Text style={styles.cardLast4}>•••• SeatSip</Text>
              </View>
            </View>
          </View>

          {/* Barcode */}
          <View style={styles.barcodeSection}>
            <Svg width="240" height="64" viewBox="0 0 240 64" style={styles.barcodeSvg}>
              {generateBars().map((bar, i) => (
                <Rect key={i} x={bar.x} y={0} width={bar.w} height={64} fill="#111" />
              ))}
            </Svg>
            <Text style={styles.barcodeText}>
              2  8937261    273610
            </Text>
          </View>

        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.replace('OrderTracking', { orderId: params.orderId })}
          >
            <Text style={styles.primaryBtnTxt}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.secondaryBtnTxt}>Back to Home</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f7' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: 320,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 24 },
      android: { elevation: 5 },
      web: { boxShadow: '0 2px 24px rgba(0,0,0,0.07)' },
    })
  },
  
  // Top
  topSection: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 36, paddingBottom: 28 },
  confirmIcon: { marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 22 },

  // Tear divider
  dividerContainer: { height: 44, justifyContent: 'center', position: 'relative' },
  cutoutLeft: { position: 'absolute', left: -11, width: 22, height: 44, backgroundColor: '#f5f5f7', borderRadius: 11 },
  cutoutRight: { position: 'absolute', right: -11, width: 22, height: 44, backgroundColor: '#f5f5f7', borderRadius: 11 },
  dashedLine: { marginHorizontal: 20, height: 1, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed' },

  // Body
  bodySection: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  rowSingle: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.5, color: '#9ca3af', marginBottom: 4 },
  value: { fontSize: 17, fontWeight: '600', color: '#111827' },
  
  cardPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  mcLogo: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  mcCircle: { width: 22, height: 22, borderRadius: 11 },
  cardName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cardLast4: { fontSize: 13, color: '#9ca3af' },

  // Barcode
  barcodeSection: { borderTopWidth: 1, borderTopColor: '#f3f4f6', alignItems: 'center', paddingHorizontal: 28, paddingVertical: 24 },
  barcodeSvg: { marginBottom: 6 },
  barcodeText: { fontSize: 10, color: '#9ca3af', letterSpacing: 3, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  actions: { width: 320, marginTop: 30, gap: 12 },
  primaryBtn: { backgroundColor: '#111827', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  primaryBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryBtn: { backgroundColor: 'transparent', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  secondaryBtnTxt: { color: '#111827', fontSize: 16, fontWeight: '600' },
});
