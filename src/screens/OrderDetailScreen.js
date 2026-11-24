import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { formatPrice, formatDate, getStatusColor } from '../utils/format';
import Toast from 'react-native-toast-message';

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
          Toast.show({ type: 'success', text1: 'Order cancelled' });
          fetchOrder();
        } catch (e) {
          Toast.show({ type: 'error', text1: e.response?.data?.message || 'Cannot cancel' });
        } finally { setCancelling(false); }
      }},
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#E34F20" style={{ flex: 1, marginTop: 60 }} />;
  if (!order) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Order not found</Text></View>;

  const stepIdx = STEPS.indexOf(order.status);
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        {/* Status */}
        <View style={styles.card}>
          <View style={styles.orderTopRow}>
            <View>
              <Text style={styles.orderNum}>{order.order_number}</Text>
              <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status.replace(/_/g, ' ')}</Text>
            </View>
          </View>

          {/* Progress tracker */}
          {order.status !== 'cancelled' && (
            <View style={styles.tracker}>
              {STEPS.map((s, i) => (
                <View key={s} style={styles.trackerStep}>
                  <View style={[styles.trackerDot, i <= stepIdx && styles.trackerDotActive, i === stepIdx && styles.trackerDotCurrent]} />
                  <Text style={[styles.trackerLabel, i <= stepIdx && styles.trackerLabelActive]}>{s.replace(/_/g, '\n')}</Text>
                  {i < STEPS.length - 1 && <View style={[styles.trackerLine, i < stepIdx && styles.trackerLineActive]} />}
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
                : <View style={[styles.itemImg, { backgroundColor: '#F3F3F3', alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="image-outline" size={24} color="#D1D5DB" />
                  </View>
              }
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product_name}</Text>
                <Text style={styles.itemMeta}>Size {item.size} · {item.color} · Qty {item.quantity}</Text>
                <Text style={styles.itemPrice}>{formatPrice(item.unit_price)} × {item.quantity} = {formatPrice(item.total_price)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Price breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Breakdown</Text>
          {[
            { label: 'Subtotal', value: formatPrice(order.subtotal) },
            { label: 'Discount', value: order.discount_amount > 0 ? '-' + formatPrice(order.discount_amount) : '—', green: order.discount_amount > 0 },
            { label: 'Shipping', value: parseFloat(order.shipping_amount) === 0 ? 'FREE' : formatPrice(order.shipping_amount), green: parseFloat(order.shipping_amount) === 0 },
            { label: 'GST', value: formatPrice(order.tax_amount) },
          ].map(({ label, value, green }) => (
            <View key={label} style={styles.priceRow}>
              <Text style={styles.priceLabel}>{label}</Text>
              <Text style={[styles.priceValue, green && { color: '#22C55E' }]}>{value}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>{formatPrice(order.total_amount)}</Text>
          </View>
        </View>

        {/* Shipping address */}
        {order.shipping_address && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            {(() => {
              const a = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
              return <Text style={styles.address}>{[a.full_name, a.line1, a.line2, a.city, a.state, a.postal_code].filter(Boolean).join(', ')}</Text>;
            })()}
          </View>
        )}

        {/* Cancel button */}
        {canCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={cancelOrder} disabled={cancelling}>
            {cancelling ? <ActivityIndicator color="#EF4444" /> : (
              <>
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.cancelBtnText}>Cancel Order</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#111' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, gap: 12 },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNum: { fontSize: 15, fontWeight: '800', color: '#111', fontFamily: 'monospace' },
  orderDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  tracker: { flexDirection: 'row', marginTop: 8 },
  trackerStep: { flex: 1, alignItems: 'center', position: 'relative' },
  trackerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E5E7EB', marginBottom: 4 },
  trackerDotActive: { backgroundColor: '#22C55E' },
  trackerDotCurrent: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: '#22C55E', backgroundColor: '#fff' },
  trackerLabel: { fontSize: 8, color: '#9CA3AF', textAlign: 'center', lineHeight: 11 },
  trackerLabelActive: { color: '#22C55E' },
  trackerLine: { position: 'absolute', top: 6, left: '60%', right: '-40%', height: 2, backgroundColor: '#E5E7EB' },
  trackerLineActive: { backgroundColor: '#22C55E' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#111', marginBottom: 4 },
  itemRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  itemImg: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#F3F3F3' },
  itemName: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 4, lineHeight: 18 },
  itemMeta: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  itemPrice: { fontSize: 12, fontWeight: '700', color: '#111' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { fontSize: 13, color: '#6B7280' },
  priceValue: { fontSize: 13, fontWeight: '600', color: '#111' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EBEBEB' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#111' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#E34F20' },
  address: { fontSize: 13, color: '#374151', lineHeight: 20 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 14, paddingVertical: 16, borderWidth: 1.5, borderColor: '#FCA5A5' },
  cancelBtnText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});
