import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Wishlist ({items.length})</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? <ActivityIndicator size="large" color="#E34F20" style={{ marginTop: 60 }} /> :
       items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 60, marginBottom: 16 }}>❤️</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 8 }}>Wishlist is empty</Text>
          <Text style={{ color: '#6B7280', marginBottom: 32 }}>Save items you love</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('ShopList')}>
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
          renderItem={({ item }) => {
            const p = item.product || item;
            return (
              <TouchableOpacity
                style={[styles.card, { width: (width - 48) / 2 }]}
                onPress={() => navigation.navigate('ShopList', { screen: 'Product', params: { slug: p.slug || item.slug } })}
              >
                <View style={styles.imgWrap}>
                  <Image source={{ uri: p.primary_image || item.primary_image }} style={styles.img} />
                  <TouchableOpacity style={styles.heartBtn} onPress={() => remove(item.product_id)}>
                    <Ionicons name="heart" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={2}>{p.name || item.name}</Text>
                  <Text style={styles.price}>{formatPrice(p.sale_price || p.base_price || item.sale_price || item.base_price)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#111' },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  imgWrap: { width: '100%', height: (width - 48) / 2, position: 'relative' },
  img: { width: '100%', height: '100%' },
  heartBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  info: { padding: 10 },
  name: { fontSize: 12, fontWeight: '700', color: '#111', marginBottom: 4, lineHeight: 17 },
  price: { fontSize: 14, fontWeight: '800', color: '#111' },
  shopBtn: { backgroundColor: '#111', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  shopBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
