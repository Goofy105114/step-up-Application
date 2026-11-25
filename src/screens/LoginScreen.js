import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import Toast from 'react-native-toast-message';

const C = { bg: '#0D0D0D', card: '#1A1A1A', card2: '#222', border: '#2A2A2A', accent: '#E34F20', white: '#fff', gray: '#9CA3AF', dim: '#6B7280' };

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) { Toast.show({ type: 'error', text1: 'Fill all fields' }); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      Toast.show({ type: 'success', text1: `Welcome back, ${res.data.user.first_name}! 👋` });
      navigation.goBack();
    } catch (e) {
      Toast.show({ type: 'error', text1: e.response?.data?.message || 'Invalid credentials' });
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={C.white} />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoS}>S</Text>
              <Text style={styles.logoU}>u</Text>
            </View>
            <Text style={styles.brand}>STEPUP</Text>
            <Text style={styles.tagline}>PREMIUM FOOTWEAR</Text>
          </View>

          {/* Form card */}
          <View style={styles.formCard}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Good to see you again 👟</Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={17} color={C.dim} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={C.dim}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={17} color={C.dim} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={C.dim}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ padding: 10 }}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={17} color={C.dim} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={login} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={[C.accent, '#c0392b']} style={styles.loginGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.loginBtnText}>Sign In</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.replace('Register')} activeOpacity={0.8}>
              <Text style={styles.registerBtnText}>Create New Account</Text>
            </TouchableOpacity>

            <View style={styles.couponHint}>
              <Ionicons name="pricetag-outline" size={13} color={C.accent} />
              <Text style={styles.couponHintText}>Use code <Text style={{ color: C.accent, fontWeight: '800' }}>WELCOME10</Text> for 10% off your first order!</Text>
            </View>
          </View>

          <Text style={styles.versionTxt}>StepUp Mobile v2.4.0 · Crafted for footwear lovers</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  logoSection: { alignItems: 'center', paddingVertical: 32 },
  logoBox: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: C.accent, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 16, marginBottom: 12 },
  logoS: { fontSize: 32, fontWeight: '900', color: '#fff' },
  logoU: { fontSize: 22, fontWeight: '700', color: '#fff' },
  brand: { fontSize: 20, fontWeight: '900', color: C.white, letterSpacing: 6, marginBottom: 4 },
  tagline: { fontSize: 10, color: C.dim, letterSpacing: 3 },
  formCard: { flex: 1, backgroundColor: '#1A1A1A', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 20 },
  title: { fontSize: 22, fontWeight: '900', color: C.white, marginBottom: 4 },
  subtitle: { fontSize: 13, color: C.dim, marginBottom: 28 },
  fieldWrap: { marginBottom: 18 },
  label: { fontSize: 10, fontWeight: '800', color: C.gray, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#2A2A2A', borderRadius: 12, backgroundColor: '#222' },
  inputIcon: { paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 14, fontSize: 14, color: C.white },
  loginBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  loginGrad: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2A2A' },
  dividerText: { fontSize: 12, color: C.dim },
  registerBtn: { borderWidth: 1.5, borderColor: '#2A2A2A', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  registerBtnText: { color: C.white, fontSize: 14, fontWeight: '700' },
  couponHint: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, backgroundColor: '#1D1D1D', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  couponHintText: { fontSize: 12, color: C.gray, flex: 1, lineHeight: 18 },
  versionTxt: { fontSize: 10, color: '#3A3A3A', textAlign: 'center', paddingVertical: 16 },
});
