import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import MapScreen from './screens/MapScreen';
import TrackingScreen from './screens/TrackingScreen';

const Stack = createStackNavigator();

function PlaceholderScreen({ route }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.title}>{route.name}</Text>
      <Text style={styles.text}>This flow is ready to connect to the existing API routes.</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Map"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0D1B2A' },
          }}
        >
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Tracking" component={TrackingScreen} />
          <Stack.Screen name="Search" component={PlaceholderScreen} />
          <Stack.Screen name="Restaurant" component={PlaceholderScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0D1B2A',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  text: {
    color: '#A8B2C0',
    fontSize: 16,
    lineHeight: 22,
  },
});
