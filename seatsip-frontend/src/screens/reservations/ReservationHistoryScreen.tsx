import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AppIcon from '../../components/ui/AppIcon';

const { width } = Dimensions.get('window');

// ─── Data ────────────────────────────────────────────────────────────────────
const FILTERS = [
  { id: 'all',       label: 'All',       icon: '📅' },
  { id: 'upcoming',  label: 'Upcoming',  icon: '📆' },
  { id: 'pending',   label: 'Pending',   icon: '⏱' },
  { id: 'completed', label: 'Completed', icon: '✅' },
];

const RESERVATIONS = [
  {
    id: '1',
    name: 'The Leela Palace',
    type: 'Dining',
    guests: 4,
    date: '28 Apr 2026',
    time: '7:30 PM',
    status: 'confirmed',
    category: 'upcoming',
    typeIcon: '🍴',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=80',
  },
  {
    id: '2',
    name: 'Taj Lands End',
    type: 'Dining',
    guests: 2,
    date: '02 May 2026',
    time: '8:00 PM',
    status: 'pending',
    category: 'pending',
    typeIcon: '🍴',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80',
  },
  {
    id: '3',
    name: 'Blue Frog',
    type: 'Event',
    guests: 6,
    date: '15 Apr 2026',
    time: '9:00 PM',
    status: 'completed',
    category: 'completed',
    typeIcon: '🎵',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300&q=80',
  },
];

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, any> = {
  confirmed: {
    label: 'Confirmed',
    icon: '✓',
    bg: '#E8F5E9',
    text: '#2E7D32',
    border: '#C8E6C9',
  },
  pending: {
    label: 'Pending',
    icon: '⏱',
    bg: '#FFF8E1',
    text: '#E65100',
    border: '#FFECB3',
  },
  completed: {
    label: 'Completed',
    icon: '✓',
    bg: '#E3F2FD',
    text: '#1565C0',
    border: '#BBDEFB',
  },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <AppIcon name={cfg.icon} size={12} color={cfg.text} />
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
};

// ─── Reservation Card ─────────────────────────────────────────────────────────
const ReservationCard = ({ item, onModify, onCancel }: { item: any; onModify: (item: any) => void; onCancel: (item: any) => void }) => {
  const isCompleted = item.status === 'completed';

  return (
    <View style={styles.card}>
      {/* Top section: image + info */}
      <View style={styles.cardTop}>
        {/* Image with category icon overlay */}
        <View style={styles.imgWrapper}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          <View style={styles.typeIconBubble}>
            <AppIcon name={item.typeIcon} size={16} color="#8B5E3C" />
          </View>
        </View>

        {/* Name, type, guests, badge */}
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          </View>
          <Text style={styles.cardMeta}>{item.type} • {item.guests} Guests</Text>
          <View style={styles.badgeRow}>
            <StatusBadge status={item.status} />
          </View>
        </View>
      </View>

      {/* Dashed divider */}
      <View style={styles.dashedDivider} />

      {/* Date & Time row */}
      <View style={styles.dateTimeRow}>
        <View style={styles.dateTimeCell}>
          <View style={styles.dateTimeIconBox}>
            <AppIcon name="calendar" size={16} color="#8B5E3C" />
          </View>
          <View>
            <Text style={styles.dateTimeLabel}>Date</Text>
            <Text style={styles.dateTimeValue}>{item.date}</Text>
          </View>
        </View>

        <View style={styles.dateTimeDivider} />

        <View style={styles.dateTimeCell}>
          <View style={styles.dateTimeIconBox}>
            <AppIcon name="time" size={16} color="#8B5E3C" />
          </View>
          <View>
            <Text style={styles.dateTimeLabel}>Time</Text>
            <Text style={styles.dateTimeValue}>{item.time}</Text>
          </View>
        </View>
      </View>

      {/* Action buttons — only for non-completed */}
      {!isCompleted && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.modifyBtn}
            onPress={() => onModify(item)}
            activeOpacity={0.8}
          >
            <AppIcon name="✏️" size={14} color="#8B5E3C" />
            <Text style={styles.modifyText}>Modify</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => onCancel(item)}
            activeOpacity={0.8}
          >
            <AppIcon name="trash" size={14} color="#C62828" />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ─── Filter Chip ──────────────────────────────────────────────────────────────
const FilterChip = ({ item, active, onPress }: { item: any; active: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.filterChip, active && styles.filterChipActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <AppIcon name={item.icon} size={14} color={active ? '#fff' : '#4A3520'} />
    <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{item.label}</Text>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ReservationHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered =
    activeFilter === 'all'
      ? RESERVATIONS
      : RESERVATIONS.filter((r) => r.category === activeFilter);

  const handleModify = (item: any) => {
    Alert.alert('Modify', `Modifying reservation for ${item.name}`);
  };

  const handleCancel = (item: any) => {
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel your booking at ${item.name}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EEE8" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <AppIcon name="back" size={20} color="#1A0F05" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Reservations</Text>
          <Text style={styles.headerSub}>Manage your bookings all in one place</Text>
        </View>
      </View>

      {/* ── Filters ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <FilterChip
            key={f.id}
            item={f}
            active={activeFilter === f.id}
            onPress={() => setActiveFilter(f.id)}
          />
        ))}
      </ScrollView>

      {/* ── List ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filtered.map((item) => (
          <ReservationCard
            key={item.id}
            item={item}
            onModify={handleModify}
            onCancel={handleCancel}
          />
        ))}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <AppIcon name="📭" size={36} color="#8C7060" />
            <Text style={styles.emptyText}>No reservations found</Text>
          </View>
        )}

        {/* ── Help banner ── */}
        <TouchableOpacity style={styles.helpBanner} activeOpacity={0.85}>
          <View style={styles.helpIconBox}>
            <AppIcon name="notification" size={20} color="#fff" />
          </View>
          <View style={styles.helpText}>
            <Text style={styles.helpTitle}>Need help with your booking?</Text>
            <Text style={styles.helpSub}>Contact restaurant directly for assistance.</Text>
          </View>
          <AppIcon name="›" size={20} color="#8B5E3C" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5EEE8',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 14,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EDE6DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  backArrow: {
    fontSize: 20,
    color: '#1A0F05',
    fontWeight: '600',
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A0F05',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: '#8C7060',
    marginTop: 3,
  },

  // Filters
  filterScroll: { maxHeight: 56 },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#D4C4B0',
    backgroundColor: '#FAF5EE',
  },
  filterChipActive: {
    backgroundColor: '#2C1A0E',
    borderColor: '#2C1A0E',
  },
  filterIcon: { fontSize: 14 },
  filterIconActive: { fontSize: 14 },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A3520',
  },
  filterLabelActive: {
    color: '#fff',
  },

  // List
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 32,
    gap: 14,
  },

  // Card
  card: {
    backgroundColor: '#FDFAF6',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3A2010',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  // Image
  imgWrapper: {
    position: 'relative',
    width: 110,
    height: 100,
  },
  cardImage: {
    width: 110,
    height: 100,
    borderRadius: 14,
  },
  typeIconBubble: {
    position: 'absolute',
    bottom: -8,
    left: -6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5EE',
    borderWidth: 2,
    borderColor: '#EDE6DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconText: { fontSize: 14 },

  // Card info
  cardInfo: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A0F05',
    flex: 1,
    letterSpacing: -0.2,
  },
  cardMeta: {
    fontSize: 13,
    color: '#8C7060',
    marginBottom: 10,
  },
  badgeRow: {
    alignItems: 'flex-start',
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeIcon: { fontSize: 11, fontWeight: '700' },
  badgeText: { fontSize: 12, fontWeight: '600' },

  // Dashed divider
  dashedDivider: {
    borderWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '#E0D8CE',
    borderStyle: 'dashed',
    marginBottom: 12,
  },

  // Date / Time
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#F8F3EE',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dateTimeCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateTimeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EDE6DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTimeIcon: { fontSize: 16 },
  dateTimeLabel: {
    fontSize: 11,
    color: '#9C8878',
    fontWeight: '500',
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A0F05',
  },
  dateTimeDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#DDD5C8',
    marginHorizontal: 10,
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modifyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D4C4B0',
    backgroundColor: '#FDFAF6',
  },
  modifyIcon: { fontSize: 14 },
  modifyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A2A1A',
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#FFF0F0',
    borderWidth: 1.5,
    borderColor: '#FCCACA',
  },
  cancelIcon: { fontSize: 14 },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C0392B',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 16, color: '#8C7060', fontWeight: '500' },

  // Help banner
  helpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFAF6',
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#EDE6DC',
    marginTop: 4,
  },
  helpIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2EAE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIcon: { fontSize: 20 },
  helpText: { flex: 1 },
  helpTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A0F05',
    marginBottom: 3,
  },
  helpSub: {
    fontSize: 12,
    color: '#8C7060',
  },
  helpArrow: {
    fontSize: 22,
    color: '#8C7060',
    fontWeight: '300',
  },
});
