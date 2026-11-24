import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import Toast from 'react-native-toast-message';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const register = async () => {
    if (!form.first_name || !form.email || !form.password) { Toast.show({ type: 'error', text1: 'Fill required fields' }); return; }
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={{ padding: 20 }} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>

          <View style={styles.form}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join StepUp for exclusive deals 👟</Text>

            {[
              { key: 'first_name', label: 'First Name *', placeholder: 'John', icon: 'person-outline' },
              { key: 'last_name', label: 'Last Name', placeholder: 'Doe', icon: 'person-outline' },
              { key: 'email', label: 'Email *', placeholder: 'john@example.com', icon: 'mail-outline', keyboard: 'email-address' },
              { key: 'phone', label: 'Phone', placeholder: '9999999999', icon: 'call-outline', keyboard: 'phone-pad' },
            ].map(({ key, label, placeholder, icon, keyboard }) => (
              <View key={key} style={styles.fieldWrap}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={icon} size={18} color="#9CA3AF" style={{ paddingHorizontal: 14 }} />
                  <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor="#9CA3AF"
                    value={form[key]} onChangeText={(v) => set(key, v)}
                    keyboardType={keyboard || 'default'} autoCapitalize={key === 'email' ? 'none' : 'words'} />
                </View>
              </View>
            ))}

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ paddingHorizontal: 14 }} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Min. 8 characters" placeholderTextColor="#9CA3AF"
                  value={form.password} onChangeText={(v) => set('password', v)} secureTextEntry={!showPw} />
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ padding: 8 }}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.btn} onPress={register} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.replace('Login')}>
              <Text style={styles.loginLinkText}>Already have an account? <Text style={{ color: '#E34F20' }}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  form: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28 },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 28 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FAFAFA', paddingRight: 4 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#111' },
  btn: { backgroundColor: '#E34F20', borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginLinkText: { fontSize: 14, color: '#6B7280' },
});
