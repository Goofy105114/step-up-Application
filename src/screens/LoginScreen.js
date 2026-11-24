import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import Toast from 'react-native-toast-message';

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
      Toast.show({ type: 'error', text1: e.response?.data?.message || 'Login failed' });
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>

          <View style={styles.hero}>
            <View style={styles.logo}><Text style={styles.logoText}>S</Text></View>
            <Text style={styles.brand}>StepUp</Text>
            <Text style={styles.tagline}>Premium Footwear</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Good to see you again 👟</Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#9CA3AF"
                  value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="••••••••" placeholderTextColor="#9CA3AF"
                  value={password} onChangeText={setPassword} secureTextEntry={!showPw} />
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ padding: 8 }}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={login} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Sign In</Text>}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.replace('Register')}>
              <Text style={styles.registerBtnText}>Create New Account</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>Try: WELCOME10 coupon on your first order!</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { padding: 20 },
  hero: { alignItems: 'center', paddingVertical: 24 },
  logo: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  brand: { fontSize: 28, fontWeight: '900', color: '#111', letterSpacing: -0.5 },
  tagline: { fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
  form: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 28 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FAFAFA', paddingRight: 4 },
  inputIcon: { paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#111' },
  loginBtn: { backgroundColor: '#111', borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { fontSize: 13, color: '#9CA3AF' },
  registerBtn: { borderWidth: 1.5, borderColor: '#111', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  registerBtnText: { color: '#111', fontSize: 15, fontWeight: '700' },
  hint: { fontSize: 12, color: '#E34F20', textAlign: 'center', marginTop: 20, fontWeight: '600' },
});
