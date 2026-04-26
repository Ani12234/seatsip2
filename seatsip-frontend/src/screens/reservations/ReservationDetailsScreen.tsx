import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reservationsApi } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import { Button, Divider } from '../../components/ui';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ReservationDetails'>;

export default function ReservationDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();

  const [date, setDate] = useState(getTomorrow());
  const [time, setTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);

  function getTomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  const TIME_SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '20:00', '21:00'];

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const { data } = await reservationsApi.create({
        cafe_id: params.cafeId,
        table_id: params.tableId,
        date,
        time,
        party_size: partySize,
        special_requests: specialRequests || undefined,
      });
      navigation.replace('BookingConfirmed', { reservation: data.data });
    } catch (err: any) {
      Alert.alert('Booking failed', err?.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Reservation Details</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.base, paddingBottom: 120 }}>
        <View style={styles.cafeInfo}>
          <Text style={styles.cafeName}>{params.cafeName}</Text>
          {params.tableId && <Text style={styles.tableInfo}>🪑 Table selected</Text>}
        </View>

        <Divider style={{ marginBottom: Spacing.base }} />

        <Text style={styles.sectionLabel}>Date</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.textMuted}
        />

        <Text style={styles.sectionLabel}>Time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {TIME_SLOTS.map(slot => (
            <TouchableOpacity
              key={slot}
              onPress={() => setTime(slot)}
              style={[styles.timeSlot, time === slot && styles.timeSlotActive]}
            >
              <Text style={[styles.timeSlotText, time === slot && styles.timeSlotTextActive]}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>Party Size</Text>
        <View style={styles.partySizeRow}>
          {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => setPartySize(n)}
              style={[styles.sizeBtn, partySize === n && styles.sizeBtnActive]}
            >
              <Text style={[styles.sizeBtnText, partySize === n && styles.sizeBtnTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Special Requests (optional)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={specialRequests}
          onChangeText={setSpecialRequests}
          placeholder="e.g. Window seat, birthday decoration, allergies…"
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={3}
        />

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>📍 Venue</Text><Text style={styles.summaryVal}>{params.cafeName}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>📅 Date</Text><Text style={styles.summaryVal}>{date}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>⏰ Time</Text><Text style={styles.summaryVal}>{time}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>👥 Party</Text><Text style={styles.summaryVal}>{partySize} people</Text></View>
          {params.tableId && <View style={styles.summaryRow}><Text style={styles.summaryLabel}>🪑 Table</Text><Text style={styles.summaryVal}>Selected</Text></View>}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <Button title="Confirm Reservation" onPress={handleConfirm} loading={loading} fullWidth size="lg" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  title: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  cafeInfo: { marginBottom: Spacing.base },
  cafeName: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  tableInfo: { fontSize: Typography.sm, color: Colors.accent, marginTop: 4 },
  sectionLabel: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginTop: Spacing.base, marginBottom: Spacing.sm },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: Typography.base, color: Colors.textPrimary, backgroundColor: Colors.surface,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  timeSlot: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  timeSlotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeSlotText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  timeSlotTextActive: { color: Colors.white },
  partySizeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  sizeBtn: {
    width: 44, height: 44, borderRadius: Radius.full, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  sizeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sizeBtnText: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary },
  sizeBtnTextActive: { color: Colors.white },
  summary: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, marginTop: Spacing.lg,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  summaryTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  summaryLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  summaryVal: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.medium },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, padding: Spacing.base,
    borderTopWidth: 1, borderTopColor: Colors.divider,
  },
});
