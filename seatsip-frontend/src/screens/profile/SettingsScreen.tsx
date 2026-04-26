import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { CustomSwitch } from '../../components/ui/CustomSwitch';

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const ListItem = ({ icon, title, subtitle, onPress, hasArrow = true, rightElement }) => (
  <TouchableOpacity style={styles.listItem} onPress={onPress}>
    <Text style={styles.itemIcon}>{icon}</Text>
    <View style={styles.itemContent}>
      <Text style={styles.itemTitle}>{title}</Text>
      {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement || (hasArrow && <Text style={styles.arrow}>→</Text>)}
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [location, setLocation] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Settings</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader title="GENERAL" />
        <ListItem icon="🔔" title="Push Notifications" rightElement={
          <CustomSwitch value={notifications} onValueChange={setNotifications} />
        } hasArrow={false} />
        <Divider />
        <ListItem icon="🌙" title="Dark Mode" rightElement={
          <CustomSwitch value={darkMode} onValueChange={setDarkMode} />
        } hasArrow={false} />
        <Divider />
        <ListItem icon="📍" title="Location Services" rightElement={
          <CustomSwitch value={location} onValueChange={setLocation} />
        } hasArrow={false} />
        
        <SectionHeader title="ACCOUNT" />
        <ListItem icon="🔒" title="Change Password" />
        <Divider />
        <ListItem icon="🌐" title="Language" subtitle="English" />
        <Divider />
        <ListItem icon="💾" title="Clear Cache" />
        
        <SectionHeader title="ABOUT" />
        <ListItem icon="📱" title="App Version" subtitle="2.4.1" hasArrow={false} />
        <Divider />
        <ListItem icon="📄" title="Privacy Policy" />
        <Divider />
        <ListItem icon="📋" title="Terms of Service" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F7F4' },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: '#9E9E9E', letterSpacing: 1, marginTop: 24, marginBottom: 8, paddingHorizontal: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, backgroundColor: '#fff' },
  itemIcon: { fontSize: 20, marginRight: 14, width: 28 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 16, color: '#1A1A1A', fontWeight: '500' },
  itemSubtitle: { fontSize: 13, color: '#9E9E9E', marginTop: 2 },
  arrow: { fontSize: 18, color: '#BDBDBD' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 62 },
});
