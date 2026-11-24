import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const C = { bg: '#F8F8F8', white: '#fff', primary: '#111', accent: '#E34F20', gray: '#6B7280', border: '#EBEBEB' };

const MENU_ITEMS = [
  { icon: 'bag-outline', label: 'My Orders', screen: 'Orders' },
  { icon: 'heart-outline', label: 'Wishlist', screen: 'Wishlist' },
  { icon: 'location-outline', label: 'Saved Addresses', screen: null },
  { icon: 'notifications-outline', label: 'Notifications', screen: null },
  { icon: 'shield-checkmark-outline', label: 'Privacy Policy', screen: null },
  { icon: 'help-circle-outline', label: 'Help & Support', screen: null },
];

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('user').then(u => { if (u) setUser(JSON.parse(u)); else setUser(null); });
  }, []));

  const logout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await AsyncStorage.multiRemove(['token', 'user']);
        setUser(null);
      }},
    ]);
  };

  if (!user) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <View style={styles.avatarPlaceholder}>
        <Ionicons name="person-outline" size={48} color={C.gray} />
      </View>
      <Text style={styles.guestTitle}>Welcome to StepUp</Text>
      <Text style={styles.guestSub}>Sign in to view your orders, wishlist and more</Text>
      <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginBtnText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerBtnText}>Create Account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* Avatar card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {user.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#fff" />
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'bag-outline', label: 'Orders', action: () => navigation.navigate('Orders') },
            { icon: 'heart-outline', label: 'Wishlist', action: () => navigation.navigate('Wishlist') },
            { icon: 'star-outline', label: 'Reviews', action: () => {} },
          ].map(({ icon, label, action }) => (
            <TouchableOpacity key={label} style={styles.statItem} onPress={action}>
              <Ionicons name={icon} size={22} color={C.accent} />
              <Text style={styles.statLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map(({ icon, label, screen }) => (
            <TouchableOpacity
              key={label}
              style={styles.menuItem}
              onPress={() => screen && navigation.navigate(screen)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={icon} size={20} color={C.primary} />
              </View>
              <Text style={styles.menuLabel}>{label}</Text>
              <Ionicons name="chevron-forward" size={16} color={C.gray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16, margin: 16, backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, elevation: 4 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E34F20', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  name: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 2 },
  email: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E34F20', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  adminBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 12, marginBottom: 16 },
  statItem: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 6, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statLabel: { fontSize: 12, fontWeight: '700', color: '#111' },
  menuCard: { margin: 16, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F3F3', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, padding: 18, backgroundColor: '#FEF2F2', borderRadius: 16, justifyContent: 'center' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F3F3', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  guestTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 8 },
  guestSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  loginBtn: { backgroundColor: '#111', borderRadius: 14, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  registerBtn: { borderWidth: 1.5, borderColor: '#111', borderRadius: 14, paddingVertical: 16, width: '100%', alignItems: 'center' },
  registerBtnText: { color: '#111', fontSize: 16, fontWeight: '700' },
});
