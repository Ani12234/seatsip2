import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import { Button, Divider, EmptyState, VegIndicator } from '../../components/ui';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CartScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { cart, cartCount, isLoading, fetchCart, updateQuantity, clearCart } = useCart();

  useEffect(() => { fetchCart(); }, []);

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <div style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
          <Text style={styles.title}>Cart</Text>
          <View style={{ width: 32 }} />
        </div>
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          subtitle="Add items from a café menu to get started"
          action={{ label: 'Explore Cafés', onPress: () => navigation.navigate('MainTabs') }}
        />
      </View>
    );
  }

  const cafeName = cart.items[0]?.cafe_name;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
        <View>
          <Text style={styles.title}>Cart</Text>
          <Text style={styles.cafeName}>{cafeName}</Text>
        </View>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart.items}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: Spacing.base, paddingBottom: 200 }}
        ItemSeparatorComponent={() => <Divider style={{ marginVertical: 4 }} />}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.itemVeg}>
              <VegIndicator isVeg={!!item.is_veg} size={12} />
            </View>
            {item.image_url && (
              <Image source={{ uri: item.image_url }} style={styles.itemImg} resizeMode="cover" />
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.lineTotal}>₹{(item.price * item.quantity).toFixed(0)}</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryVal}>₹{cart.subtotal.toFixed(0)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>GST (5%)</Text><Text style={styles.summaryVal}>₹{cart.tax.toFixed(0)}</Text></View>
            <Divider style={{ marginVertical: 8 }} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalVal}>₹{cart.total.toFixed(0)}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <Button
          title={`Proceed to Checkout  ₹${cart.total.toFixed(0)}`}
          onPress={() => navigation.navigate('Checkout')}
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
  title: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center' },
  cafeName: { fontSize: Typography.xs, color: Colors.textMuted, textAlign: 'center' },
  clearText: { fontSize: Typography.sm, color: Colors.error, fontWeight: Typography.semibold },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.md, gap: 8, marginBottom: 4,
  },
  itemVeg: { padding: 4 },
  itemImg: { width: 52, height: 52, borderRadius: Radius.sm },
  itemInfo: { flex: 1 },
  itemName: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  itemPrice: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: Radius.sm,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { color: Colors.white, fontWeight: Typography.bold, fontSize: 16 },
  qtyNum: { width: 24, textAlign: 'center', fontWeight: Typography.bold, color: Colors.primary },
  lineTotal: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.primary, minWidth: 50, textAlign: 'right' },
  summary: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base,
    marginTop: Spacing.base, ...Shadow.sm,
  },
  summaryTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  summaryVal: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.medium },
  totalLabel: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  totalVal: { fontSize: Typography.md, fontWeight: Typography.extrabold, color: Colors.accent },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, padding: Spacing.base,
    borderTopWidth: 1, borderTopColor: Colors.divider,
  },
});
