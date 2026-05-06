import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPTILER_KEY = '5qJr4cBxnkaZ1S4BU1Ua';
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;
const DEFAULT_ZOOM = 13.2;

type Restaurant = {
  id: string;
  name: string;
  category: 'cafe' | 'restaurant' | 'cloud_kitchen';
  lat: number;
  lng: number;
};

type City = {
  name: string;
  lat: number;
  lng: number;
  zoom_level?: number;
};

type Props = {
  restaurants: Restaurant[];
  city: City;
  selectedId?: string;
  pinColors: Record<Restaurant['category'], string>;
  onSelect: (restaurant: Restaurant) => void;
};

export type MapCanvasHandle = {
  focusRestaurant: (restaurant: Restaurant) => void;
};

const BUILDINGS_LAYER = {
  id: 'seatsip-buildings-3d',
  type: 'fill-extrusion',
  source: 'openmaptiles',
  'source-layer': 'building',
  filter: ['==', 'extrude', 'true'],
  minzoom: 13,
  paint: {
    'fill-extrusion-color': [
      'interpolate',
      ['linear'],
      ['zoom'],
      13,
      '#C8A882',
      16,
      '#E8C99A',
    ],
    'fill-extrusion-height': [
      'interpolate',
      ['linear'],
      ['zoom'],
      13,
      0,
      13.5,
      ['get', 'render_height'],
    ],
    'fill-extrusion-base': ['get', 'render_min_height'],
    'fill-extrusion-opacity': 0.85,
  },
} as const;

function markerLabel(category: Restaurant['category']) {
  if (category === 'cafe') return 'C';
  if (category === 'restaurant') return 'R';
  return 'K';
}

function createMarkerElement(restaurant: Restaurant, color: string, selected: boolean) {
  const element = document.createElement('button');
  element.type = 'button';
  element.setAttribute('aria-label', restaurant.name);
  element.style.width = selected ? '42px' : '34px';
  element.style.height = selected ? '42px' : '34px';
  element.style.borderRadius = '50%';
  element.style.border = '3px solid #FFFFFF';
  element.style.background = color;
  element.style.color = '#FFFFFF';
  element.style.fontWeight = '800';
  element.style.fontSize = selected ? '14px' : '12px';
  element.style.boxShadow = selected ? '0 10px 24px rgba(0,0,0,0.32)' : '0 6px 16px rgba(0,0,0,0.24)';
  element.style.cursor = 'pointer';
  element.style.display = 'flex';
  element.style.alignItems = 'center';
  element.style.justifyContent = 'center';
  element.style.transition = 'width 160ms ease, height 160ms ease, box-shadow 160ms ease';
  element.textContent = markerLabel(restaurant.category);
  return element;
}

const MapCanvas = forwardRef<MapCanvasHandle, Props>(({ restaurants, city, selectedId, pinColors, onSelect }, ref) => {
  const containerRef = useRef<any>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const onSelectRef = useRef(onSelect);

  onSelectRef.current = onSelect;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'absolute';
    container.style.inset = '0';

    const controlStyle = document.createElement('style');
    controlStyle.textContent = `
      .maplibregl-ctrl-top-right {
        top: 134px;
        right: 12px;
      }
      .maplibregl-ctrl-bottom-right {
        bottom: 228px;
        right: 12px;
      }
      .maplibregl-ctrl button {
        width: 34px;
        height: 34px;
      }
    `;
    document.head.appendChild(controlStyle);

    const map = new maplibregl.Map({
      container,
      style: MAP_STYLE,
      center: [city.lng, city.lat],
      zoom: Math.max(DEFAULT_ZOOM, city.zoom_level || DEFAULT_ZOOM),
      pitch: 60,
      bearing: -20,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right');

    map.on('load', () => {
      if (map.getSource('openmaptiles') && !map.getLayer(BUILDINGS_LAYER.id)) {
        map.addLayer(BUILDINGS_LAYER as any);
      }
      map.resize();
    });

    mapRef.current = map;

    const resizeMap = () => map.resize();
    window.requestAnimationFrame(resizeMap);
    window.setTimeout(resizeMap, 250);
    const resizeObserver = new ResizeObserver(resizeMap);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      controlStyle.remove();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: [city.lng, city.lat],
      zoom: Math.max(DEFAULT_ZOOM, city.zoom_level || DEFAULT_ZOOM),
      pitch: 60,
      bearing: -20,
      duration: 1200,
      essential: true,
    });
  }, [city]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = restaurants.map((restaurant) => {
      const element = createMarkerElement(
        restaurant,
        pinColors[restaurant.category],
        restaurant.id === selectedId
      );

      element.addEventListener('click', (event) => {
        event.stopPropagation();
        onSelectRef.current(restaurant);
      });

      return new maplibregl.Marker({ element, anchor: 'center' })
        .setLngLat([restaurant.lng, restaurant.lat])
        .addTo(map);
    });
  }, [restaurants, selectedId, pinColors]);

  useImperativeHandle(ref, () => ({
    focusRestaurant: (restaurant) => {
      mapRef.current?.flyTo({
        center: [restaurant.lng, restaurant.lat],
        zoom: 16.2,
        pitch: 62,
        bearing: 10,
        duration: 900,
        essential: true,
      });
    },
  }));

  return <View ref={containerRef} testID="maplibre-web-map" style={styles.map} />;
});

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    minHeight: 560,
  },
});

export default MapCanvas;
