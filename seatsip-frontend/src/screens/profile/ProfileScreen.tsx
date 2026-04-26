import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import { Divider, Button } from '../../components/ui';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (e) {
        console.error('Logout error', e);
      }
    };

    if (Platform.OS === 'web') {
      performLogout();
    } else {
      Alert.alert('Logout', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: performLogout },
      ]);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.guestContainer}>
          <Text style={styles.guestEmoji}>👤</Text>
          <Text style={styles.guestTitle}>Welcome to SeatSip</Text>
          <Text style={styles.guestSub}>Sign in to manage your profile, orders, and wallet.</Text>
          <Button title="Sign In" onPress={() => navigation.navigate('Login')} fullWidth size="lg" />
          <Button title="Create Account" onPress={() => navigation.navigate('Register')} variant="outline" fullWidth size="lg" style={{ marginTop: 12 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.headerTitle}>Profile</Text>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
              <Text style={styles.editLink}>Edit Profile →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('WalletScreen')}>
            <Text style={styles.statVal}>₹{user?.wallet_balance?.toFixed(0) || '0'}</Text>
            <Text style={styles.statLabel}>Wallet</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statBox}>
            <Text style={styles.statVal}>{user?.loyalty_points || '0'}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>History</Text>
          <MenuItem icon="📋" label="My Orders" onPress={() => navigation.navigate('OrderHistory')} />
          <MenuItem icon="🪑" label="Reservations" onPress={() => navigation.navigate('ReservationHistory')} />

          <Text style={[styles.menuTitle, { marginTop: 20 }]}>Preferences</Text>
          <MenuItem icon="🔔" label="Notifications" onPress={() => navigation.navigate('NotificationsScreen')} />
          <MenuItem icon="💳" label="Payments & Wallet" onPress={() => navigation.navigate('WalletScreen')} />
          <MenuItem icon="⚙️" label="Settings" onPress={() => navigation.navigate('Settings')} />

          <Text style={[styles.menuTitle, { marginTop: 20 }]}>Support</Text>
          <MenuItem icon="💬" label="Help Center" onPress={() => navigation.navigate('HelpCenter' as any)} />
          <MenuItem icon="📄" label="Terms & Conditions" onPress={() => navigation.navigate('Terms' as any)} />

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0 (Expo)</Text>
      </ScrollView>
    </View>
  );
}

const MenuItem = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <Text style={styles.menuArrow}>→</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  headerTitle: {
    fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: Colors.textPrimary,
    paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.base,
  },
  guestContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  guestEmoji: { fontSize: 60, marginBottom: 20 },
  guestTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 8 },
  guestSub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.base,
    marginHorizontal: Spacing.base, backgroundColor: Colors.surface,
    borderRadius: Radius.xl, ...Shadow.md, gap: 16,
  },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: Typography.bold, color: Colors.white },
  userInfo: { flex: 1 },
  userName: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  userEmail: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  editLink: { fontSize: Typography.sm, color: Colors.accent, fontWeight: Typography.semibold, marginTop: 8 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    marginHorizontal: Spacing.base, marginTop: Spacing.base, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, ...Shadow.sm,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.divider },
  statVal: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.primary },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  menuContainer: { paddingHorizontal: Spacing.base, marginTop: 24 },
  menuTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { fontSize: 18 },
  menuLabel: { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.medium },
  menuArrow: { color: Colors.textMuted, fontSize: 18 },
  logoutBtn: { marginTop: 32, alignItems: 'center', padding: 16 },
  logoutText: { color: Colors.error, fontWeight: Typography.bold, fontSize: Typography.base },
  version: { textAlign: 'center', fontSize: Typography.xs, color: Colors.textMuted, marginTop: 20 },
});
