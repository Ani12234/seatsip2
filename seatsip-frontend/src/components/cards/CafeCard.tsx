import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import { Cafe } from '../../types';
import { StarRating, PriceLevel } from '../ui';
import AppIcon from '../ui/AppIcon';

const { width } = Dimensions.get('window');

interface CafeCardProps {
  cafe: Cafe;
  onPress: () => void;
  horizontal?: boolean;
}

export const CafeCard: React.FC<CafeCardProps> = ({ cafe, onPress, horizontal }) => {
  const moods: string[] = JSON.parse(cafe.moods || '[]');
  const images: string[] = JSON.parse(cafe.images || '[]');
  const imgUri = images[0] || cafe.image_url;

  if (horizontal) {
    return (
      <TouchableOpacity style={styles.h_card} onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: imgUri }} style={styles.h_img} resizeMode="cover" />
        <View style={styles.h_content}>
          <Text style={styles.h_name} numberOfLines={1}>{cafe.name}</Text>
          <StarRating rating={cafe.rating} count={cafe.review_count} size={12} />
          <Text style={styles.h_address} numberOfLines={1}>{cafe.address}</Text>
          <View style={styles.h_row}>
            <PriceLevel level={cafe.price_level} />
            <Text style={styles.h_dot}>·</Text>
            <Text style={styles.h_time}>{cafe.open_time} – {cafe.close_time}</Text>
          </View>
        </View>
        <View style={[styles.status_dot, { backgroundColor: cafe.is_open ? Colors.open : Colors.closed }]} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.img_container}>
        <Image source={{ uri: imgUri }} style={styles.img} resizeMode="cover" />
        <View style={styles.img_overlay} />
        {/* Open/Closed badge */}
        <View style={[styles.open_badge, { backgroundColor: cafe.is_open ? Colors.open : Colors.error }]}>
          <Text style={styles.open_text}>{cafe.is_open ? 'Open' : 'Closed'}</Text>
        </View>
        {/* Mood chips */}
        <View style={styles.mood_row}>
          {moods.slice(0, 2).map(m => (
            <View key={m} style={styles.mood_chip}>
              <Text style={styles.mood_text}>{m}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.name_row}>
          <Text style={styles.name} numberOfLines={1}>{cafe.name}</Text>
          <PriceLevel level={cafe.price_level} />
        </View>
        <StarRating rating={cafe.rating} count={cafe.review_count} />
        <Text style={styles.address} numberOfLines={1}>{cafe.address}</Text>
        <View style={styles.meta_row}>
          <View style={styles.meta_item}><AppIcon name="time" size={12} color={Colors.textSecondary} /><Text style={styles.meta}>{cafe.prep_time_minutes} min</Text></View>
          {cafe.wifi ? <View style={styles.meta_item}><AppIcon name="wifi" size={12} color={Colors.textSecondary} /><Text style={styles.meta}>WiFi</Text></View> : null}
          {cafe.pet_friendly ? <View style={styles.meta_item}><AppIcon name="🐾" size={12} color={Colors.textSecondary} /><Text style={styles.meta}>Pet-friendly</Text></View> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Compact card for suggestions row
export const CafeCardSmall: React.FC<{ cafe: Cafe; onPress: () => void }> = ({ cafe, onPress }) => {
  const images: string[] = JSON.parse(cafe.images || '[]');
  const imgUri = images[0] || cafe.image_url;
  return (
    <TouchableOpacity style={styles.sm_card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: imgUri }} style={styles.sm_img} resizeMode="cover" />
      <View style={styles.sm_content}>
        <Text style={styles.sm_name} numberOfLines={1}>{cafe.name}</Text>
        <StarRating rating={cafe.rating} size={11} />
        <Text style={styles.sm_meta}>{cafe.prep_time_minutes} min</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing.base,
    marginHorizontal: Spacing.base,
    overflow: 'hidden',
    ...Shadow.md,
  },
  img_container: { height: 200, position: 'relative' },
  img: { width: '100%', height: '100%' },
  img_overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  open_badge: {
    position: 'absolute', top: 12, right: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  open_text: { color: Colors.white, fontSize: 11, fontWeight: Typography.semibold },
  mood_row: {
    position: 'absolute', bottom: 12, left: 12,
    flexDirection: 'row', gap: 6,
  },
  mood_chip: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: Radius.full,
  },
  mood_text: { fontSize: 11, color: Colors.textPrimary, fontWeight: Typography.medium, textTransform: 'capitalize' },
  content: { padding: Spacing.base },
  name_row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, flex: 1, marginRight: 8 },
  address: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
  meta_row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  meta_item: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: Typography.xs, color: Colors.textSecondary },

  // Horizontal card
  h_card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  h_img: { width: 90, height: 90 },
  h_content: { flex: 1, padding: Spacing.md, gap: 3 },
  h_name: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  h_address: { fontSize: Typography.xs, color: Colors.textMuted },
  h_row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  h_dot: { color: Colors.textMuted },
  h_time: { fontSize: Typography.xs, color: Colors.textSecondary },
  status_dot: {
    width: 8, height: 8, borderRadius: 4,
    position: 'absolute', top: 10, right: 10,
  },

  // Small card
  sm_card: {
    width: 150,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginRight: Spacing.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  sm_img: { width: '100%', height: 100 },
  sm_content: { padding: Spacing.sm },
  sm_name: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 2 },
  sm_meta: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
});
