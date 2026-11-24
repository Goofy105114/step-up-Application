import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const C = { bg: '#F8F8F8', white: '#fff', primary: '#111', accent: '#E34F20', gray: '#6B7280', border: '#EBEBEB' };

export default function CartScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [subtotal, setSubtotal] = useState(0);

  useFocusEffect(useCallback(() => { fetchCart(); }, []));

  const fetchCart = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) { setCartItems([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCartItems(res.data.data?.items || []);
      setSubtotal(res.data.data?.subtotal || 0);
    } catch {}
    finally { setLoading(false); }
  };

  const updateQty = async (itemId, qty) => {
    setUpdating(itemId);
    try {
      if (qty < 1) {
        await api.delete(`/cart/items/${itemId}`);
      } else {
        await api.patch(`/cart/items/${itemId}`, { quantity: qty });
      }
      await fetchCart();
    } catch {}
    finally { setUpdating(null); }
  };

  const clearCart = async () => {
    Alert.alert('Clear cart?', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        await api.delete('/cart');
        setCartItems([]);
        setSubtotal(0);
      }},
    ]);
  };

  const shipping = subtotal >= 599 ? 0 : 99;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
      <ActivityIndicator size="large" color={C.accent} />
    </View>
  );

  if (cartItems.length === 0) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 60, marginBottom: 16 }}>🛍️</Text>
      <Text style={{ fontSize: 20, fontWeight: '800', color: C.primary, marginBottom: 8 }}>Cart is empty</Text>
      <Text style={{ color: C.gray, marginBottom: 32 }}>Add products to get started</Text>
      <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Shop')}>
        <Text style={styles.shopBtnText}>Start Shopping</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: item.image_url }} style={styles.itemImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemMeta}>Size {item.size} · {item.color}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.unit_price)}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(item.id, item.quantity - 1)}
                disabled={updating === item.id}
              >
                <Ionicons name={item.quantity === 1 ? 'trash-outline' : 'remove'} size={16} color={item.quantity === 1 ? '#EF4444' : C.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{updating === item.id ? '…' : item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(item.id, item.quantity + 1)}
                disabled={updating === item.id}
              >
                <Ionicons name="add" size={16} color={C.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Shipping</Text><Text style={[styles.summaryValue, shipping === 0 && { color: '#22C55E' }]}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>GST (5%)</Text><Text style={styles.summaryValue}>{formatPrice(tax)}</Text></View>
            <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{formatPrice(total)}</Text></View>
            {shipping > 0 && <Text style={styles.freeShipNote}>Add {formatPrice(599 - subtotal)} more for free shipping</Text>}
          </View>
        }
      />

      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutLabel}>Total Amount</Text>
          <Text style={styles.checkoutTotal}>{formatPrice(total)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout', { total, shipping, tax, subtotal })}>
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#111' },
  cartItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  itemImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#F3F3F3' },
  itemName: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 4, lineHeight: 18 },
  itemMeta: { fontSize: 11, color: '#6B7280', marginBottom: 6 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: '#111' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F3F3F3', alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 15, fontWeight: '700', color: '#111', minWidth: 20, textAlign: 'center' },
  summary: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 8, gap: 10 },
  summaryTitle: { fontSize: 15, fontWeight: '800', color: '#111', marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13, color: '#6B7280' },
  summaryValue: { fontSize: 13, fontWeight: '600', color: '#111' },
  totalRow: { paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EBEBEB' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#111' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#E34F20' },
  freeShipNote: { fontSize: 11, color: '#22C55E', textAlign: 'center', marginTop: 4 },
  checkoutBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EBEBEB' },
  checkoutLabel: { fontSize: 11, color: '#6B7280' },
  checkoutTotal: { fontSize: 20, fontWeight: '800', color: '#111' },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E34F20', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  checkoutBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  shopBtn: { backgroundColor: '#111', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  shopBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
