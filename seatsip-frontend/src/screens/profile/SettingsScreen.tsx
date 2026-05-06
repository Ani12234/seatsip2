import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import AppIcon from '../../components/ui/AppIcon';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const Icon = ({ emoji, bg }: { emoji: string; bg: string }) => (
  <View style={[styles.iconWrapper, { backgroundColor: bg }]}>
    <AppIcon name={emoji} size={20} color="#333" />
  </View>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const ToggleRow = ({ icon, bg, title, subtitle, value, onValueChange }: { 
  icon: string; bg: string; title: string; subtitle: string; value: boolean; onValueChange: (v: boolean) => void 
}) => (
  <View style={styles.row}>
    <Icon emoji={icon} bg={bg} />
    <View style={styles.rowText}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowSubtitle}>{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#E0E0E0"
    />
  </View>
);

const ArrowRow = ({ icon, bg, title, subtitle, rightText, rightColor, onPress }: { 
  icon: string; bg: string; title: string; subtitle: string; rightText?: string; rightColor?: string; onPress: () => void 
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <Icon emoji={icon} bg={bg} />
    <View style={styles.rowText}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.rowRight}>
      {rightText ? (
        <Text style={[styles.rightText, rightColor ? { color: rightColor } : null]}>
          {rightText}
        </Text>
      ) : null}
      <AppIcon name="›" size={18} color="#C0C0C0" />
    </View>
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

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
      ], { cancelable: true });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F5F0" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <AppIcon name="back" size={18} color="#333" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your preferences and account.</Text>
          </View>
        </View>

        {/* GENERAL */}
        <View style={styles.section}>
          <SectionHeader title="GENERAL" />
          <ToggleRow
            icon="🔔"
            bg="#FFF3E0"
            title="Push Notifications"
            subtitle="Stay updated with order & offers"
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
          <Divider />
          <ToggleRow
            icon="🌙"
            bg="#EDE7F6"
            title="Dark Mode"
            subtitle="Switch to dark theme"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          <Divider />
          <ToggleRow
            icon="📍"
            bg="#E8F5E9"
            title="Location Services"
            subtitle="Improve recommendations"
            value={locationServices}
            onValueChange={setLocationServices}
          />
        </View>

        {/* ACCOUNT */}
        <View style={styles.section}>
          <SectionHeader title="ACCOUNT" />
          <ArrowRow
            icon="🔒"
            bg="#FFF8E1"
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => {}}
          />
          <Divider />
          <ArrowRow
            icon="🌐"
            bg="#E3F2FD"
            title="Language"
            subtitle="English"
            onPress={() => {}}
          />
          <Divider />
          <ArrowRow
            icon="🗑️"
            bg="#FFEBEE"
            title="Clear Cache"
            subtitle="Free up storage space"
            rightText="24.8 MB"
            onPress={() => {}}
          />
        </View>

        {/* ABOUT */}
        <View style={styles.section}>
          <SectionHeader title="ABOUT" />
          <ArrowRow
            icon="📱"
            bg="#EDE7F6"
            title="App Version"
            subtitle="2.4.1 (Latest)"
            rightText="Up to date"
            rightColor="#4CAF50"
            onPress={() => {}}
          />
          <Divider />
          <ArrowRow
            icon="📄"
            bg="#E8EAF6"
            title="Privacy Policy"
            subtitle="Read our privacy practices"
            onPress={() => {}}
          />
          <Divider />
          <ArrowRow
            icon="📋"
            bg="#FFF8E1"
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() => {}}
          />
        </View>

        {/* Log Out */}
        <View style={[styles.section, styles.logoutSection]}>
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={handleLogout}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FFEBEE' }]}>
              <AppIcon name="logout" size={20} color="#C62828" />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, styles.logoutText]}>Log Out</Text>
              <Text style={styles.rowSubtitle}>Sign out from your account</Text>
            </View>
            <AppIcon name="›" size={18} color="#C62828" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need help? Visit our{' '}
            <Text style={styles.footerLink} onPress={() => navigation.navigate('HelpCenter' as any)}>Help Center</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F5F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F5F0',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: '#333',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },

  // Section
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#AAAAAA',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconEmoji: {
    fontSize: 20,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rightText: {
    fontSize: 13,
    color: '#AAAAAA',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 22,
    color: '#CCCCCC',
    fontWeight: '300',
    lineHeight: 24,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F0F0F0',
    marginLeft: 72,
  },

  // Logout
  logoutSection: {},
  logoutText: {
    color: '#E53935',
  },
  logoutChevron: {
    color: '#E53935',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  footerLink: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
