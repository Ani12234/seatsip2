import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

type Restaurant = {
  id: string;
  name: string;
  cuisine_type: string;
  category: 'cafe' | 'restaurant' | 'cloud_kitchen';
  lat: number;
  lng: number;
};

type City = {
  lat: number;
  lng: number;
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

const MapCanvas = forwardRef<MapCanvasHandle, Props>(({ restaurants, city, selectedId, pinColors, onSelect }, ref) => {
  const mapRef = useRef<MapView>(null);
  const selectedRestaurant = restaurants.find((restaurant) => restaurant.id === selectedId);
  const region = {
    latitude: selectedRestaurant?.lat || city.lat,
    longitude: selectedRestaurant?.lng || city.lng,
    latitudeDelta: selectedRestaurant ? 0.032 : 0.075,
    longitudeDelta: selectedRestaurant ? 0.032 : 0.075,
  };

  useImperativeHandle(ref, () => ({
    focusRestaurant: (restaurant) => {
      mapRef.current?.animateToRegion({
        latitude: restaurant.lat,
        longitude: restaurant.lng,
        latitudeDelta: 0.032,
        longitudeDelta: 0.032,
      }, 700);
    },
  }));

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={region}
      region={region}
      showsUserLocation
      showsCompass
      toolbarEnabled={false}
    >
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          coordinate={{ latitude: restaurant.lat, longitude: restaurant.lng }}
          pinColor={pinColors[restaurant.category]}
          title={restaurant.name}
          description={restaurant.cuisine_type}
          onPress={() => onSelect(restaurant)}
        />
      ))}
    </MapView>
  );
});

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapCanvas;
