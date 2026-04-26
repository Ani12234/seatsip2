import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function NotificationsScreen() {
  const notifications = [
    { id: '1', title: 'Order Delivered', message: 'Your order from Punjab Grill has been delivered. Enjoy!', time: '2 min ago', read: false, icon: '📦' },
    { id: '2', title: 'Reservation Confirmed', message: 'Your table at The Leela Palace is confirmed for 28 Apr.', time: '1 hour ago', read: false, icon: '✅' },
    { id: '3', title: '50% Off Weekend', message: 'Get 50% off on all orders above ₹500 this weekend.', time: '3 hours ago', read: true, icon: '🏷️' },
    { id: '4', title: 'Points Credited', message: '186 points have been added to your wallet.', time: 'Yesterday', read: true, icon: '🪙' },
    { id: '5', title: 'New Restaurant', message: 'Try the new Italian place near you - The Pasta Bowl.', time: '2 days ago', read: true, icon: '🍝' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Notifications</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {notifications.map((notif) => (
          <TouchableOpacity key={notif.id} style={[styles.notifItem, !notif.read && styles.notifUnread]}>
            <View style={[styles.notifIconBox, !notif.read && styles.notifIconBoxUnread]}>
              <Text>{notif.icon}</Text>
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifHeader}>
                <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}>{notif.title}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
              <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
            </View>
            {!notif.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F7F4' },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  notifItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, backgroundColor: '#fff' },
  notifUnread: { backgroundColor: '#FAFAFA' },
  notifIconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  notifIconBoxUnread: { backgroundColor: '#F5F0EB' },
  notifContent: { flex: 1, marginLeft: 14, marginRight: 8 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { fontSize: 15, color: '#616161', fontWeight: '500' },
  notifTitleUnread: { color: '#1A1A1A', fontWeight: '700' },
  notifTime: { fontSize: 12, color: '#BDBDBD' },
  notifMessage: { fontSize: 13, color: '#9E9E9E', marginTop: 3, lineHeight: 18 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8B6F47' },
});
