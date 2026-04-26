import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      {/* SIMULATED MAP BACKGROUND */}
      <View style={styles.mapBackground}>
        {/* Horizontal Lines */}
        {[...Array(12)].map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLineH, { top: `${i * 10}%` }]} />
        ))}
        {/* Vertical Lines */}
        {[...Array(8)].map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLineV, { left: `${i * 15}%` }]} />
        ))}
        
        {/* DIAGNOL / CUSTOM LINES FOR REALISM */}
        <View style={[styles.gridLineH, { top: '40%', transform: [{ rotate: '15deg' }] }]} />
        <View style={[styles.gridLineV, { left: '60%', transform: [{ rotate: '-10deg' }] }]} />
      </View>

      {/* MARKERS */}
      <View style={[styles.markerBase, { top: '20%', left: '35%' }]}>
        <View style={styles.markerInactive}>
          <Text style={styles.markerIconSmall}>☕</Text>
        </View>
        <View style={styles.markerPinLineInactive} />
      </View>

      <View style={[styles.markerBase, { top: '35%', left: '45%', zIndex: 10 }]}>
        <View style={styles.markerActiveBrown}>
          <Text style={styles.markerIcon}>☕</Text>
          <Text style={styles.markerText}>SUNSET CAFE</Text>
        </View>
        <View style={styles.markerPinLine} />
      </View>

      <View style={[styles.markerBase, { top: '56%', left: '20%', zIndex: 5 }]}>
        <View style={styles.markerActiveGreen}>
          <Text style={styles.markerIcon}>🍽️</Text>
          <Text style={styles.markerText}>GREEN VALLEY</Text>
        </View>
        <View style={styles.markerPinLine} />
      </View>

      {/* FLOATING ACTION BUTTONS (Right Side) */}
      <View style={styles.fabContainer}>
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomBtn}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity style={styles.zoomBtn}>
            <Text style={styles.zoomText}>−</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.locationFab}>
          <Text style={styles.locationIcon}>⌖</Text>
        </TouchableOpacity>
      </View>

      {/* TOP OVERLAYS (Search & Chips) */}
      <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchIconBox}>
            <Text style={styles.searchIconTxt}>🔍</Text>
          </TouchableOpacity>
          <Text style={styles.searchPlaceholder}>Search curated spots...</Text>
          <TouchableOpacity style={styles.filterIconBox}>
            <Text style={styles.filterIconTxt}>⎚</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipContainer}
        >
          <TouchableOpacity style={styles.chipActive}>
            <Text style={styles.chipTextActive}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chipInactive}>
            <Text style={styles.chipTextInactive}>Cafes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chipInactive}>
            <Text style={styles.chipTextInactive}>Restaurants</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chipInactive}>
            <Text style={styles.chipTextInactive}>Bakeries</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* BOTTOM CARD */}
      <View style={[styles.bottomCardContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.bottomCard}>
          <View style={styles.cardImageContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800' }} 
              style={styles.cardImage}
            />
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>OPEN NOW</Text>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Sunset Cafe & Roastery</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingStar}>★</Text>
                <Text style={styles.ratingText}>4.8</Text>
              </View>
            </View>
            
            <Text style={styles.cardSubtitle}>SPECIALTY BREW • ARTISAN BAKERY</Text>
            
            <Text style={styles.cardDescription}>
              Minimalist space known for their slow-pour experience and architecture books.
            </Text>
            
            <View style={styles.cardFooter}>
              <View style={styles.amenitiesRow}>
                <View style={styles.amenityBox}><Text style={styles.amenityIcon}>📶</Text></View>
                <View style={styles.amenityBox}><Text style={styles.amenityIcon}>♨️</Text></View>
                <View style={styles.amenityBox}><Text style={styles.amenityIcon}>🔋</Text></View>
              </View>
              
              <TouchableOpacity style={styles.directionsBtn}>
                <Text style={styles.directionsBtnText}>GET DIRECTIONS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0D8CC' }, // Fallback bg
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D9D0C1', // Map base color
    overflow: 'hidden',
  },
  gridLineH: { position: 'absolute', left: '-50%', right: '-50%', height: 1.5, backgroundColor: 'rgba(255,255,255,0.45)' },
  gridLineV: { position: 'absolute', top: '-50%', bottom: '-50%', width: 1.5, backgroundColor: 'rgba(255,255,255,0.45)' },
  
  // Markers
  markerBase: { position: 'absolute', alignItems: 'center' },
  markerInactive: { backgroundColor: 'rgba(150, 140, 130, 0.8)', padding: 6, borderRadius: 6 },
  markerIconSmall: { fontSize: 14, color: '#fff' },
  markerPinLineInactive: { width: 2, height: 12, backgroundColor: 'rgba(150, 140, 130, 0.8)' },
  
  markerActiveBrown: { backgroundColor: '#4A3B22', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  markerActiveGreen: { backgroundColor: '#586A45', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  markerIcon: { fontSize: 12, color: '#fff', marginRight: 6 },
  markerText: { color: '#EBE5D9', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  markerPinLine: { width: 2, height: 16, backgroundColor: '#4A3B22' },

  // Floating Action Buttons
  fabContainer: { position: 'absolute', right: 20, bottom: 340, alignItems: 'center', gap: 12, zIndex: 20 },
  zoomControls: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 }, android: { elevation: 4 }, web: { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }) },
  zoomBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  zoomText: { fontSize: 24, fontWeight: '300', color: '#1A1A1A' },
  zoomDivider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 8 },
  locationFab: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#4A3B22', alignItems: 'center', justifyContent: 'center', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 }, android: { elevation: 4 }, web: { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }) },
  locationIcon: { fontSize: 24, color: '#fff', fontWeight: '200' },

  // Top Overlay
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: Platform.OS === 'android' ? 40 : 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 12, paddingRight: 16, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }, android: { elevation: 6 }, web: { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } }) },
  searchIconBox: { backgroundColor: '#4A3B22', borderTopLeftRadius: 12, borderBottomLeftRadius: 12, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  searchIconTxt: { fontSize: 18, color: '#fff' },
  searchPlaceholder: { flex: 1, fontSize: 16, color: '#A0A0A0', marginLeft: 16 },
  filterIconBox: { padding: 4 },
  filterIconTxt: { fontSize: 20, color: '#707070' },
  
  chipScroll: { marginTop: 16 },
  chipContainer: { paddingHorizontal: 20, gap: 12, paddingBottom: 10 },
  chipActive: { backgroundColor: '#3E2D11', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  chipInactive: { backgroundColor: '#F2E8D8', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  chipTextActive: { color: '#fff', fontSize: 14, fontWeight: '600' },
  chipTextInactive: { color: '#4A3B22', fontSize: 14, fontWeight: '500' },

  // Bottom Card
  bottomCardContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, zIndex: 10 },
  bottomCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 }, android: { elevation: 8 }, web: { boxShadow: '0 10px 40px rgba(0,0,0,0.15)' } }) },
  cardImageContainer: { position: 'relative', height: 180 },
  cardImage: { width: '100%', height: '100%' },
  openBadge: { position: 'absolute', top: 16, left: 16, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  openBadgeText: { fontSize: 11, fontWeight: '700', color: '#1A1A1A', letterSpacing: 0.5 },
  cardContent: { padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 20, fontWeight: '600', color: '#4A3B22', flex: 1, marginRight: 10 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2F1D1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  ratingStar: { fontSize: 12, color: '#1A1A1A', marginRight: 4 },
  ratingText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  cardSubtitle: { fontSize: 11, color: '#9E9E9E', marginTop: 6, letterSpacing: 0.5 },
  cardDescription: { fontSize: 14, color: '#5C5C5C', marginTop: 14, lineHeight: 22 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  amenitiesRow: { flexDirection: 'row', gap: 8 },
  amenityBox: { width: 34, height: 34, borderWidth: 1, borderColor: '#F0EBE1', borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDFCF9' },
  amenityIcon: { fontSize: 16 },
  directionsBtn: { backgroundColor: '#4A3B22', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 6 },
  directionsBtnText: { color: '#EBE5D9', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
});

