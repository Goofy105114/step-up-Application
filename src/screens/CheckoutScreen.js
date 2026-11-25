import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import Toast from 'react-native-toast-message';

const C = { bg: '#0D0D0D', card: '#1A1A1A', card2: '#222', border: '#2A2A2A', accent: '#E34F20', white: '#fff', gray: '#9CA3AF', dim: '#6B7280' };
const STATES = ['Andhra Pradesh','Delhi','Gujarat','Karnataka','Kerala','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'];

export default function CheckoutScreen({ navigation, route }) {
  const { total = 0, shipping = 0, tax = 0, subtotal = 0 } = route.params || {};
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [payment, setPayment] = useState('cod');
  const [addr, setAddr] = useState({ full_name: '', email: '', phone: '', line1: '', city: '', state: '', postal_code: '', country: 'India' });
  const setA = (k, v) => setAddr(a => ({ ...a, [k]: v }));

  const discount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? (subtotal * parseFloat(appliedCoupon.discount_value)) / 100
      : parseFloat(appliedCoupon.discount_value)
    : 0;
  const finalTotal = subtotal - discount + shipping + tax;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/cart/apply-coupon', { code: coupon });
      setAppliedCoupon(res.data.data);
      Toast.show({ type: 'success', text1: 'Coupon applied! 🎉' });
    } catch (e) {
      Toast.show({ type: 'error', text1: e.response?.data?.message || 'Invalid coupon' });
    } finally { setCouponLoading(false); }
  };

  const placeOrder = async () => {
    if (!addr.full_name || !addr.phone || !addr.line1 || !addr.city || !addr.state || !addr.postal_code) {
      Toast.show({ type: 'error', text1: 'Fill all required fields' }); return;
    }
    setPlacing(true);
    try {
      const res = await api.post('/orders', {
        shipping_address: addr,
        payment_method: payment,
        coupon_code: appliedCoupon?.code,
      });
      setOrderId(res.data.data.order_number);
      setStep(3);
    } catch (e) {
      Toast.show({ type: 'error', text1: e.response?.data?.message || 'Failed to place order' });
    } finally { setPlacing(false); }
  };

  // Success screen
  if (step === 3) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }} edges={['top']}>
      <View style={styles.successCircle}>
        <Ionicons name="checkmark" size={48} color="#fff" />
      </View>
      <Text style={styles.successTitle}>Order Placed! 🎉</Text>
      <Text style={styles.successOrderId}>{orderId}</Text>
      <Text style={styles.successMsg}>Your order has been confirmed and will be delivered soon.</Text>
      <TouchableOpacity style={styles.trackBtn} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.trackBtnText}>Track My Order</Text>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.continueBtn} onPress={() => { navigation.navigate('Home'); }}>
        <Text style={styles.continueBtnText}>Continue Shopping</Text>
      </TouchableOpacity>
      <Text style={styles.authNote}>AUTHENTICATED SESSION · SECURE CHECKOUT COMPLETE</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => step > 1 ? setStep(1) : navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.steps}>
        {[{ n: 1, label: 'Delivery' }, { n: 2, label: 'Payment' }].map(({ n, label }, i) => (
          <React.Fragment key={n}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, step >= n && styles.stepCircleActive]}>
                {step > n
                  ? <Ionicons name="checkmark" size={14} color="#fff" />
                  : <Text style={[styles.stepNum, step >= n && styles.stepNumActive]}>{n}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, step >= n && styles.stepLabelActive]}>{label}</Text>
            </View>
            {i < 1 && <View style={[styles.stepLine, step > 1 && styles.stepLineActive]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>

        {/* Step 1 — Delivery */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            {[
              { key: 'full_name', label: 'Full Name *', placeholder: 'John Doe' },
              { key: 'email', label: 'Email', placeholder: 'john@example.com', keyboard: 'email-address' },
              { key: 'phone', label: 'Phone *', placeholder: '9999999999', keyboard: 'phone-pad' },
              { key: 'line1', label: 'Address *', placeholder: 'House / Flat / Street' },
              { key: 'city', label: 'City *', placeholder: 'Mumbai' },
              { key: 'postal_code', label: 'Pincode *', placeholder: '400001', keyboard: 'numeric', max: 6 },
            ].map(({ key, label, placeholder, keyboard, max }) => (
              <View key={key} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  placeholderTextColor={C.dim}
                  value={addr[key]}
                  onChangeText={(v) => setA(key, v)}
                  keyboardType={keyboard || 'default'}
                  maxLength={max}
                />
              </View>
            ))}

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>State *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {STATES.map(s => (
                    <TouchableOpacity key={s} onPress={() => setA('state', s)}
                      style={[styles.stateChip, addr.state === s && styles.stateChipActive]}>
                      <Text style={[styles.stateText, addr.state === s && styles.stateTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>Continue to Payment</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 — Payment */}
        {step === 2 && (
          <>
            {/* Payment method */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Payment Method</Text>
              {[
                { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when order arrives at door', icon: '💵' },
                { id: 'card', label: 'Card Payment', desc: 'Demo mode — no actual charge', icon: '💳' },
              ].map((opt) => (
                <TouchableOpacity key={opt.id} style={[styles.payOption, payment === opt.id && styles.payOptionActive]} onPress={() => setPayment(opt.id)}>
                  <Text style={styles.payIcon}>{opt.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.payLabel}>{opt.label}</Text>
                    <Text style={styles.payDesc}>{opt.desc}</Text>
                  </View>
                  <View style={[styles.radio, payment === opt.id && styles.radioActive]}>
                    {payment === opt.id && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Coupon */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Promo Code</Text>
              <View style={styles.couponRow}>
                <Ionicons name="pricetag-outline" size={15} color={C.dim} />
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter discount code"
                  placeholderTextColor={C.dim}
                  value={coupon}
                  onChangeText={setCoupon}
                  autoCapitalize="characters"
                  editable={!appliedCoupon}
                />
                {appliedCoupon
                  ? <TouchableOpacity style={styles.removeBtn} onPress={() => { setAppliedCoupon(null); setCoupon(''); }}>
                      <Text style={{ color: '#EF4444', fontWeight: '800', fontSize: 12 }}>REMOVE</Text>
                    </TouchableOpacity>
                  : <TouchableOpacity style={styles.applyBtn} onPress={applyCoupon} disabled={couponLoading || !coupon}>
                      {couponLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.applyBtnText}>APPLY</Text>}
                    </TouchableOpacity>
                }
              </View>
              {appliedCoupon && (
                <View style={styles.couponApplied}>
                  <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                  <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '700' }}>
                    {appliedCoupon.discount_type === 'percentage' ? appliedCoupon.discount_value + '% off applied!' : '₹' + appliedCoupon.discount_value + ' off applied!'}
                  </Text>
                </View>
              )}
            </View>

            {/* Order summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Summary</Text>
              {[
                { label: 'Subtotal', value: formatPrice(subtotal) },
                ...(discount > 0 ? [{ label: 'Discount', value: '-' + formatPrice(discount), green: true }] : []),
                { label: 'Shipping', value: shipping === 0 ? 'FREE' : formatPrice(shipping), green: shipping === 0 },
                { label: 'Tax (8%)', value: formatPrice(tax) },
              ].map(({ label, value, green }) => (
                <View key={label} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{label}</Text>
                  <Text style={[styles.summaryValue, green && { color: '#22C55E' }]}>{value}</Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(finalTotal)}</Text>
              </View>
            </View>

            {/* Place order button */}
            <TouchableOpacity style={styles.placeBtn} onPress={placeOrder} disabled={placing} activeOpacity={0.85}>
              <LinearGradient colors={[C.accent, '#c0392b']} style={styles.placeGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {placing
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name="lock-closed-outline" size={16} color="#fff" />
                      <Text style={styles.placeBtnText}>Place Order — {formatPrice(finalTotal)}</Text>
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.secureNote}>🔒 256-bit encrypted secure checkout</Text>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '900', color: C.white },
  steps: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 60, paddingVertical: 10, gap: 8 },
  stepItem: { alignItems: 'center', gap: 5 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.border },
  stepCircleActive: { backgroundColor: C.accent, borderColor: C.accent },
  stepNum: { fontSize: 13, fontWeight: '800', color: C.dim },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 10, color: C.dim, fontWeight: '700' },
  stepLabelActive: { color: C.white },
  stepLine: { flex: 1, height: 2, backgroundColor: C.border, marginBottom: 20 },
  stepLineActive: { backgroundColor: C.accent },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 18, gap: 12, borderWidth: 1, borderColor: C.border },
  cardTitle: { fontSize: 14, fontWeight: '900', color: C.white, marginBottom: 4 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: C.dim, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: { borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: C.white, backgroundColor: C.card2 },
  stateChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card2 },
  stateChipActive: { backgroundColor: C.white, borderColor: C.white },
  stateText: { fontSize: 11, fontWeight: '700', color: C.dim },
  stateTextActive: { color: C.bg, fontWeight: '800' },
  nextBtn: { backgroundColor: C.white, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4 },
  nextBtnText: { color: C.bg, fontSize: 14, fontWeight: '900' },
  payOption: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: C.border },
  payOptionActive: { borderColor: C.accent, backgroundColor: '#1D1010' },
  payIcon: { fontSize: 24 },
  payLabel: { fontSize: 13, fontWeight: '700', color: C.white },
  payDesc: { fontSize: 11, color: C.dim },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: C.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.accent },
  couponRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card2, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, borderStyle: 'dashed', borderColor: '#3A3A3A' },
  couponInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: C.white, letterSpacing: 1 },
  applyBtn: { backgroundColor: C.accent, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  applyBtnText: { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  removeBtn: { paddingHorizontal: 10, paddingVertical: 10 },
  couponApplied: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13, color: C.dim },
  summaryValue: { fontSize: 13, fontWeight: '600', color: C.white },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  totalLabel: { fontSize: 16, fontWeight: '900', color: C.white },
  totalValue: { fontSize: 20, fontWeight: '900', color: C.white },
  placeBtn: { borderRadius: 16, overflow: 'hidden' },
  placeGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  placeBtnText: { color: '#fff', fontSize: 15, fontWeight: '900' },
  secureNote: { fontSize: 11, color: C.dim, textAlign: 'center' },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: '900', color: C.white, marginBottom: 8 },
  successOrderId: { fontSize: 16, fontWeight: '800', color: C.accent, marginBottom: 12, fontFamily: 'monospace' },
  successMsg: { fontSize: 13, color: C.dim, textAlign: 'center', lineHeight: 20, marginBottom: 36 },
  trackBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 18, width: '100%', marginBottom: 12 },
  trackBtnText: { color: '#fff', fontSize: 15, fontWeight: '900' },
  continueBtn: { borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 24 },
  continueBtnText: { color: C.white, fontSize: 14, fontWeight: '700' },
  authNote: { fontSize: 9, color: '#3A3A3A', letterSpacing: 1 },
});
