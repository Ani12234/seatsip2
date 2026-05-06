// components/CategoryFilter.js
// Horizontal category filter chips

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🍽️' },
  { id: 'cafe', label: 'Cafes', icon: '☕' },
  { id: 'restaurant', label: 'Restaurants', icon: '🍛' },
  { id: 'cloud_kitchen', label: 'Cloud Kitchen', icon: '🏠' },
];

export default function CategoryFilter({ value, onChange }) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isActive = value === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                isActive && styles.chipActive
              ]}
              onPress={() => onChange(cat.id)}
            >
              <Text style={styles.chipIcon}>{cat.icon}</Text>
              <Text style={[
                styles.chipLabel,
                isActive && styles.chipLabelActive
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: '#E63946',
    borderColor: '#E63946',
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  chipLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  chipLabelActive: {
    fontWeight: '700',
  },
});
