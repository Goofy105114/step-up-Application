import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const CARD = (width - 48) / 2;
const C = { bg: '#0D0D0D', card: '#1A1A1A', card2: '#222', border: '#2A2A2A', accent: '#E34F20', white: '#fff', gray: '#9CA3AF', dim: '#6B7280' };

export default function WishlistScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { fetchWishlist(); }, []));

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      setItems(res.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const remove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems(items.filter(i => i.product_id !== productId));
      Toast.show({ type: 'success', text1: 'Removed from wishlist' });
    } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Wishlist ({items.length})</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? <ActivityIndicator size="large" color={C.accent} style={{ marginTop: 60 }} /> :
       items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={styles.emptyIcon}><Ionicons name="heart-outline" size={40} color={C.dim} /></View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.white, marginBottom: 8 }}>Nothing saved yet</Text>
          <Text style={{ color: C.dim, marginBottom: 32 }}>Tap the heart on products you love</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.shopBtnText}>Discover Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(i) => i.product_id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          columnWrapperStyle={{ gap: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { width: CARD }]}
              onPress={() => navigation.navigate('ShopList', { screen: 'Product', slug: item.slug })}
              activeOpacity={0.9}
            >
              <View style={[styles.imgWrap, { height: CARD }]}>
                <Image source={{ uri: item.image_url }} style={styles.img} />
                <TouchableOpacity style={styles.heartBtn} onPress={() => remove(item.product_id)}>
                  <Ionicons name="heart" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
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
  shopBtn: { backgroundColor: '#E34F20', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  shopBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  card: { backgroundColor: '#1A1A1A', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' },
  imgWrap: { width: '100%', position: 'relative', backgroundColor: '#222' },
  img: { width: '100%', height: '100%' },
  heartBtn: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  info: { padding: 10 },
  name: { fontSize: 12, fontWeight: '700', color: '#fff', lineHeight: 17, marginBottom: 5 },
  price: { fontSize: 14, fontWeight: '900', color: '#fff' },
});
