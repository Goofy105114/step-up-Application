import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import Toast from 'react-native-toast-message';

const C = { bg: '#F8F8F8', white: '#fff', primary: '#111', accent: '#E34F20', gray: '#6B7280', border: '#EBEBEB' };

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

  const setA = (key, val) => setAddr(a => ({ ...a, [key]: val }));

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

  if (step === 3) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <View style={styles.successIcon}><Ionicons name="checkmark-circle" size={80} color="#22C55E" /></View>
      <Text style={styles.successTitle}>Order Placed! 🎉</Text>
      <Text style={styles.successOrderId}>{orderId}</Text>
      <Text style={styles.successMsg}>Your order has been placed successfully. You'll receive updates soon.</Text>
      <TouchableOpacity style={styles.trackBtn} onPress={() => { navigation.navigate('Profile'); }}>
        <Text style={styles.trackBtnText}>Track Orders</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.continueBtnText}>Continue Shopping</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(1) : navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Steps */}
      <View style={styles.steps}>
        {[{ n: 1, label: 'Delivery' }, { n: 2, label: 'Payment' }].map(({ n, label }) => (
          <React.Fragment key={n}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, step >= n && styles.stepCircleActive]}>
                <Text style={[styles.stepNum, step >= n && styles.stepNumActive]}>{n}</Text>
              </View>
              <Text style={[styles.stepLabel, step >= n && styles.stepLabelActive]}>{label}</Text>
            </View>
            {n < 2 && <View style={[styles.stepLine, step > 1 && styles.stepLineActive]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            {[
              { key: 'full_name', label: 'Full Name *', placeholder: 'John Doe' },
              { key: 'email', label: 'Email', placeholder: 'john@example.com', keyboardType: 'email-address' },
              { key: 'phone', label: 'Phone *', placeholder: '9999999999', keyboardType: 'phone-pad' },
              { key: 'line1', label: 'Address *', placeholder: 'House / Flat / Street' },
              { key: 'city', label: 'City *', placeholder: 'Mumbai' },
              { key: 'postal_code', label: 'Pincode *', placeholder: '400001', keyboardType: 'numeric', maxLength: 6 },
            ].map(({ key, label, placeholder, keyboardType, maxLength }) => (
              <View key={key} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  placeholderTextColor={C.gray}
                  value={addr[key]}
                  onChangeText={(v) => setA(key, v)}
                  keyboardType={keyboardType || 'default'}
                  maxLength={maxLength}
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
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
              <Text style={styles.nextBtnText}>Continue to Payment</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Payment Method</Text>
              {[
                { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when order arrives', icon: '💵' },
                { id: 'card', label: 'Card Payment', desc: 'Demo only — no charge', icon: '💳' },
              ].map((opt) => (
                <TouchableOpacity key={opt.id} style={[styles.payOption, payment === opt.id && styles.payOptionActive]} onPress={() => setPayment(opt.id)}>
                  <Text style={styles.payIcon}>{opt.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.payLabel}>{opt.label}</Text>
                    <Text style={styles.payDesc}>{opt.desc}</Text>
                  </View>
                  {payment === opt.id && <Ionicons name="checkmark-circle" size={22} color={C.accent} />}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Coupon Code</Text>
              <View style={styles.couponRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="e.g. WELCOME10"
                  placeholderTextColor={C.gray}
                  value={coupon}
                  onChangeText={setCoupon}
                  autoCapitalize="characters"
                  editable={!appliedCoupon}
                />
                {appliedCoupon
                  ? <TouchableOpacity style={styles.removeBtn} onPress={() => { setAppliedCoupon(null); setCoupon(''); }}>
                      <Text style={{ color: '#EF4444', fontWeight: '700' }}>Remove</Text>
                    </TouchableOpacity>
                  : <TouchableOpacity style={styles.applyBtn} onPress={applyCoupon} disabled={couponLoading}>
                      {couponLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.applyBtnText}>Apply</Text>}
                    </TouchableOpacity>
                }
              </View>
              {appliedCoupon && <Text style={{ color: '#22C55E', fontSize: 12, marginTop: 8, fontWeight: '600' }}>✓ Coupon applied — {appliedCoupon.discount_type === 'percentage' ? appliedCoupon.discount_value + '% off' : '₹' + appliedCoupon.discount_value + ' off'}</Text>}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Summary</Text>
              {[
                { label: 'Subtotal', value: formatPrice(subtotal) },
                ...(discount > 0 ? [{ label: 'Discount', value: '-' + formatPrice(discount), green: true }] : []),
                { label: 'Shipping', value: shipping === 0 ? 'FREE' : formatPrice(shipping), green: shipping === 0 },
                { label: 'GST', value: formatPrice(tax) },
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

            <TouchableOpacity style={styles.placeBtn} onPress={placeOrder} disabled={placing}>
              {placing
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.placeBtnText}>Place Order — {formatPrice(finalTotal)}</Text>
              }
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#111' },
  steps: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 48, paddingVertical: 12, gap: 8 },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { backgroundColor: '#E34F20' },
  stepNum: { fontSize: 14, fontWeight: '800', color: '#9CA3AF' },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },
  stepLabelActive: { color: '#111' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginBottom: 14 },
  stepLineActive: { backgroundColor: '#E34F20' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 4 },
  fieldWrap: { gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1.5, borderColor: '#EBEBEB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111', backgroundColor: '#FAFAFA' },
  stateChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#EBEBEB', backgroundColor: '#fff' },
  stateChipActive: { backgroundColor: '#111', borderColor: '#111' },
  stateText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  stateTextActive: { color: '#fff' },
  nextBtn: { backgroundColor: '#111', borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  payOption: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#EBEBEB' },
  payOptionActive: { borderColor: '#E34F20', backgroundColor: '#FFF5F3' },
  payIcon: { fontSize: 24 },
  payLabel: { fontSize: 14, fontWeight: '700', color: '#111' },
  payDesc: { fontSize: 11, color: '#6B7280' },
  couponRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  applyBtn: { backgroundColor: '#111', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12 },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  removeBtn: { paddingHorizontal: 14, paddingVertical: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13, color: '#6B7280' },
  summaryValue: { fontSize: 13, fontWeight: '600', color: '#111' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EBEBEB' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#111' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#E34F20' },
  placeBtn: { backgroundColor: '#E34F20', borderRadius: 16, paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  placeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 8 },
  successOrderId: { fontSize: 16, fontWeight: '700', color: '#E34F20', marginBottom: 8 },
  successMsg: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  trackBtn: { backgroundColor: '#111', borderRadius: 14, paddingHorizontal: 48, paddingVertical: 16, marginBottom: 12, width: '100%', alignItems: 'center' },
  trackBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  continueBtn: { borderWidth: 1.5, borderColor: '#111', borderRadius: 14, paddingHorizontal: 48, paddingVertical: 16, width: '100%', alignItems: 'center' },
  continueBtnText: { color: '#111', fontSize: 15, fontWeight: '700' },
});
