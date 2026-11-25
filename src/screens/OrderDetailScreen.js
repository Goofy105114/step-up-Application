import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { formatPrice, formatDate, getStatusColor } from '../utils/format';
import Toast from 'react-native-toast-message';

const C = { bg: '#0D0D0D', card: '#1A1A1A', card2: '#222', border: '#2A2A2A', accent: '#E34F20', white: '#fff', gray: '#9CA3AF', dim: '#6B7280' };
const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderDetailScreen({ navigation, route }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { fetchOrder(); }, []);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data.data);
    } catch {}
    finally { setLoading(false); }
  };

  const cancelOrder = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
        setCancelling(true);
        try {
          await api.post(`/orders/${orderId}/cancel`);
          Toast.show({ type: 'success', text1: 'Order cancelled. Stock restored.' });
          fetchOrder();
        } catch (e) {
          Toast.show({ type: 'error', text1: e.response?.data?.message || 'Cannot cancel' });
        } finally { setCancelling(false); }
      }},
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color={C.accent} style={{ flex: 1, backgroundColor: C.bg, marginTop: 60 }} />;
  if (!order) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}><Text style={{ color: C.gray }}>Order not found</Text></View>;

  const stepIdx = STEPS.indexOf(order.status);
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>

        {/* Status card */}
        <View style={styles.card}>
          <View style={styles.orderTopRow}>
            <View>
              <Text style={styles.orderNum}>{order.order_number}</Text>
              <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '22' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status.replace(/_/g, ' ')}</Text>
            </View>
          </View>

          {order.status !== 'cancelled' && (
            <View style={styles.tracker}>
              {STEPS.map((s, i) => (
                <View key={s} style={styles.trackerStep}>
                  <View style={[
                    styles.trackerDot,
                    i <= stepIdx && styles.trackerDotDone,
                    i === stepIdx && styles.trackerDotCurrent,
                  ]} />
                  <Text style={[styles.trackerLabel, i <= stepIdx && { color: '#22C55E' }]}>{s.replace(/_/g, '\n')}</Text>
                  {i < STEPS.length - 1 && <View style={[styles.trackerLine, i < stepIdx && styles.trackerLineDone]} />}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items ({order.items?.length || 0})</Text>
          {(order.items || []).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              {item.image_url
                ? <Image source={{ uri: item.image_url }} style={styles.itemImg} />
                : <View style={[styles.itemImg, { alignItems: 'center', justifyContent: 'center' }]}><Ionicons name="image-outline" size={22} color={C.card2} /></View>
              }
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product_name}</Text>
                <Text style={styles.itemMeta}>Size {item.size} · {item.color} · Qty {item.quantity}</Text>
                <Text style={styles.itemPrice}>{formatPrice(item.unit_price)} × {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>{formatPrice(item.total_price)}</Text>
            </View>
          ))}
        </View>

        {/* Price breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Breakdown</Text>
          {[
            { label: 'Subtotal', value: formatPrice(order.subtotal) },
            { label: 'Discount', value: parseFloat(order.discount_amount) > 0 ? '-' + formatPrice(order.discount_amount) : '—', accent: parseFloat(order.discount_amount) > 0 },
            { label: 'Shipping', value: parseFloat(order.shipping_amount) === 0 ? 'FREE' : formatPrice(order.shipping_amount), green: parseFloat(order.shipping_amount) === 0 },
            { label: 'Tax', value: formatPrice(order.tax_amount) },
          ].map(({ label, value, green, accent }) => (
            <View key={label} style={styles.priceRow}>
              <Text style={styles.priceLabel}>{label}</Text>
              <Text style={[styles.priceVal, green && { color: '#22C55E' }, accent && { color: C.accent }]}>{value}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalVal}>{formatPrice(order.total_amount)}</Text>
          </View>
        </View>

        {/* Address */}
        {order.shipping_address && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            {(() => {
              const a = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
              return <Text style={styles.address}>{[a.full_name, a.line1, a.line2, a.city, a.state, a.postal_code].filter(Boolean).join(', ')}</Text>;
            })()}
          </View>
        )}

        {/* Cancel */}
        {canCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={cancelOrder} disabled={cancelling}>
            {cancelling ? <ActivityIndicator color="#EF4444" /> : (
              <>
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.cancelText}>Cancel Order</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '900', color: '#fff' },
  card: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2A2A2A', gap: 10 },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNum: { fontSize: 14, fontWeight: '800', color: '#fff', fontFamily: 'monospace' },
  orderDate: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'capitalize' },
  tracker: { flexDirection: 'row', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  trackerStep: { flex: 1, alignItems: 'center', position: 'relative' },
  trackerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2A2A2A', marginBottom: 5 },
  trackerDotDone: { backgroundColor: '#22C55E' },
  trackerDotCurrent: { width: 14, height: 14, borderRadius: 7, borderWidth: 2.5, borderColor: '#22C55E', backgroundColor: '#0D0D0D' },
  trackerLabel: { fontSize: 7, color: '#3A3A3A', textAlign: 'center', lineHeight: 10 },
  trackerLine: { position: 'absolute', top: 5, left: '55%', right: '-45%', height: 1.5, backgroundColor: '#2A2A2A' },
  trackerLineDone: { backgroundColor: '#22C55E' },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#fff', marginBottom: 4 },
  itemRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  itemImg: { width: 68, height: 68, borderRadius: 10, backgroundColor: '#222' },
  itemName: { fontSize: 12, fontWeight: '700', color: '#fff', lineHeight: 17, marginBottom: 4 },
  itemMeta: { fontSize: 10, color: '#6B7280', marginBottom: 4 },
  itemPrice: { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },
  itemTotal: { fontSize: 13, fontWeight: '800', color: '#fff' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { fontSize: 12, color: '#6B7280' },
  priceVal: { fontSize: 12, fontWeight: '600', color: '#fff' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#fff' },
  totalVal: { fontSize: 18, fontWeight: '900', color: '#E34F20' },
  address: { fontSize: 12, color: '#9CA3AF', lineHeight: 18 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1A1A1A', borderRadius: 14, paddingVertical: 16, borderWidth: 1.5, borderColor: '#EF444444' },
  cancelText: { color: '#EF4444', fontSize: 14, fontWeight: '700' },
});
