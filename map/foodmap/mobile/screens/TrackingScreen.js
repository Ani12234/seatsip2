// screens/TrackingScreen.js
// Real-time delivery map: restaurant → agent → your door

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { io } from 'socket.io-client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE } from '../utils/api';

const MAPTILER_KEY = process.env.MAPTILER_KEY || '5qJr4cBxnkaZ1S4BU1Ua';
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

const STATUS_STEPS = ['confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered'];
const STATUS_LABELS = {
  confirmed:   'Order Confirmed',
  preparing:   'Preparing your food',
  ready:       'Ready for pickup',
  picked_up:   'Picked up',
  on_the_way:  'On the way to you',
  delivered:   '🎉 Delivered!',
};
const STATUS_ICONS = {
  confirmed:  '✅', preparing: '👨‍🍳', ready: '📦',
  picked_up: '🏍️', on_the_way: '🏍️', delivered: '🎉'
};

export default function TrackingScreen({ route }) {
  const { orderId } = route.params;
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);
  const socketRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [tracking, setTracking] = useState(null);   // latest snapshot from REST
  const [agentPos, setAgentPos] = useState(null);   // live WS updates
  const [trail, setTrail] = useState([]);            // polyline points
  const [orderStatus, setOrderStatus] = useState('confirmed');

  // ── Pulse animation for agent dot ────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ── Fetch initial tracking snapshot ──────────
  useEffect(() => {
    (async () => {
      try {
        const [snap, trailData] = await Promise.all([
          fetch(`${API_BASE}/tracking/${orderId}`).then(r => r.json()),
          fetch(`${API_BASE}/tracking/${orderId}/trail`).then(r => r.json()),
        ]);
        setTracking(snap);
        setAgentPos({ lat: snap.lat, lng: snap.lng, heading: snap.heading });
        setOrderStatus(snap.status);
        setTrail(trailData.map(p => [parseFloat(p.lng), parseFloat(p.lat)]));

        // Fly camera to fit all 3 points
        const coords = [
          [snap.restaurant_lng, snap.restaurant_lat],
          [snap.lng, snap.lat],
          [snap.delivery_lng, snap.delivery_lat],
        ];
        cameraRef.current?.fitBounds(
          [Math.min(...coords.map(c=>c[0])), Math.min(...coords.map(c=>c[1]))],
          [Math.max(...coords.map(c=>c[0])), Math.max(...coords.map(c=>c[1]))],
          { padding: 80, duration: 1200 }
        );
      } catch (err) {
        console.error('Tracking fetch error:', err);
      }
    })();
  }, [orderId]);

  // ── WebSocket for live updates ─────────────
  useEffect(() => {
    const socket = io(API_BASE);
    socketRef.current = socket;
    socket.emit('track:order', { orderId });

    socket.on('location:update', ({ lat, lng, heading, speed }) => {
      setAgentPos({ lat, lng, heading });
      setTrail(prev => [...prev.slice(-30), [parseFloat(lng), parseFloat(lat)]]);
    });

    socket.on('status:update', ({ status }) => {
      setOrderStatus(status);
      if (status === 'delivered') socket.disconnect();
    });

    return () => socket.disconnect();
  }, [orderId]);

  const currentStep = STATUS_STEPS.indexOf(orderStatus);

  // ── GeoJSON layers ─────────────────────────
  const trailGeoJSON = {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: trail }
  };

  const agentGeoJSON = agentPos ? {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [parseFloat(agentPos.lng), parseFloat(agentPos.lat)] },
    properties: { heading: agentPos.heading || 0 }
  } : null;

  const restaurantGeoJSON = tracking ? {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [parseFloat(tracking.restaurant_lng), parseFloat(tracking.restaurant_lat)] }
  } : null;

  const destinationGeoJSON = tracking ? {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [parseFloat(tracking.delivery_lng), parseFloat(tracking.delivery_lat)] }
  } : null;

  return (
    <View style={styles.container}>
      {/* ── Map ───────────────────────────────── */}
      <MapLibreGL.MapView
        style={styles.map}
        styleURL={MAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <MapLibreGL.Camera ref={cameraRef} pitch={40} />

        {/* 3D buildings */}
        <MapLibreGL.FillExtrusionLayer
          id="buildings"
          sourceID="openmaptiles"
          sourceLayerID="building"
          filter={['==', 'extrude', 'true']}
          minZoomLevel={14}
          style={{
            fillExtrusionColor: '#C8A882',
            fillExtrusionHeight: ['get', 'render_height'],
            fillExtrusionBase: ['get', 'render_min_height'],
            fillExtrusionOpacity: 0.75,
          }}
        />

        {/* Agent trail */}
        {trail.length > 1 && (
          <MapLibreGL.ShapeSource id="trail" shape={trailGeoJSON}>
            <MapLibreGL.LineLayer
              id="trail-line"
              style={{
                lineColor: '#E63946',
                lineWidth: 3,
                lineDasharray: [2, 1],
                lineOpacity: 0.7,
              }}
            />
          </MapLibreGL.ShapeSource>
        )}

        {/* Restaurant pin */}
        {restaurantGeoJSON && (
          <MapLibreGL.ShapeSource id="restaurant" shape={restaurantGeoJSON}>
            <MapLibreGL.SymbolLayer
              id="restaurant-pin"
              style={{
                iconImage: 'restaurant-15',
                iconSize: 2,
                iconColor: '#FF6B35',
              }}
            />
            <MapLibreGL.CircleLayer
              id="restaurant-circle"
              style={{
                circleColor: '#FF6B35',
                circleRadius: 12,
                circleStrokeColor: '#fff',
                circleStrokeWidth: 2.5,
                circleOpacity: 0.9,
              }}
            />
          </MapLibreGL.ShapeSource>
        )}

        {/* Delivery destination */}
        {destinationGeoJSON && (
          <MapLibreGL.ShapeSource id="destination" shape={destinationGeoJSON}>
            <MapLibreGL.CircleLayer
              id="dest-circle"
              style={{
                circleColor: '#2EC4B6',
                circleRadius: 14,
                circleStrokeColor: '#fff',
                circleStrokeWidth: 3,
              }}
            />
          </MapLibreGL.ShapeSource>
        )}

        {/* Delivery agent — animated dot */}
        {agentGeoJSON && (
          <MapLibreGL.ShapeSource id="agent" shape={agentGeoJSON}>
            <MapLibreGL.CircleLayer
              id="agent-halo"
              style={{
                circleColor: 'rgba(230,57,70,0.25)',
                circleRadius: 22,
              }}
            />
            <MapLibreGL.CircleLayer
              id="agent-dot"
              style={{
                circleColor: '#E63946',
                circleRadius: 11,
                circleStrokeColor: '#fff',
                circleStrokeWidth: 3,
              }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>

      {/* ── Top Status Bar ────────────────────── */}
      <View style={[styles.statusBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.statusEmoji}>{STATUS_ICONS[orderStatus]}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusLabel}>{STATUS_LABELS[orderStatus]}</Text>
          {tracking && (
            <Text style={styles.agentInfo}>
              {tracking.agent_name}  •  {tracking.vehicle_type}
            </Text>
          )}
        </View>
        {tracking?.estimated_delivery_time && orderStatus !== 'delivered' && (
          <View style={styles.etaBadge}>
            <Text style={styles.etaNumber}>{tracking.estimated_delivery_time}</Text>
            <Text style={styles.etaUnit}>min</Text>
          </View>
        )}
      </View>

      {/* ── Progress Steps ────────────────────── */}
      <View style={[styles.progressBar, { paddingBottom: insets.bottom + 16 }]}>
        {STATUS_STEPS.map((step, i) => (
          <View key={step} style={styles.step}>
            <View style={[
              styles.stepDot,
              i <= currentStep && styles.stepDotActive,
              i === currentStep && styles.stepDotCurrent,
            ]}>
              {i < currentStep && <Text style={styles.stepCheck}>✓</Text>}
            </View>
            {i < STATUS_STEPS.length - 1 && (
              <View style={[styles.stepLine, i < currentStep && styles.stepLineActive]} />
            )}
          </View>
        ))}
      </View>

      {/* Bottom legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF6B35' }]} />
          <Text style={styles.legendLabel}>Restaurant</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E63946' }]} />
          <Text style={styles.legendLabel}>Agent</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2EC4B6' }]} />
          <Text style={styles.legendLabel}>Your Door</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  map:       { flex: 1 },

  statusBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(13,27,42,0.9)',
    paddingHorizontal: 16, paddingBottom: 14,
    gap: 12,
  },
  statusEmoji: { fontSize: 28 },
  statusLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  agentInfo:   { color: '#aaa', fontSize: 13, marginTop: 2 },
  etaBadge: {
    alignItems: 'center', backgroundColor: '#E63946',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6,
  },
  etaNumber: { color: '#fff', fontSize: 18, fontWeight: '800' },
  etaUnit:   { color: 'rgba(255,255,255,0.8)', fontSize: 11 },

  progressBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(13,27,42,0.92)',
    paddingHorizontal: 20, paddingTop: 16,
  },
  step: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#333', borderWidth: 2, borderColor: '#555',
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive:  { backgroundColor: '#E63946', borderColor: '#E63946' },
  stepDotCurrent: { backgroundColor: '#FF6B35', borderColor: '#FF6B35', transform: [{ scale: 1.3 }] },
  stepCheck: { color: '#fff', fontSize: 10, fontWeight: '800' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#333', marginHorizontal: 2 },
  stepLineActive: { backgroundColor: '#E63946' },

  legend: {
    position: 'absolute', bottom: 80, right: 16,
    backgroundColor: 'rgba(13,27,42,0.85)',
    borderRadius: 12, padding: 10, gap: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { color: '#ccc', fontSize: 12 },
});
