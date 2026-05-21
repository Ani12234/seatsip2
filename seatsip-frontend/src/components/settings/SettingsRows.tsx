import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native';
import AppIcon from '../ui/AppIcon';

export const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export const Icon = ({ emoji, bg }: { emoji: string; bg: string }) => (
  <View style={[styles.iconWrapper, { backgroundColor: bg }]}>
    <AppIcon name={emoji} size={20} color="#333" />
  </View>
);

export const ToggleRow = ({ icon, bg, title, subtitle, value, onValueChange }: { 
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

export const ArrowRow = ({ icon, bg, title, subtitle, rightText, rightColor, onPress }: { 
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

export const LogoutRow = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <Icon emoji="logout" bg="#FFEBEE" />
    <View style={styles.rowText}>
      <Text style={[styles.rowTitle, { color: '#E53935' }]}>Log Out</Text>
      <Text style={styles.rowSubtitle}>Sign out from your account</Text>
    </View>
    <AppIcon name="›" size={18} color="#E53935" />
  </TouchableOpacity>
);

export const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#AAAAAA',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  rowSubtitle: {
    fontSize: 11,
    color: '#AAAAAA',
    marginTop: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rightText: {
    fontSize: 12,
    color: '#AAAAAA',
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F0F0F0',
    marginLeft: 72,
  },
});
