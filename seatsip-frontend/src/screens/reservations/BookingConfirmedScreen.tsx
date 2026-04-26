import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { Button, Divider } from '../../components/ui';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'BookingConfirmed'>;

export default function BookingConfirmedScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { reservation } = params;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.successCircle}>
          <Text style={styles.emoji}>🎉</Text>
        </View>

        <Text style={styles.title}>Table Reserved!</Text>
        <Text style={styles.subtitle}>Your booking is confirmed. We'll see you there!</Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Confirmation Code</Text>
          <Text style={styles.code}>{reservation?.confirmation_code || '—'}</Text>
          <Text style={styles.codeHint}>Show this at the café</Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Booking Details</Text>
          <Divider style={{ marginBottom: Spacing.sm }} />
          {[
            { label: '📍 Venue', value: reservation?.cafe_name },
            { label: '📅 Date', value: reservation?.date },
            { label: '⏰ Time', value: reservation?.time },
            { label: '👥 Party Size', value: `${reservation?.party_size} people` },
            reservation?.table_number && { label: '🪑 Table', value: `Table ${reservation.table_number}` },
          ].filter(Boolean).map((item: any) => (
            <View key={item.label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            title="🍽 Pre-order Food & Drinks"
            onPress={() => navigation.navigate('PreOrderMenu', { 
              cafeId: reservation.cafe_id, 
              cafeName: reservation.cafe_name,
              reservationData: reservation 
            })}
            fullWidth
            size="lg"
            style={{ backgroundColor: '#4A2E0A' }}
            textStyle={{ color: '#FFF3CD' }}
          />
          <Button
            title="Back to Home"
            onPress={() => navigation.navigate('MainTabs')}
            fullWidth
            size="lg"
            variant="outline"
            style={{ marginTop: 12 }}
          />
          <Button
            title="View Reservations"
            onPress={() => navigation.navigate('ReservationHistory' as any)}
            variant="outline"
            fullWidth
            size="lg"
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: Spacing.xl, alignItems: 'center', justifyContent: 'center' },
  successCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.accent + '20', alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emoji: { fontSize: 50 },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: Spacing.xl },
  codeCard: {
    backgroundColor: Colors.primary, borderRadius: Radius.xl, padding: Spacing.xl,
    alignItems: 'center', width: '100%', marginBottom: Spacing.base,
  },
  codeLabel: { fontSize: Typography.sm, color: Colors.cream, opacity: 0.8 },
  code: { fontSize: Typography['3xl'], fontWeight: Typography.extrabold, color: Colors.white, letterSpacing: 4, marginVertical: 8 },
  codeHint: { fontSize: Typography.xs, color: Colors.cream, opacity: 0.6 },
  detailsCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base,
    width: '100%',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
    marginBottom: Spacing.xl,
  },
  detailsTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  detailLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  detailValue: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.medium },
  actions: { width: '100%' },
});
