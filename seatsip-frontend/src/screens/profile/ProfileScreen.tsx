import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ImageBackground
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import AppIcon from '../../components/ui/AppIcon';

// ─── Constants ────────────────────────────────────────────────────────────────
const BROWN = '#2C1A0E';
const ACCENT = '#8B5E3C';
const BG = '#F5F0EB';

const ACTIVITY_ITEMS = [
  { id: '1', icon: '📋', label: 'My Orders',     sub: 'View your past orders', route: 'OrderHistory' },
  { id: '2', icon: '🪑', label: 'Reservations',  sub: 'View your table reservations', route: 'ReservationHistory' },
];

const PREFERENCE_ITEMS = [
  { id: '1', icon: '🔔', label: 'Notifications',      sub: 'Manage your notifications',     iconBg: '#E8F5E9', iconColor: '#2E7D32', route: 'NotificationsScreen' },
  { id: '2', icon: '💳', label: 'Payments & Wallet',  sub: 'Manage cards and balance',       iconBg: '#E8F5E9', iconColor: '#2E7D32', route: 'WalletScreen' },
  { id: '3', icon: '⚙️', label: 'Settings',           sub: 'App settings and preferences',   iconBg: '#E8F5E9', iconColor: '#2E7D32', route: 'Settings' },
];

const SUPPORT_ITEMS = [
  { id: '1', icon: '❓', label: 'Help Center',        sub: 'Get help and support',  iconBg: '#EDE7F6', iconColor: '#4527A0', route: 'HelpCenter' },
  { id: '2', icon: '📋', label: 'Terms & Conditions', sub: 'Read our policies',     iconBg: '#EDE7F6', iconColor: '#4527A0', route: 'Terms' },
  { id: '3', icon: '📄', label: 'Privacy Policy',     sub: 'Read our privacy practices', iconBg: '#EDE7F6', iconColor: '#4527A0', route: 'PrivacyPolicy' },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Menu Row ─────────────────────────────────────────────────────────────────
const MenuRow = ({ item, isLast, iconBg, onPress }: { item: any, isLast: boolean, iconBg?: string, onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.menuRow, !isLast && styles.menuRowBorder]}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View style={[styles.menuIconBox, { backgroundColor: iconBg || '#F5EDE6' }]}>
      <AppIcon name={item.icon} size={20} color={item.iconColor || ACCENT} />
    </View>
    <View style={styles.menuInfo}>
      <Text style={styles.menuLabel}>{item.label}</Text>
      <Text style={styles.menuSub}>{item.sub}</Text>
    </View>
    <AppIcon name="›" size={22} color="#CCCCCC" />
  </TouchableOpacity>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
const SectionDivider = () => (
  <View style={styles.divider} />
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const avatarUri = user?.avatar;
  const avatarInitial = (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  const points = user?.loyalty_points ?? 0;
  
  const getTierInfo = () => {
    if (points >= 4000) return { name: 'CREAM', color: '#3F1D0E' };
    if (points >= 2000) return { name: 'CARAMEL', color: '#B8860B' };
    return { name: 'COFFEE', color: '#6D3914' };
  };

  const tier = getTierInfo();

  return (
    <ImageBackground 
      source={require('../../assets/images/app_bg.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── User Card ── */}
          <View style={styles.userCard}>
            {/* Avatar */}
            <TouchableOpacity 
              style={styles.avatar}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EditProfile')}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarLetter}>{avatarInitial}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{user?.name}</Text>
                <View style={styles.goldBadge}>
                  <AppIcon name="points" size={11} color={tier.color} fill={tier.color} />
                  <Text style={[styles.goldText, { color: tier.color }]}>{tier.name} Member</Text>
                </View>
              </View>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('EditProfile')} style={styles.editProfileRow}>
                <Text style={styles.editProfile}>Edit Profile</Text>
                <AppIcon name="arrow" size={14} color={ACCENT} />
              </TouchableOpacity>
            </View>

            <AppIcon name="›" size={22} color="#CCCCCC" />
          </View>



          {/* ── My Activity ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MY ACTIVITY</Text>
            <View style={styles.menuCard}>
              {ACTIVITY_ITEMS.map((item, index) => (
                <MenuRow
                  key={item.id}
                  item={item}
                  isLast={index === ACTIVITY_ITEMS.length - 1}
                  iconBg="#F5EDE6"
                  onPress={() => navigation.navigate(item.route as any)}
                />
              ))}
            </View>
          </View>

          <SectionDivider />

          {/* ── Preferences ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PREFERENCES</Text>
            <View style={styles.menuCard}>
              {PREFERENCE_ITEMS.map((item, index) => (
                <MenuRow
                  key={item.id}
                  item={item}
                  isLast={index === PREFERENCE_ITEMS.length - 1}
                  iconBg="#E8F5E9"
                  onPress={() => navigation.navigate(item.route as any)}
                />
              ))}
            </View>
          </View>

          <SectionDivider />

          {/* ── Support ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SUPPORT</Text>
            <View style={styles.menuCard}>
              {SUPPORT_ITEMS.map((item, index) => (
                <MenuRow
                  key={item.id}
                  item={item}
                  isLast={index === SUPPORT_ITEMS.length - 1}
                  iconBg="#EDE7F6"
                  onPress={() => navigation.navigate(item.route as any)}
                />
              ))}
            </View>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Need help? Visit our{' '}
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate('HelpCenter' as any)}
              >
                Help Center
              </Text>
            </Text>
          </View>


        </ScrollView>
      </View>
    </ImageBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  safeArea: { flex: 1, width: '100%' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  settingsIcon: { fontSize: 20 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, width: '100%' },

  // User Card
  userCard: {
    backgroundColor: '#FAF3E8',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#C49A6C',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarLetter: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userInfo: { flex: 1 },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 3,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 50,
    gap: 3,
  },
  goldStar: { fontSize: 11 },
  goldText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B8860B',
  },
  userEmail: { fontSize: 13, color: '#888', marginBottom: 5 },
  editProfileRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editProfile: { fontSize: 14, fontWeight: '700', color: ACCENT },

  // Sections
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5D4037',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 2,
  },
  menuCard: {
    backgroundColor: '#FAF3E8',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: { fontSize: 20 },
  menuInfo: { flex: 1 },
  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  menuSub: { fontSize: 13, color: '#999' },
  chevron: { fontSize: 22, color: '#CCCCCC' },

  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  footerLink: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 10,
    marginHorizontal: 12,
  },
});
