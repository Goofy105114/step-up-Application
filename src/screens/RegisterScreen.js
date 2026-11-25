import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import Toast from 'react-native-toast-message';

const C = { bg: '#0D0D0D', card: '#1A1A1A', card2: '#222', border: '#2A2A2A', accent: '#E34F20', white: '#fff', gray: '#9CA3AF', dim: '#6B7280' };

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const register = async () => {
    if (!form.first_name || !form.email || !form.password) { Toast.show({ type: 'error', text1: 'Fill all required fields' }); return; }
    if (form.password.length < 8) { Toast.show({ type: 'error', text1: 'Password must be 8+ characters' }); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      Toast.show({ type: 'success', text1: `Welcome to StepUp, ${res.data.user.first_name}! 🎉` });
      navigation.goBack();
    } catch (e) {
      Toast.show({ type: 'error', text1: e.response?.data?.message || 'Registration failed' });
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={C.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoS}>S</Text>
              <Text style={styles.logoU}>u</Text>
            </View>
            <Text style={styles.brand}>JOIN STEPUP</Text>
            <Text style={styles.tagline}>CREATE YOUR ACCOUNT</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Exclusive deals, early access & more 🎁</Text>

            {[
              { key: 'first_name', label: 'First Name *', placeholder: 'John', icon: 'person-outline' },
              { key: 'last_name', label: 'Last Name', placeholder: 'Doe', icon: 'person-outline' },
              { key: 'email', label: 'Email *', placeholder: 'john@example.com', icon: 'mail-outline', keyboard: 'email-address', caps: 'none' },
              { key: 'phone', label: 'Phone', placeholder: '9999999999', icon: 'call-outline', keyboard: 'phone-pad' },
            ].map(({ key, label, placeholder, icon, keyboard, caps }) => (
              <View key={key} style={styles.fieldWrap}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={icon} size={17} color={C.dim} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={C.dim}
                    value={form[key]}
                    onChangeText={(v) => set(key, v)}
                    keyboardType={keyboard || 'default'}
                    autoCapitalize={caps || 'words'}
                  />
                </View>
              </View>
            ))}

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={17} color={C.dim} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={C.dim}
                  value={form.password}
                  onChangeText={(v) => set('password', v)}
                  secureTextEntry={!showPw}
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ padding: 10 }}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={17} color={C.dim} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={register} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={[C.accent, '#c0392b']} style={styles.registerGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.registerBtnText}>Create Account</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.replace('Login')}>
              <Text style={styles.loginLinkText}>Already have an account? <Text style={{ color: C.accent, fontWeight: '800' }}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  logoSection: { alignItems: 'center', paddingVertical: 24 },
  logoBox: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: C.accent, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 16, marginBottom: 12 },
  logoS: { fontSize: 32, fontWeight: '900', color: '#fff' },
  logoU: { fontSize: 22, fontWeight: '700', color: '#fff' },
  brand: { fontSize: 18, fontWeight: '900', color: C.white, letterSpacing: 4, marginBottom: 4 },
  tagline: { fontSize: 10, color: C.dim, letterSpacing: 3 },
  formCard: { flex: 1, backgroundColor: '#1A1A1A', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '900', color: C.white, marginBottom: 4 },
  subtitle: { fontSize: 13, color: C.dim, marginBottom: 24 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '800', color: C.gray, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#2A2A2A', borderRadius: 12, backgroundColor: '#222' },
  inputIcon: { paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 14, fontSize: 14, color: C.white },
  registerBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  registerGrad: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  registerBtnText: { color: '#fff', fontSize: 15, fontWeight: '900' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginLinkText: { fontSize: 13, color: C.gray },
});
