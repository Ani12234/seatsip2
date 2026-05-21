// screens/MapScreen.js
// 3D city map using MapLibre GL (free, works with MapTiler)
// npm install @maplibre/maplibre-react-native

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Platform, Dimensions
} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CitySelector from '../components/CitySelector';
import RestaurantCard from '../components/RestaurantCard';
import CategoryFilter from '../components/CategoryFilter';
import { API } from '../utils/api';

const { width, height } = Dimensions.get('window');

// ── MapTiler Style ─────────────────────────────
// Get free key at maptiler.com/cloud  (100k loads/month free)
const MAPTILER_KEY = process.env.MAPTILER_KEY || '5qJr4cBxnkaZ1S4BU1Ua';
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

// ── 3D Building Layer ──────────────────────────
const BUILDINGS_3D_LAYER = {
  id: 'buildings-3d',
  type: 'fill-extrusion',
  source: 'openmaptiles',
  'source-layer': 'building',
  filter: ['==', 'extrude', 'true'],
  minzoom: 14,
  paint: {
    'fill-extrusion-color': [
      'interpolate', ['linear'], ['zoom'],
      14, '#C8A882',
      16, '#E8C99A',
    ],
    'fill-extrusion-height': [
      'interpolate', ['linear'], ['zoom'],
      14, 0,
      14.5, ['get', 'render_height']
    ],
    'fill-extrusion-base': ['get', 'render_min_height'],
    'fill-extrusion-opacity': 0.85,
  },
};

// Pin colors per category
const PIN_COLORS = {
  cafe:           '#FF6B35',
  restaurant:     '#E63946',
  cloud_kitchen:  '#7B2FBE',
};

export default function MapScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const cameraRef = useRef(null);

  const [selectedCity, setSelectedCity] = useState({
    name: 'Bengaluru', lat: 12.9716, lng: 77.5946, zoom_level: 13
  });
  const [cities, setCities] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [category, setCategory] = useState('all');
  const [showCityPicker, setShowCityPicker] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  // ── Fetch cities ─────────────────────────────
  useEffect(() => {
    API.get('/cities').then(setCities).catch(console.error);
  }, []);

  // ── Fetch restaurants for city ───────────────
  useEffect(() => {
    const params = new URLSearchParams({ lat: selectedCity.lat, lng: selectedCity.lng, radius: 8000 });
    if (category !== 'all') params.append('category', category);
    API.get(`/restaurants?${params}`).then(data => {
      setRestaurants(data);
      setSelectedRestaurant(null);
      animateList();
    }).catch(console.error);
  }, [selectedCity, category]);

  // ── Fly to city when changed ─────────────────
  useEffect(() => {
    cameraRef.current?.flyTo(
      [selectedCity.lng, selectedCity.lat],
      { zoomLevel: selectedCity.zoom_level || 13, pitch: 55, bearing: -20, duration: 1800 }
    );
  }, [selectedCity]);

  const animateList = () => {
    Animated.spring(listAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handlePinPress = useCallback((restaurant) => {
    setSelectedRestaurant(restaurant);
    cameraRef.current?.flyTo(
      [parseFloat(restaurant.lng), parseFloat(restaurant.lat)],
      { zoomLevel: 16, pitch: 60, bearing: 10, duration: 1000 }
    );
    Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 80 }).start();
  }, []);

  const closeCard = () => {
    Animated.timing(cardAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(
      () => setSelectedRestaurant(null)
    );
  };

  // ── GeoJSON for pins ─────────────────────────
  const geoJSON = {
    type: 'FeatureCollection',
    features: restaurants.map(r => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [parseFloat(r.lng), parseFloat(r.lat)] },
      properties: {
        id: r.id, name: r.name, cuisine: r.cuisine_type,
        category: r.category, rating: r.rating,
        color: PIN_COLORS[r.category] || '#E63946',
        distance: r.distance_km
      }
    }))
  };

  return (
    <View style={styles.container}>
      {/* ── 3D Map ────────────────────────────── */}
      <MapLibreGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          centerCoordinate={[selectedCity.lng, selectedCity.lat]}
          zoomLevel={selectedCity.zoom_level || 13}
          pitch={55}
          bearing={-20}
          animationMode="flyTo"
          animationDuration={1200}
        />

        {/* 3D buildings */}
        <MapLibreGL.FillExtrusionLayer {...BUILDINGS_3D_LAYER} />

        {/* Restaurant / Cafe Pins */}
        <MapLibreGL.ShapeSource
          id="restaurants"
          shape={geoJSON}
          onPress={(e) => {
            const feat = e.features?.[0];
            if (feat) {
              const r = restaurants.find(x => x.id === feat.properties.id);
              if (r) handlePinPress(r);
            }
          }}
          cluster
          clusterMaxZoomLevel={14}
          clusterRadius={40}
        >
          {/* Cluster circles */}
          <MapLibreGL.CircleLayer
            id="clusters"
            filter={['has', 'point_count']}
            style={{
              circleColor: '#E63946',
              circleRadius: ['step', ['get', 'point_count'], 18, 10, 24, 30, 30],
              circleOpacity: 0.85,
              circleStrokeWidth: 2,
              circleStrokeColor: '#fff',
            }}
          />
          <MapLibreGL.SymbolLayer
            id="cluster-count"
            filter={['has', 'point_count']}
            style={{
              textField: '{point_count_abbreviated}',
              textSize: 13,
              textColor: '#ffffff',
              textFont: ['DIN Pro Medium'],
            }}
          />

          {/* Individual pins */}
          <MapLibreGL.CircleLayer
            id="restaurant-pins"
            filter={['!', ['has', 'point_count']]}
            style={{
              circleColor: ['get', 'color'],
              circleRadius: 10,
              circleStrokeWidth: 2.5,
              circleStrokeColor: '#ffffff',
              circleOpacity: 0.95,
            }}
          />
          <MapLibreGL.SymbolLayer
            id="restaurant-labels"
            filter={['!', ['has', 'point_count']]}
            style={{
              textField: ['get', 'name'],
              textSize: 11,
              textColor: '#1a1a2e',
              textHaloColor: '#ffffff',
              textHaloWidth: 1.5,
              textOffset: [0, 1.4],
              textAnchor: 'top',
              textFont: ['DIN Pro Medium'],
              textOptional: true,
            }}
          />
        </MapLibreGL.ShapeSource>
      </MapLibreGL.MapView>

      {/* ── Top Bar ───────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.cityBtn} onPress={() => setShowCityPicker(true)}>
          <Text style={styles.cityIcon}>📍</Text>
          <Text style={styles.cityName}>{selectedCity.name}</Text>
          <Text style={styles.chevron}>▾</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* ── Category Filter ───────────────────── */}
      <CategoryFilter value={category} onChange={setCategory} />

      {/* ── Restaurant List Strip ─────────────── */}
      {!selectedRestaurant && (
        <Animated.View style={[styles.listStrip, {
          transform: [{ translateY: listAnim.interpolate({ inputRange: [0,1], outputRange: [120, 0] }) }]
        }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {restaurants.map(r => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                onPress={() => handlePinPress(r)}
                compact
              />
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* ── Selected Restaurant Card ──────────── */}
      {selectedRestaurant && (
        <Animated.View style={[styles.detailCard, {
          transform: [{ translateY: cardAnim.interpolate({ inputRange: [0,1], outputRange: [300, 0] }) }]
        }]}>
          <RestaurantCard
            restaurant={selectedRestaurant}
            onClose={closeCard}
            onOrder={() => navigation.navigate('Restaurant', { id: selectedRestaurant.id })}
          />
        </Animated.View>
      )}

      {/* ── City Selector Modal ───────────────── */}
      <CitySelector
        visible={showCityPicker}
        cities={cities}
        currentCity={selectedCity}
        onSelect={(city) => { setSelectedCity(city); setShowCityPicker(false); }}
        onClose={() => setShowCityPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  map:       { flex: 1 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 8,
    backgroundColor: 'rgba(13,27,42,0.85)',
    backdropFilter: 'blur(12px)',
  },
  cityBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 10,
  },
  cityIcon:  { fontSize: 16, marginRight: 6 },
  cityName:  { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 },
  chevron:   { color: '#aaa', fontSize: 12 },
  searchBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#E63946', alignItems: 'center', justifyContent: 'center',
  },
  searchIcon: { fontSize: 18 },

  listStrip: {
    position: 'absolute', bottom: 24, left: 0, right: 0,
  },
  listContent: { paddingHorizontal: 16, gap: 12 },

  detailCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden',
  },
});
