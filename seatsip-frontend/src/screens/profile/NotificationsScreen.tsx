import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AppIcon from '../../components/ui/AppIcon';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  accentColor: string;
  bgColor: string;
  dotColor: string;
  icon: React.ReactNode;
};

// ─── SVG Icon Components (using View/Text shapes) ─────────────────────────────

const DeliveryIcon = () => (
  <View style={[styles.iconWrapper, { backgroundColor: '#f0faf2' }]}>
    <View style={styles.iconInner}>
      <AppIcon name="package" size={22} color="#4caf50" />
    </View>
    <View style={styles.iconBadge}>
      <AppIcon name="check" size={8} color="#fff" />
    </View>
  </View>
);

const CalendarIcon = () => (
  <View style={[styles.iconWrapper, { backgroundColor: '#eef2fd' }]}>
    <View style={styles.iconInner}>
      <AppIcon name="calendar" size={22} color="#5c8be8" />
    </View>
    <View style={[styles.iconBadge, { backgroundColor: '#5c8be8' }]}>
      <AppIcon name="check" size={8} color="#fff" />
    </View>
  </View>
);

const OfferIcon = () => (
  <View style={[styles.iconWrapper, { backgroundColor: '#fff8ed' }]}>
    <View style={styles.iconInner}>
      <AppIcon name="🏷️" size={22} color="#f5a623" />
    </View>
    <View style={[styles.iconBadge, { backgroundColor: '#f5a623' }]}>
      <Text style={{ fontSize: 8, color: '#fff' }}>!</Text>
    </View>
  </View>
);

const StarIcon = () => (
  <View style={[styles.iconWrapper, { backgroundColor: '#f5f0fd' }]}>
    <View style={styles.iconInner}>
      <AppIcon name="points" size={22} color="#9c6de8" fill="#9c6de8" />
    </View>
  </View>
);

const RestaurantIcon = () => (
  <View style={[styles.iconWrapper, { backgroundColor: '#e8faf6' }]}>
    <View style={styles.iconInner}>
      <AppIcon name="🏪" size={22} color="#2bbfa0" />
    </View>
  </View>
);

// ─── Notification Data ─────────────────────────────────────────────────────────

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Order Delivered',
    description: 'Your order from Punjab Grill has been delivered. Enjoy!',
    time: '2 min ago',
    accentColor: '#4caf50',
    bgColor: '#f0faf2',
    dotColor: '#4caf50',
    icon: <DeliveryIcon />,
  },
  {
    id: '2',
    title: 'Reservation Confirmed',
    description: 'Your table at The Leela Palace is confirmed for 28 Apr.',
    time: '1 hour ago',
    accentColor: '#5c8be8',
    bgColor: '#eef2fd',
    dotColor: '#5c8be8',
    icon: <CalendarIcon />,
  },
  {
    id: '3',
    title: '50% Off Weekend',
    description: 'Get 50% off on all orders above ₹500 this weekend.',
    time: '3 hours ago',
    accentColor: '#f5a623',
    bgColor: '#fff8ed',
    dotColor: '#f5a623',
    icon: <OfferIcon />,
  },
  {
    id: '4',
    title: 'Points Credited',
    description: '186 points have been added to your wallet.',
    time: 'Yesterday',
    accentColor: '#9c6de8',
    bgColor: '#f5f0fd',
    dotColor: '#9c6de8',
    icon: <StarIcon />,
  },
  {
    id: '5',
    title: 'New Restaurant',
    description: 'Try the new Italian place near you – The Pasta Bowl.',
    time: '2 days ago',
    accentColor: '#2bbfa0',
    bgColor: '#e8faf6',
    dotColor: '#2bbfa0',
    icon: <RestaurantIcon />,
  },
];

// ─── Notification Card ─────────────────────────────────────────────────────────

type NotificationCardProps = {
  item: NotificationItem;
  onPress?: () => void;
};

const NotificationCard: React.FC<NotificationCardProps> = ({ item, onPress }) => (
  <TouchableOpacity
    style={[styles.card, { borderLeftColor: item.accentColor }]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    {/* Icon */}
    {item.icon}

    {/* Text Content */}
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardTime}>{item.time}</Text>
      </View>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>
    </View>

    {/* Unread Dot */}
    <View style={[styles.unreadDot, { backgroundColor: item.dotColor }]} />
  </TouchableOpacity>
);

// ─── Push Notification Banner ──────────────────────────────────────────────────

const PushNotificationBanner: React.FC<{ onPress?: () => void }> = ({ onPress }) => (
  <View style={styles.banner}>
    <View style={styles.bannerLeft}>
      <AppIcon name="notification" size={24} color="#fff" />
    </View>
    <View style={styles.bannerContent}>
      <Text style={styles.bannerTitle}>Never miss an update!</Text>
      <Text style={styles.bannerSubtitle}>
        Enable push notifications to get the latest updates and offers.
      </Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.bannerCTA}>Enable Notifications {'>'}</Text>
      </TouchableOpacity>
    </View>
    <AppIcon name="📬" size={40} color="#6d5d4f" />
  </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFilter = () => {
    console.log('Open filter');
  };

  const handleNotificationPress = (id: string) => {
    console.log(`Notification pressed: ${id}`);
  };

  const handleEnableNotifications = () => {
    console.log('Enable notifications tapped');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f5f0" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppIcon name="back" size={22} color="#2c2418" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleFilter}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppIcon name="settings" size={22} color="#2c2418" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {NOTIFICATIONS.map((item) => (
          <NotificationCard
            key={item.id}
            item={item}
            onPress={() => handleNotificationPress(item.id)}
          />
        ))}

        {/* Push Banner */}
        <PushNotificationBanner onPress={handleEnableNotifications} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f5f0',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#f7f5f0',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eeebe5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonIcon: {
    fontSize: 16,
    color: '#444',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
    gap: 10,
  },

  // ── Notification Card ──
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 3,
    gap: 12,
    // Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Elevation (Android)
    elevation: 1,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  cardTime: {
    fontSize: 11,
    color: '#999',
    flexShrink: 0,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    flexShrink: 0,
  },

  // ── Icon ──
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  // ── Push Notification Banner ──
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf3e7',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    gap: 12,
  },
  bannerLeft: {
    flexShrink: 0,
  },
  bannerIcon: {
    fontSize: 24,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#c47d2a',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#9a6020',
    lineHeight: 16,
    marginBottom: 8,
  },
  bannerCTA: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c47d2a',
  },
});
