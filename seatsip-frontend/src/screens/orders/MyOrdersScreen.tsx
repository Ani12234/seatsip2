import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function MyOrdersScreen() {
  const orders = [
    { id: '1', restaurant: 'Punjab Grill', date: '24 Apr 2026', items: 'Butter Chicken, Naan (2), Rice', total: '₹1,240', status: 'Delivered', statusColor: '#4CAF50' },
    { id: '2', restaurant: 'Dominos Pizza', date: '20 Apr 2026', items: 'Pepperoni Pizza, Garlic Bread', total: '₹689', status: 'Delivered', statusColor: '#4CAF50' },
    { id: '3', restaurant: 'Chinese Wok', date: '18 Apr 2026', items: 'Hakka Noodles, Manchurian', total: '₹450', status: 'Cancelled', statusColor: '#F44336' },
    { id: '4', restaurant: 'Starbucks', date: '15 Apr 2026', items: 'Caramel Frappuccino, Sandwich', total: '₹580', status: 'Delivered', statusColor: '#4CAF50' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>My Orders</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderRestaurant}>{order.restaurant}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '15' }]}>
                <Text style={[styles.statusText, { color: order.statusColor }]}>{order.status}</Text>
              </View>
            </View>
            
            <Text style={styles.orderItems}>{order.items}</Text>
            
            <View style={styles.orderFooter}>
              <Text style={styles.orderTotal}>{order.total}</Text>
              <TouchableOpacity style={styles.reorderBtn}>
                <Text style={styles.reorderText}>Reorder</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F7F4' },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  orderCard: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderRestaurant: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  orderDate: { fontSize: 13, color: '#9E9E9E', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderItems: { fontSize: 14, color: '#616161', marginTop: 10, lineHeight: 20 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  orderTotal: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  reorderBtn: { backgroundColor: '#3E2723', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  reorderText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
