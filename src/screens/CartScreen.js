import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const C = { bg: '#0D0D0D', card: '#1A1A1A', card2: '#222', border: '#2A2A2A', accent: '#E34F20', white: '#fff', gray: '#9CA3AF', dim: '#6B7280', success: '#22C55E' };

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
      setSubtotal(parseFloat(res.data.data?.subtotal || 0));
    } catch {}
    finally { setLoading(false); }
  };

  const updateQty = async (itemId, qty) => {
    setUpdating(itemId);
    try {
      if (qty < 1) await api.delete(`/cart/items/${itemId}`);
      else await api.patch(`/cart/items/${itemId}`, { quantity: qty });
      await fetchCart();
    } catch {}
    finally { setUpdating(null); }
  };

  const clearAll = () => {
    Alert.alert('Clear Cart', 'Remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: async () => { await api.delete('/cart'); setCartItems([]); setSubtotal(0); } },
    ]);
  };

  const shipping = subtotal >= 599 ? 0 : 99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const freeShipLeft = 599 - subtotal;
  const freeShipPct = Math.min((subtotal / 599) * 100, 100);

  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}><ActivityIndicator size="large" color={C.accent} /></View>;

  if (!cartItems.length) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }} edges={['top']}>
      <View style={styles.emptyIcon}><Ionicons name="bag-outline" size={48} color={C.dim} /></View>
      <Text style={{ fontSize: 20, fontWeight: '900', color: C.white, marginBottom: 8 }}>Your cart is empty</Text>
      <Text style={{ color: C.dim, textAlign: 'center', marginBottom: 32 }}>Add items you love to get started</Text>
      <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Shop')}>
        <Text style={styles.shopBtnText}>Explore Collection</Text>
        <Ionicons name="arrow-forward" size={16} color={C.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Cart</Text>
          <Text style={styles.itemCount}>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</Text>
        </View>
        <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={14} color={C.dim} />
          <Text style={styles.clearText}>CLEAR ALL</Text>
        </TouchableOpacity>
      </View>

      {/* Free shipping progress */}
      {freeShipLeft > 0 && (
        <View style={styles.freeShipBar}>
          <Text style={styles.freeShipText}>
            Add <Text style={{ color: C.accent, fontWeight: '800' }}>{formatPrice(freeShipLeft)}</Text> more for <Text style={{ color: C.success }}>FREE EXPRESS</Text>
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${freeShipPct}%` }]} />
          </View>
        </View>
      )}

      <FlatList
        data={cartItems}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingTop: 8, paddingBottom: 200 }}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: item.image_url || 'https://via.placeholder.com/80' }} style={styles.itemImg} />
            <View style={{ flex: 1 }}>
              <View style={styles.itemHeader}>
                {item.is_new_arrival && <View style={styles.dropBadge}><Text style={styles.dropText}>DROP S4</Text></View>}
                <TouchableOpacity onPress={() => updateQty(item.id, 0)} style={styles.removeBtn}>
                  <Ionicons name="close" size={14} color={C.dim} />
                </TouchableOpacity>
              </View>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemMeta}>Color: {item.color} · Size: US {item.size}</Text>
              <View style={styles.itemBottom}>
                <Text style={styles.itemPrice}>{formatPrice(item.unit_price)}</Text>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQty(item.id, item.quantity - 1)}
                    disabled={updating === item.id}
                  >
                    <Ionicons name={item.quantity === 1 ? 'trash-outline' : 'remove'} size={14} color={item.quantity === 1 ? '#EF4444' : C.white} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{updating === item.id ? '…' : item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQty(item.id, item.quantity + 1)}
                    disabled={updating === item.id}
                  >
                    <Ionicons name="add" size={14} color={C.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summary}>
            {/* Coupon */}
            <View style={styles.couponRow}>
              <Ionicons name="pricetag-outline" size={16} color={C.dim} />
              <Text style={styles.couponPlaceholder}>Enter discount code</Text>
              <TouchableOpacity style={styles.applyBtn}
                onPress={() => navigation.navigate('Checkout', { total, shipping, tax, subtotal })}>
                <Text style={styles.applyText}>APPLY</Text>
              </TouchableOpacity>
            </View>
            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}><Text style={styles.sumLabel}>Subtotal</Text><Text style={styles.sumVal}>{formatPrice(subtotal)}</Text></View>
              <View style={styles.summaryRow}>
                <Text style={styles.sumLabel}>Estimated Shipping ⓘ</Text>
                <Text style={[styles.sumVal, shipping === 0 && { color: C.success }]}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</Text>
              </View>
              <View style={styles.summaryRow}><Text style={styles.sumLabel}>Estimated Tax (8%)</Text><Text style={styles.sumVal}>{formatPrice(tax)}</Text></View>
              <View style={styles.totalRow}>
                <View>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalSub}>Includes of local taxes</Text>
                </View>
                <Text style={styles.totalVal}>{formatPrice(total)}</Text>
              </View>
            </View>
            {/* Trust badges */}
            <View style={styles.trustRow}>
              <View style={styles.trustItem}><Ionicons name="shield-checkmark-outline" size={14} color={C.success} /><Text style={styles.trustText}>100% Authenticity{'\n'}Verified</Text></View>
              <View style={styles.trustItem}><Ionicons name="refresh-outline" size={14} color={C.success} /><Text style={styles.trustText}>30-Day Free{'\n'}Returns</Text></View>
            </View>
          </View>
        }
      />

      {/* Checkout bar */}
      <View style={styles.checkoutBar}>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout', { total, shipping, tax, subtotal })}
        >
          <LinearGradient colors={[C.accent, '#c0392b']} style={styles.checkoutGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="lock-closed-outline" size={16} color="#fff" />
            <Text style={styles.checkoutText}>PROCEED TO CHECKOUT {formatPrice(total)}</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.secureText}>🔒 256-bit encrypted secure checkout</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '900', color: '#fff' },
  itemCount: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  clearText: { fontSize: 10, color: '#6B7280', fontWeight: '700', letterSpacing: 1 },
  freeShipBar: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#1A1A1A', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  freeShipText: { fontSize: 12, color: '#9CA3AF', marginBottom: 8 },
  progressTrack: { height: 4, backgroundColor: '#2A2A2A', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#E34F20', borderRadius: 2 },
  cartItem: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 14, padding: 12, gap: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  itemImg: { width: 85, height: 85, borderRadius: 10, backgroundColor: '#222' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  dropBadge: { backgroundColor: '#E34F20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  dropText: { fontSize: 8, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  removeBtn: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 13, fontWeight: '800', color: '#fff', lineHeight: 18, marginBottom: 4 },
  itemMeta: { fontSize: 11, color: '#6B7280', marginBottom: 10 },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: 16, fontWeight: '900', color: '#fff' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#222', borderRadius: 8, padding: 4 },
  qtyBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 14, fontWeight: '800', color: '#fff', minWidth: 20, textAlign: 'center' },
  summary: { gap: 12, marginTop: 8 },
  couponRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: '#3A3A3A' },
  couponPlaceholder: { flex: 1, fontSize: 13, color: '#6B7280' },
  applyBtn: { backgroundColor: '#2A2A2A', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  applyText: { fontSize: 11, fontWeight: '900', color: '#E34F20', letterSpacing: 1 },
  summaryCard: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: '#2A2A2A' },
  summaryTitle: { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sumLabel: { fontSize: 13, color: '#6B7280' },
  sumVal: { fontSize: 13, fontWeight: '600', color: '#fff' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2A2A2A', marginTop: 4 },
  totalLabel: { fontSize: 18, fontWeight: '900', color: '#fff' },
  totalSub: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  totalVal: { fontSize: 24, fontWeight: '900', color: '#fff' },
  trustRow: { flexDirection: 'row', gap: 12 },
  trustItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1A1A1A', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  trustText: { fontSize: 10, color: '#9CA3AF', lineHeight: 14 },
  checkoutBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#0D0D0D', borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  checkoutBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  checkoutGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  checkoutText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  secureText: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  shopBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E34F20', paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14 },
  shopBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
