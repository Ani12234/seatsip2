import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import { Button, Divider } from '../../components/ui';
import AppIcon from '../../components/ui/AppIcon';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ORDER_TYPES = [
  { id: 'DINE_IN', label: 'Dine In', icon: '🪑' },
  { id: 'TAKEOUT', label: 'Takeout', icon: '🥡' },
  { id: 'DELIVERY', label: 'Delivery', icon: '🚚' },
];

const PAYMENT_METHODS = [
  { id: 'WALLET', label: 'Wallet', icon: '👛' },
  { id: 'UPI', label: 'UPI', icon: '📱' },
  { id: 'CARD', label: 'Card', icon: '💳' },
];

export default function CheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { cart, clearCart } = useCart();
  const { user, refreshUser } = useAuth();

  const [orderType, setOrderType] = useState('DINE_IN');
  const [paymentMethod, setPaymentMethod] = useState('WALLET');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  if (!cart || cart.items.length === 0) {
    navigation.goBack();
    return null;
  }

  const cafeId = cart.items[0]?.cafe_id;
  const deliveryFee = orderType === 'DELIVERY' ? 40 : 0;
  const finalTotal = cart.total + deliveryFee;

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'WALLET' && user && user.wallet_balance < finalTotal) {
      Alert.alert('Insufficient Balance', `Your wallet has ₹${user.wallet_balance.toFixed(0)} but order total is ₹${finalTotal.toFixed(0)}. Please top up your wallet.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Top Up', onPress: () => navigation.navigate('WalletScreen') },
      ]);
      return;
    }

    try {
      setLoading(true);
      const items = cart.items.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity }));
      const { data } = await ordersApi.create({
        cafe_id: cafeId,
        items,
        order_type: orderType,
        payment_method: paymentMethod,
        special_instructions: specialInstructions || undefined,
      });
      await clearCart();
      await refreshUser();
      navigation.replace('OrderConfirmed', { orderId: data.data.id });
    } catch (err: any) {
      Alert.alert('Order failed', err?.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><AppIcon name="back" size={22} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.base, paddingBottom: 160 }}>
        {/* Order type */}
        <Text style={styles.sectionTitle}>Order Type</Text>
        <View style={styles.optionRow}>
          {ORDER_TYPES.map(o => (
            <TouchableOpacity
              key={o.id}
              onPress={() => setOrderType(o.id)}
              style={[styles.option, orderType === o.id && styles.optionActive]}
            >
              <View style={styles.optionInner}><AppIcon name={o.icon} size={16} color={orderType === o.id ? Colors.primary : Colors.textSecondary} /><Text style={[styles.optionText, orderType === o.id && styles.optionTextActive]}>{o.label}</Text></View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.optionRow}>
          {PAYMENT_METHODS.map(p => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setPaymentMethod(p.id)}
              style={[styles.option, paymentMethod === p.id && styles.optionActive]}
            >
              <View style={styles.optionInner}><AppIcon name={p.icon} size={16} color={paymentMethod === p.id ? Colors.primary : Colors.textSecondary} /><Text style={[styles.optionText, paymentMethod === p.id && styles.optionTextActive]}>{p.label}</Text></View>
            </TouchableOpacity>
          ))}
        </View>
        {paymentMethod === 'WALLET' && (
          <View style={styles.walletInfo}>
            <Text style={styles.walletText}>Wallet balance: ₹{user?.wallet_balance?.toFixed(0) || '0'}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('WalletScreen')}>
              <Text style={styles.topupLink}>+ Top Up</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order summary */}
        <Text style={styles.sectionTitle}>Items ({cart.items.length})</Text>
        <View style={styles.summaryCard}>
          {cart.items.map(item => (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={styles.summaryName}>{item.quantity}× {item.name}</Text>
              <Text style={styles.summaryPrice}>₹{(item.price * item.quantity).toFixed(0)}</Text>
            </View>
          ))}
          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text>₹{cart.subtotal.toFixed(0)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>GST (5%)</Text><Text>₹{cart.tax.toFixed(0)}</Text></View>
          {deliveryFee > 0 && <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery Fee</Text><Text>₹{deliveryFee}</Text></View>}
          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>₹{finalTotal.toFixed(0)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <Button
          title={loading ? 'Placing Order…' : `Place Order  ₹${finalTotal.toFixed(0)}`}
          onPress={handlePlaceOrder}
          loading={loading}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, ...Shadow.sm,
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  title: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginTop: Spacing.base, marginBottom: Spacing.sm },
  optionRow: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1, paddingVertical: 12, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  optionActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  optionInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  optionText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  optionTextActive: { color: Colors.primary, fontWeight: Typography.bold },
  walletInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingHorizontal: 4 },
  walletText: { fontSize: Typography.sm, color: Colors.textSecondary },
  topupLink: { fontSize: Typography.sm, color: Colors.accent, fontWeight: Typography.bold },
  summaryCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  summaryName: { fontSize: Typography.sm, color: Colors.textPrimary, flex: 1 },
  summaryPrice: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  summaryLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  totalLabel: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  totalVal: { fontSize: Typography.md, fontWeight: Typography.extrabold, color: Colors.accent },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, padding: Spacing.base,
    borderTopWidth: 1, borderTopColor: Colors.divider,
  },
});
