import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { formatPrice, formatDate, getStatusColor } from '../utils/format';

const C = { bg: '#0D0D0D', card: '#1A1A1A', card2: '#222', border: '#2A2A2A', accent: '#E34F20', white: '#fff', gray: '#9CA3AF', dim: '#6B7280' };

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { fetchOrders(); }, []));

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? <ActivityIndicator size="large" color={C.accent} style={{ marginTop: 60 }} /> :
       orders.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={styles.emptyIcon}><Ionicons name="bag-outline" size={40} color={C.dim} /></View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.white, marginBottom: 8 }}>No orders yet</Text>
          <Text style={{ color: C.dim }}>Start shopping to see your orders here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNum}>{item.order_number}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.replace(/_/g, ' ')}</Text>
                </View>
              </View>
              <View style={styles.orderMeta}>
                <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>{(item.payment_method || 'cod').toUpperCase()}</Text>
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.total}>{formatPrice(item.total_amount)}</Text>
                <View style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={13} color={C.accent} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: '#fff' },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNum: { fontSize: 13, fontWeight: '800', color: '#fff', fontFamily: 'monospace' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'capitalize' },
  orderMeta: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  metaText: { fontSize: 11, color: '#6B7280' },
  metaDot: { fontSize: 11, color: '#3A3A3A' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontSize: 18, fontWeight: '900', color: '#fff' },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewBtnText: { fontSize: 12, fontWeight: '700', color: '#E34F20' },
});
