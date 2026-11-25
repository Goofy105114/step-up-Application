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
import { View, Text, ActivityIndicator } from 'react-native';

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
import api from './src/api/client';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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

function ShopStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShopList" component={ShopScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
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

export default function App() {
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await api.get('/cart');
      const items = res.data.data?.items || [];
      setCartCount(items.reduce((s, i) => s + i.quantity, 0));
    } catch {}
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D0D0D' }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', backgroundColor: '#E34F20', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, marginBottom: 20 }}>
          <Text style={{ fontSize: 36, fontWeight: '900', color: '#fff' }}>S</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>u</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 4, marginBottom: 4 }}>STEPUP</Text>
        <Text style={{ color: '#6B7280', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 48 }}>Premium Footwear</Text>
        <ActivityIndicator color="#E34F20" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#111111',
                borderTopWidth: 1,
                borderTopColor: '#1F1F1F',
                height: 62,
                paddingBottom: 8,
                paddingTop: 6,
              },
              tabBarActiveTintColor: '#E34F20',
              tabBarInactiveTintColor: '#4B5563',
              tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
              tabBarIcon: ({ color, focused }) => {
                const icons = {
                  Home: focused ? 'home' : 'home-outline',
                  Shop: focused ? 'grid' : 'grid-outline',
                  Cart: focused ? 'bag' : 'bag-outline',
                  Profile: focused ? 'person' : 'person-outline',
                };
                return (
                  <View>
                    <Ionicons name={icons[route.name]} size={22} color={color} />
                    {route.name === 'Cart' && cartCount > 0 && (
                      <View style={{
                        position: 'absolute', top: -5, right: -8,
                        backgroundColor: '#E34F20', borderRadius: 8,
                        minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
                        paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#0D0D0D',
                      }}>
                        <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>{cartCount > 9 ? '9+' : cartCount}</Text>
                      </View>
                    )}
                  </View>
                );
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Shop" component={ShopStack} />
            <Tab.Screen name="Cart" component={CartStack} listeners={{ focus: fetchCartCount }} />
            <Tab.Screen name="Profile" component={ProfileStack} />
          </Tab.Navigator>
        </NavigationContainer>
        <Toast
          config={{
            success: (props) => (
              <View style={{ backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginHorizontal: 16, borderLeftWidth: 3, borderLeftColor: '#22C55E', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <View><Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{props.text1}</Text>{props.text2 ? <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>{props.text2}</Text> : null}</View>
              </View>
            ),
            error: (props) => (
              <View style={{ backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginHorizontal: 16, borderLeftWidth: 3, borderLeftColor: '#EF4444', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <View><Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{props.text1}</Text></View>
              </View>
            ),
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
