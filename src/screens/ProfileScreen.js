import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const C = { bg: '#0D0D0D', card: '#1A1A1A', card2: '#222', border: '#2A2A2A', accent: '#E34F20', white: '#fff', gray: '#9CA3AF', dim: '#6B7280', success: '#22C55E' };

const MENU = [
  { icon: 'person-outline', label: 'Personal Information', right: null },
  { icon: 'location-outline', label: 'Shipping Addresses', right: '2 Saved' },
  { icon: 'card-outline', label: 'Payment & Wallet', right: 'UPI / Card' },
  { icon: 'notifications-outline', label: 'Notification Preferences', right: '🔴' },
  { icon: 'footsteps-outline', label: 'Shoe Size & Fit Preferences', right: 'US 10.5 Men' },
  { icon: 'shield-outline', label: 'Privacy & Security', right: null },
];

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('user').then(u => { if (u) setUser(JSON.parse(u)); else setUser(null); });
  }, []));

  const logout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await AsyncStorage.multiRemove(['token', 'user']); setUser(null); } },
    ]);
  };

  if (!user) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }} edges={['top']}>
      <View style={styles.logoBox}><Text style={styles.logoS}>S</Text><Text style={styles.logoU}>u</Text></View>
      <Text style={styles.guestTitle}>StepUp</Text>
      <Text style={styles.guestSub}>Sign in to access orders, wishlist,{'\n'}rewards and more</Text>
      <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginBtnText}>Sign In</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.regBtn} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.regBtnText}>Create Account</Text>
      </TouchableOpacity>
      <Text style={styles.versionTxt}>StepUp Mobile v2.4.0 · Crafted for footwear lovers</Text>
    </SafeAreaView>
  );

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTag}>COLLECTOR PROFILE</Text>
          <Text style={styles.headerTitle}>My Account</Text>
          <TouchableOpacity style={styles.settingsBtn}><Ionicons name="settings-outline" size={18} color={C.gray} /></TouchableOpacity>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
            <View style={styles.onlineDot} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
              <Ionicons name="checkmark-circle" size={16} color={C.accent} />
            </View>
            <Text style={styles.email}>{user.email}</Text>
            {user.role === 'admin' ? (
              <View style={styles.vipBadge}><Ionicons name="shield-checkmark" size={10} color="#fff" /><Text style={styles.vipText}>ADMIN · VIP GOLD</Text></View>
            ) : (
              <View style={styles.vipBadge}><Ionicons name="star" size={10} color="#fff" /><Text style={styles.vipText}>STEPUP VIP GOLD</Text></View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { n: '14', label: 'Orders', icon: 'bag-outline', action: () => navigation.navigate('Orders') },
            { n: '28', label: 'Wishlist', icon: 'heart-outline', action: () => navigation.navigate('Wishlist') },
            { n: '9', label: 'Reviews', icon: 'star-outline', action: () => {} },
          ].map(({ n, label, icon, action }) => (
            <TouchableOpacity key={label} style={styles.statBox} onPress={action}>
              <Ionicons name={icon} size={18} color={C.accent} />
              <Text style={styles.statNum}>{n}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          {[
            { icon: 'car-outline', label: 'Track...' },
            { icon: 'refresh-outline', label: 'Returns' },
            { icon: 'card-outline', label: 'Payments' },
            { icon: 'headset-outline', label: 'Help Desk' },
          ].map(({ icon, label }) => (
            <TouchableOpacity key={label} style={styles.quickItem}>
              <View style={styles.quickIcon}><Ionicons name={icon} size={18} color={C.white} /></View>
              <Text style={styles.quickLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>ACCOUNT SETTINGS</Text>
          <View style={styles.menuCard}>
            {MENU.map(({ icon, label, right }, i) => (
              <TouchableOpacity key={label} style={[styles.menuItem, i < MENU.length - 1 && styles.menuBorder]}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIcon}><Ionicons name={icon} size={16} color={C.white} /></View>
                  <Text style={styles.menuLabel}>{label}</Text>
                </View>
                <View style={styles.menuRight}>
                  {right && <Text style={styles.menuRight2}>{right}</Text>}
                  <Ionicons name="chevron-forward" size={14} color={C.dim} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>[ → LOG OUT</Text>
        </TouchableOpacity>

        <Text style={styles.versionFooter}>StepUp Mobile v2.4.0 · Crafted for footwear lovers{'\n'}AUTHENTICATED SESSION · TOKYO · NYC · LONDON</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  headerTag: { fontSize: 9, color: C.accent, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: C.white },
  settingsBtn: { position: 'absolute', top: 8, right: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 16, backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E34F2066' },
  avatarText: { fontSize: 22, fontWeight: '900', color: '#fff' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E', borderWidth: 2, borderColor: C.card },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  name: { fontSize: 17, fontWeight: '800', color: C.white },
  email: { fontSize: 11, color: C.dim, marginBottom: 8 },
  vipBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  vipText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: C.card, borderRadius: 14, paddingVertical: 16, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: C.border },
  statNum: { fontSize: 22, fontWeight: '900', color: C.white },
  statLabel: { fontSize: 10, color: C.dim, fontWeight: '600' },
  quickRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 20 },
  quickItem: { flex: 1, alignItems: 'center', gap: 6 },
  quickIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  quickLabel: { fontSize: 10, color: C.gray, fontWeight: '600', textAlign: 'center' },
  menuSection: { paddingHorizontal: 16, marginBottom: 16 },
  menuTitle: { fontSize: 10, fontWeight: '800', color: C.dim, letterSpacing: 2, marginBottom: 10 },
  menuCard: { backgroundColor: C.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 14, fontWeight: '600', color: C.white },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuRight2: { fontSize: 11, color: C.dim },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, padding: 16, marginBottom: 16 },
  logoutText: { fontSize: 15, fontWeight: '800', color: '#EF4444' },
  versionFooter: { fontSize: 9, color: C.dim, textAlign: 'center', lineHeight: 15 },
  logoBox: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, marginBottom: 16 },
  logoS: { fontSize: 28, fontWeight: '900', color: '#fff' },
  logoU: { fontSize: 18, fontWeight: '700', color: '#fff' },
  guestTitle: { fontSize: 32, fontWeight: '900', color: C.white, marginBottom: 10 },
  guestSub: { fontSize: 14, color: C.dim, textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 18, width: '100%', marginBottom: 12 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  regBtn: { borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 32 },
  regBtnText: { color: C.white, fontSize: 15, fontWeight: '700' },
  versionTxt: { fontSize: 10, color: C.dim },
});
