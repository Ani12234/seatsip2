// components/RestaurantCard.js
// Restaurant card component for map and list

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const PRICE_SYMBOLS = { 1: '₹', 2: '₹₹', 3: '₹₹₹', 4: '₹₹₹₹' };
const CATEGORY_LABELS = {
  cafe: '☕ Cafe',
  restaurant: '🍽️ Restaurant',
  cloud_kitchen: '🏠 Cloud Kitchen',
};

export default function RestaurantCard({
  restaurant,
  onPress,
  onClose,
  onOrder,
  compact = false,
}) {
  const {
    name,
    description,
    cuisine_type,
    category,
    address,
    rating,
    total_ratings,
    price_range,
    is_open,
    image_url,
    thumbnail_url,
    tags = [],
    distance_km,
  } = restaurant;

  // Compact card (for horizontal list)
  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress}>
        <View style={styles.compactImagePlaceholder}>
          <Text style={styles.placeholderText}>🍽️</Text>
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>{name}</Text>
          <Text style={styles.compactCuisine} numberOfLines={1}>
            {cuisine_type || category}
          </Text>
          <View style={styles.compactMeta}>
            <Text style={styles.rating}>⭐ {rating || '4.0'}</Text>
            {distance_km && (
              <Text style={styles.distance}>{parseFloat(distance_km).toFixed(1)} km</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Full card (for detail view)
  return (
    <View style={styles.card}>
      {/* Close button */}
      {onClose && (
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      )}

      {/* Image */}
      <View style={styles.imageContainer}>
        {image_url ? (
          <Image source={{ uri: image_url }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderLarge}>🍽️</Text>
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {CATEGORY_LABELS[category] || category}
          </Text>
        </View>
        <View style={[styles.statusBadge, is_open ? styles.openBadge : styles.closedBadge]}>
          <Text style={styles.statusText}>{is_open ? 'Open' : 'Closed'}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        
        <View style={styles.metaRow}>
          <Text style={styles.ratingLarge}>⭐ {rating || '4.0'}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.reviews}>{total_ratings || 0} reviews</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.price}>{PRICE_SYMBOLS[price_range] || '₹₹'}</Text>
        </View>

        <Text style={styles.cuisine}>{cuisine_type}</Text>
        
        <Text style={styles.address} numberOfLines={2}>{address}</Text>

        {distance_km && (
          <Text style={styles.distanceLarge}>
            📍 {parseFloat(distance_km).toFixed(1)} km away
          </Text>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tags}>
            {tags.slice(0, 3).map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Order Button */}
        {onOrder && (
          <TouchableOpacity style={styles.orderBtn} onPress={onOrder}>
            <Text style={styles.orderBtnText}>Order Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact styles
  compactCard: {
    width: 160,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
  },
  compactImagePlaceholder: {
    height: 80,
    backgroundColor: '#E8C99A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  compactContent: {
    padding: 12,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  compactCuisine: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Full card styles
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8C99A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLarge: {
    fontSize: 64,
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(230,57,70,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  openBadge: {
    backgroundColor: 'rgba(46,196,182,0.9)',
  },
  closedBadge: {
    backgroundColor: 'rgba(108,117,125,0.9)',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  dot: {
    color: '#888',
    marginHorizontal: 8,
  },
  reviews: {
    fontSize: 13,
    color: '#666',
  },
  price: {
    fontSize: 13,
    color: '#666',
  },
  cuisine: {
    fontSize: 14,
    color: '#E63946',
    textTransform: 'capitalize',
    marginBottom: 8,
    fontWeight: '500',
  },
  address: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  distance: {
    fontSize: 12,
    color: '#888',
  },
  distanceLarge: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(230,57,70,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagText: {
    color: '#E63946',
    fontSize: 12,
    fontWeight: '500',
  },
  orderBtn: {
    backgroundColor: '#E63946',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  orderBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
