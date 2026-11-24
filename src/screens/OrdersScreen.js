import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { formatPrice, formatDate, getStatusColor } from '../utils/format';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? <ActivityIndicator size="large" color="#E34F20" style={{ marginTop: 60 }} /> :
       orders.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 50, marginBottom: 16 }}>📦</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 8 }}>No orders yet</Text>
          <Text style={{ color: '#6B7280' }}>Your orders will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNum}>{item.order_number}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.replace(/_/g, ' ')}</Text>
                </View>
              </View>
              <View style={styles.orderMeta}>
                <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
                <Text style={styles.metaText}>·</Text>
                <Text style={styles.metaText}>{item.payment_method?.toUpperCase()}</Text>
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.total}>{formatPrice(item.total_amount)}</Text>
                <View style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={14} color="#E34F20" />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#111' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNum: { fontSize: 14, fontWeight: '800', color: '#111', fontFamily: 'monospace' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  orderMeta: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  metaText: { fontSize: 12, color: '#9CA3AF' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontSize: 18, fontWeight: '800', color: '#111' },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewBtnText: { fontSize: 13, fontWeight: '700', color: '#E34F20' },
});
