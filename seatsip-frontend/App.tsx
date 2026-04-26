import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { RootStackParamList, TabParamList } from './src/navigation/types';
import { Colors } from './src/theme';

// Screens
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import ExploreScreen from './src/screens/explore/ExploreScreen';
import OrdersScreen from './src/screens/orders/OrdersScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import CafeDetailScreen from './src/screens/cafe/CafeDetailScreen';
import CafeMenuScreen from './src/screens/cafe/CafeMenuScreen';
import TableSelectScreen from './src/screens/reservations/TableSelectScreen';
import ReservationDetailsScreen from './src/screens/reservations/ReservationDetailsScreen';
import BookingConfirmedScreen from './src/screens/reservations/BookingConfirmedScreen';
import CartScreen from './src/screens/orders/CartScreen';
import CheckoutScreen from './src/screens/orders/CheckoutScreen';
import OrderConfirmedScreen from './src/screens/orders/OrderConfirmedScreen';
import OrderTrackingScreen from './src/screens/orders/OrderTrackingScreen';
import PreOrderMenuScreen from './src/screens/reservations/PreOrderMenuScreen';
import MapScreen from './src/screens/explore/MapScreen';
import SearchScreen from './src/screens/explore/SearchScreen';
import SettingsScreen from './src/screens/profile/SettingsScreen';
import RewardsScreen from './src/screens/rewards/RewardsScreen';
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import NotificationsScreen from './src/screens/profile/NotificationsScreen';
import PaymentsWalletScreen from './src/screens/profile/PaymentsWalletScreen';
import ReservationHistoryScreen from './src/screens/reservations/ReservationHistoryScreen';
import MyOrdersScreen from './src/screens/orders/MyOrdersScreen';
import HelpCenterScreen from './src/screens/profile/HelpCenterScreen';
import TermsScreen from './src/screens/profile/TermsScreen';
import PlaceholderScreen from './src/screens/PlaceholderScreen';
import MenuItemDetailScreen from './src/screens/cafe/MenuItemDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#C8382A',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#ECE6DF',
          borderTopWidth: 0.5,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'MapScreen') icon = '🗺️';
          else if (route.name === 'SearchTab') icon = '🔍';
          else if (route.name === 'Profile') icon = '👤';
          else if (route.name === 'Rewards') icon = '🎁';
          return <Text style={{ fontSize: 20, color: focused ? '#C8382A' : '#999999' }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MapScreen" component={MapScreen} options={{ title: 'Map' }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ title: 'Search' }} />
      <Tab.Screen name="Rewards" component={RewardsScreen} options={{ title: 'Rewards' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Minimal text component for tab icons
import { Text } from 'react-native';

function Navigation() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <Text style={{ fontSize: 40 }}>☕</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!user ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="CafeDetail" component={CafeDetailScreen} />
          <Stack.Screen name="CafeMenu" component={CafeMenuScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="OrderConfirmed" component={OrderConfirmedScreen} />
          <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
          <Stack.Screen name="TableSelect" component={TableSelectScreen} />
          <Stack.Screen name="ReservationDetails" component={ReservationDetailsScreen} />
          <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
          <Stack.Screen name="PreOrderMenu" component={PreOrderMenuScreen} />
          <Stack.Screen name="ProductDetail" component={MenuItemDetailScreen} />
          
          {/* Placeholders for other screens */}
          <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
          <Stack.Screen name="WalletScreen" component={PaymentsWalletScreen} />
          <Stack.Screen name="ReservationHistory" component={ReservationHistoryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="OrderHistory" component={MyOrdersScreen} />
          <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

import { View } from 'react-native';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <Navigation />
            <StatusBar style="auto" />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
