import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, Animated, FlatList, StatusBar, Alert, Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cafesApi } from '../../services/api';
import { Cafe, Review } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, Radius, Shadow, MoodColors } from '../../theme';
import { StarRating, PriceLevel, Badge, Skeleton, Divider, Button, Tag } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 260;

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CafeDetail'>;

export default function CafeDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, [params.cafeId]);

  const loadData = async () => {
    try {
      const [cafeRes, revRes] = await Promise.all([
        cafesApi.getById(params.cafeId),
        cafesApi.getReviews(params.cafeId, { limit: 5 }),
      ]);
      setCafe(cafeRes.data.data);
      setReviews(revRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 80, HEADER_HEIGHT - 40],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleReserve = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Please sign in to make a reservation.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    navigation.navigate('TableSelect', { cafeId: params.cafeId, cafeName: cafe?.name || '' });
  };

  const handleOrder = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Please sign in to order.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    navigation.navigate('CafeMenu', { cafeId: params.cafeId, cafeName: cafe?.name || '' });
  };

  if (loading || !cafe) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <Skeleton height={260} radius={0} />
        <View style={{ padding: Spacing.base, gap: 12 }}>
          <Skeleton height={28} width="60%" />
          <Skeleton height={16} width="40%" />
          <Skeleton height={16} width="80%" />
        </View>
      </View>
    );
  }

  const images: string[] = JSON.parse(cafe.images || '[]');
  const moods: string[] = JSON.parse(cafe.moods || '[]');
  const tags: string[] = JSON.parse(cafe.tags || '[]');
  const mainImage = images[0] || cafe.image_url;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Sticky header (appears on scroll) */}
      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top, opacity: headerOpacity }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stickyTitle} numberOfLines={1}>{cafe.name}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Back button always visible */}
      <View style={[styles.floatBack, { top: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.floatBtn}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        {images.length > 1 && (
          <TouchableOpacity
            onPress={() => navigation.navigate('CafeGallery', { cafeId: cafe.id, cafeName: cafe.name, images })}
            style={styles.floatBtn}
          >
            <Text style={{ fontSize: 14 }}>📷 {images.length}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Hero image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: mainImage }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroBottom}>
            <View style={[styles.openBadge, { backgroundColor: cafe.is_open ? Colors.open : Colors.error }]}>
              <Text style={styles.openText}>{cafe.is_open ? '● Open' : '● Closed'}</Text>
            </View>
            <Text style={styles.heroTime}>{cafe.open_time} – {cafe.close_time}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Name & Price */}
          <View style={styles.nameRow}>
            <Text style={styles.name}>{cafe.name}</Text>
            <PriceLevel level={cafe.price_level} />
          </View>

          {/* Rating */}
          <StarRating rating={cafe.rating} count={cafe.review_count} size={15} />

          {/* Address */}
          <TouchableOpacity
            onPress={() => Linking.openURL(`https://maps.google.com/?q=${cafe.latitude},${cafe.longitude}`)}
            style={styles.addressRow}
          >
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.address}>{cafe.address}, {cafe.city}</Text>
            <Text style={styles.mapLink}>Map →</Text>
          </TouchableOpacity>

          {/* Amenities */}
          <View style={styles.amenityRow}>
            {cafe.wifi ? <View style={styles.amenity}><Text>📶</Text><Text style={styles.amenityText}>WiFi</Text></View> : null}
            {cafe.parking ? <View style={styles.amenity}><Text>🅿️</Text><Text style={styles.amenityText}>Parking</Text></View> : null}
            {cafe.pet_friendly ? <View style={styles.amenity}><Text>🐾</Text><Text style={styles.amenityText}>Pets</Text></View> : null}
            <View style={styles.amenity}><Text>⏱</Text><Text style={styles.amenityText}>{cafe.prep_time_minutes} min</Text></View>
          </View>

          <Divider style={{ marginVertical: Spacing.base }} />

          {/* Description */}
          {cafe.description && (
            <>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{cafe.description}</Text>
            </>
          )}

          {/* Moods */}
          {moods.length > 0 && (
            <View style={{ marginTop: Spacing.base }}>
              <Text style={styles.sectionTitle}>Perfect for</Text>
              <View style={styles.moodRow}>
                {moods.map(m => (
                  <View key={m} style={[styles.moodChip, { backgroundColor: (MoodColors[m] || Colors.accent) + '20' }]}>
                    <Text style={[styles.moodText, { color: MoodColors[m] || Colors.accent }]}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tagRow}>
              {tags.map(t => <Tag key={t} label={t} />)}
            </View>
          )}

          <Divider style={{ marginVertical: Spacing.base }} />

          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity onPress={() => navigation.navigate('WriteReview', { cafeId: cafe.id, cafeName: cafe.name })}>
                <Text style={styles.writeReview}>+ Write review</Text>
              </TouchableOpacity>
            </View>
            {reviews.length === 0 ? (
              <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
            ) : (
              reviews.map(r => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{r.user_name?.[0] || '?'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewerName}>{r.user_name}</Text>
                      <StarRating rating={r.rating} size={12} />
                    </View>
                    <Text style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</Text>
                  </View>
                  {r.comment && <Text style={styles.reviewText}>{r.comment}</Text>}
                </View>
              ))
            )}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + 8 }]}>
        <Button
          title="Reserve Table"
          onPress={handleReserve}
          variant="outline"
          style={{ flex: 1 }}
          icon={<Text>🪑</Text>}
        />
        <Button
          title="Order Now"
          onPress={handleOrder}
          style={{ flex: 1 }}
          icon={<Text style={{ color: Colors.white }}>☕</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: Colors.surface, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingBottom: 12, ...Shadow.md,
  },
  backBtn: { padding: 8 },
  backIcon: { fontSize: 20, color: Colors.textPrimary },
  stickyTitle: { flex: 1, textAlign: 'center', fontWeight: Typography.bold, fontSize: Typography.base, color: Colors.textPrimary },
  floatBack: {
    position: 'absolute', left: Spacing.base, right: Spacing.base,
    zIndex: 50, flexDirection: 'row', justifyContent: 'space-between',
  },
  floatBtn: {
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 8, ...Shadow.sm,
  },
  heroContainer: { height: HEADER_HEIGHT, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  heroBottom: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  openBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full },
  openText: { color: Colors.white, fontSize: Typography.sm, fontWeight: Typography.semibold },
  heroTime: { color: Colors.white, fontSize: Typography.sm, fontWeight: Typography.medium },
  content: { padding: Spacing.base },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: Colors.textPrimary, flex: 1 },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: 4 },
  addressIcon: { fontSize: 14 },
  address: { fontSize: Typography.sm, color: Colors.textSecondary, flex: 1 },
  mapLink: { fontSize: Typography.sm, color: Colors.accent, fontWeight: Typography.semibold },
  amenityRow: { flexDirection: 'row', gap: 16, marginTop: Spacing.md },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amenityText: { fontSize: Typography.sm, color: Colors.textSecondary },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  description: { fontSize: Typography.base, color: Colors.textSecondary, lineHeight: 22 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full },
  moodText: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: Spacing.md },
  reviewsSection: {},
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  writeReview: { fontSize: Typography.sm, color: Colors.accent, fontWeight: Typography.semibold },
  noReviews: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 8 },
  reviewCard: { backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: Typography.bold, fontSize: Typography.base },
  reviewerName: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  reviewDate: { fontSize: Typography.xs, color: Colors.textMuted },
  reviewText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
  actions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12, padding: Spacing.base,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.divider,
  },
});
