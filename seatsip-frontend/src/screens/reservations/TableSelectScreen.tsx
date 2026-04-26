import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cafesApi } from '../../services/api';
import { Table } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import { Button } from '../../components/ui';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'TableSelect'>;

export default function TableSelectScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();

  const [tables, setTables] = useState<Table[]>([]);
  const [floors, setFloors] = useState<string[]>([]);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [loading, setLoading] = useState(false);

  const loadTables = async () => {
    setLoading(true);
    try {
      const { data } = await cafesApi.getTables(params.cafeId, { date, time, party_size: partySize });
      setTables(data.data.tables);
      const fl: string[] = data.data.floors;
      setFloors(fl);
      if (fl.length > 0 && !selectedFloor) setSelectedFloor(fl[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTables(); }, [date, time, partySize]);

  const filteredTables = tables.filter(t => t.floor === selectedFloor);
  const TIME_SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '20:00', '21:00'];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Select Table</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.base, paddingBottom: 120 }}>
        {/* Party size */}
        <Text style={styles.sectionLabel}>Party Size</Text>
        <View style={styles.partySizeRow}>
          {[1, 2, 3, 4, 5, 6, 8].map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => { setPartySize(n); setSelectedTable(null); }}
              style={[styles.sizeBtn, partySize === n && styles.sizeBtnActive]}
            >
              <Text style={[styles.sizeBtnText, partySize === n && styles.sizeBtnTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Time slot */}
        <Text style={styles.sectionLabel}>Time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {TIME_SLOTS.map(slot => (
            <TouchableOpacity
              key={slot}
              onPress={() => { setTime(slot); setSelectedTable(null); }}
              style={[styles.timeSlot, time === slot && styles.timeSlotActive]}
            >
              <Text style={[styles.timeSlotText, time === slot && styles.timeSlotTextActive]}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Floor tabs */}
        {floors.length > 1 && (
          <>
            <Text style={styles.sectionLabel}>Floor</Text>
            <View style={styles.floorRow}>
              {floors.map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setSelectedFloor(f)}
                  style={[styles.floorTab, selectedFloor === f && styles.floorTabActive]}
                >
                  <Text style={[styles.floorTabText, selectedFloor === f && styles.floorTabTextActive]}>{f} Floor</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Floor plan */}
        <Text style={styles.sectionLabel}>Select a Table</Text>
        {loading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.floorPlan}>
            {filteredTables.map(table => {
              const isSelected = selectedTable?.id === table.id;
              const isUnavailable = !table.is_available;
              return (
                <TouchableOpacity
                  key={table.id}
                  disabled={isUnavailable}
                  onPress={() => setSelectedTable(isSelected ? null : table)}
                  style={[
                    styles.tableBtn,
                    isUnavailable && styles.tableBtnUnavailable,
                    isSelected && styles.tableBtnSelected,
                  ]}
                >
                  <Text style={[styles.tableNum, isSelected && { color: Colors.white }]}>{table.table_number}</Text>
                  <Text style={[styles.tableCap, isSelected && { color: Colors.cream }]}>👤 {table.capacity}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.surface }]} /><Text style={styles.legendText}>Available</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.accent }]} /><Text style={styles.legendText}>Selected</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.creamDark }]} /><Text style={styles.legendText}>Booked</Text></View>
        </View>

        {selectedTable && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedLabel}>Selected: Table {selectedTable.table_number}</Text>
            <Text style={styles.selectedMeta}>Seats up to {selectedTable.capacity} people</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
        <Button
          title={selectedTable ? `Reserve Table ${selectedTable.table_number} →` : 'Skip Table Selection →'}
          onPress={() => navigation.navigate('ReservationDetails', {
            cafeId: params.cafeId,
            cafeName: params.cafeName,
            tableId: selectedTable?.id,
          })}
          fullWidth
          size="lg"
        />
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
  sectionLabel: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginTop: Spacing.base, marginBottom: Spacing.sm },
  partySizeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  sizeBtn: {
    width: 44, height: 44, borderRadius: Radius.full, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  sizeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sizeBtnText: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary },
  sizeBtnTextActive: { color: Colors.white },
  timeSlot: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  timeSlotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeSlotText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  timeSlotTextActive: { color: Colors.white },
  floorRow: { flexDirection: 'row', gap: 8 },
  floorTab: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: 'center',
  },
  floorTabActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  floorTabText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  floorTabTextActive: { color: Colors.white },
  floorPlan: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tableBtn: {
    width: 80, height: 80, borderRadius: Radius.md,
    backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  tableBtnUnavailable: { backgroundColor: Colors.creamDark, borderColor: Colors.creamDark, opacity: 0.5 },
  tableBtnSelected: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  tableNum: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  tableCap: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  legend: { flexDirection: 'row', gap: 16, marginTop: Spacing.base },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 4, borderWidth: 1, borderColor: Colors.border },
  legendText: { fontSize: Typography.xs, color: Colors.textMuted },
  selectedInfo: {
    backgroundColor: Colors.accent + '15', borderRadius: Radius.md, padding: Spacing.md,
    marginTop: Spacing.base, alignItems: 'center',
  },
  selectedLabel: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.accent },
  selectedMeta: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 4 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, padding: Spacing.base,
    borderTopWidth: 1, borderTopColor: Colors.divider,
  },
});
