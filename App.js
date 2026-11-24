import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { View, ActivityIndicator } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import ShopScreen from './src/screens/ShopScreen';
import ProductScreen from './src/screens/ProductScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import SearchScreen from './src/screens/SearchScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const COLORS = {
  primary: '#111111',
  accent: '#E34F20',
  bg: '#F8F8F8',
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#F3F3F3',
};

function ShopStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShopList" component={ShopScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="ShopList" component={ShopScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' }}>
        <ActivityIndicator color="#E34F20" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#FFFFFF',
                borderTopWidth: 1,
                borderTopColor: '#F0F0F0',
                height: 60,
                paddingBottom: 8,
                paddingTop: 6,
                elevation: 20,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 20,
              },
              tabBarActiveTintColor: '#E34F20',
              tabBarInactiveTintColor: '#9CA3AF',
              tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
              tabBarIcon: ({ color, size, focused }) => {
                const icons = {
                  Home: focused ? 'home' : 'home-outline',
                  Shop: focused ? 'grid' : 'grid-outline',
                  Cart: focused ? 'bag' : 'bag-outline',
                  Profile: focused ? 'person' : 'person-outline',
                };
                return <Ionicons name={icons[route.name]} size={22} color={color} />;
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Shop" component={ShopStack} />
            <Tab.Screen name="Cart" component={CartStack} />
            <Tab.Screen name="Profile" component={ProfileStack} />
          </Tab.Navigator>
        </NavigationContainer>
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
