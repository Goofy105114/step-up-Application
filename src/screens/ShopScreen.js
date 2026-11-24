import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, Dimensions, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { formatPrice } from '../utils/format';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const C = {
  bg: '#F8F8F8', white: '#fff', primary: '#111', accent: '#E34F20',
  gray: '#6B7280', light: '#F3F3F3', border: '#EBEBEB',
};

const FILTERS = [
  { label: 'All', value: '' },
  { label: "Men's", value: 'mens' },
  { label: "Women's", value: 'womens' },
  { label: "Kids'", value: 'kids' },
  { label: 'Sports', value: 'sports' },
  { label: 'Casual', value: 'casual' },
  { label: 'Formal', value: 'formal' },
  { label: 'Sandals', value: 'sandals' },
];

const SORT = [
  { label: 'Newest', value: 'created_at' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
];

function ProductCard({ item, onPress }) {
  const discount = item.sale_price
    ? Math.round(((item.base_price - item.sale_price) / item.base_price) * 100)
    : null;
  return (
    <TouchableOpacity style={[styles.card, { width: CARD_WIDTH }]} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.imageWrap}>
        {item.primary_image
          ? <Image source={{ uri: item.primary_image }} style={styles.image} resizeMode="cover" />
          : <View style={[styles.image, { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
            </View>
        }
        {discount && (
          <View style={styles.badge}><Text style={styles.badgeText}>-{discount}%</Text></View>
        )}
        {item.is_new_arrival && !discount && (
          <View style={[styles.badge, { backgroundColor: '#111' }]}><Text style={styles.badgeText}>NEW</Text></View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.brand}>{item.brand || 'StepUp'}</Text>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(item.sale_price || item.base_price)}</Text>
          {item.sale_price && <Text style={styles.oldPrice}>{formatPrice(item.base_price)}</Text>}
        </View>
        {item.avg_rating > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text style={styles.ratingText}>{parseFloat(item.avg_rating).toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ShopScreen({ navigation, route }) {
  const initCategory = route?.params?.category || '';
  const initTitle = route?.params?.title || 'Shop';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(initCategory);
  const [sort, setSort] = useState('created_at');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [category, sort, search]);

  const fetchProducts = async (p = 1, reset = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        limit: '12', page: String(p),
        ...(category && { category }),
        ...(search && { search }),
        ...(sort === 'price_asc' && { sort: 'price', order: 'asc' }),
        ...(sort === 'price_desc' && { sort: 'price', order: 'desc' }),
        ...(sort === 'rating' && { sort: 'rating', order: 'desc' }),
      });
      const res = await api.get(`/products?${params}`);
      const data = res.data.data || [];
      setProducts(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === 12);
    } catch {}
    finally { setLoading(false); setLoadingMore(false); }
  };

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    const next = page + 1;
    setPage(next);
    fetchProducts(next);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() && navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{initTitle}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.backBtn}>
          <Ionicons name="search-outline" size={22} color={C.primary} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={C.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products…"
          placeholderTextColor={C.gray}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={16} color={C.gray} /></TouchableOpacity> : null}
      </View>

      {/* Category filter */}
      <FlatList
        data={FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.value}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, category === item.value && styles.filterChipActive]}
            onPress={() => setCategory(item.value)}
          >
            <Text style={[styles.filterText, category === item.value && styles.filterTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Sort chips */}
      <FlatList
        data={SORT}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.value}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.sortChip, sort === item.value && styles.sortChipActive]}
            onPress={() => setSort(item.value)}
          >
            <Text style={[styles.sortText, sort === item.value && styles.sortTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Products grid */}
      {loading ? (
        <ActivityIndicator color={C.accent} style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          columnWrapperStyle={{ gap: 16 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={C.accent} style={{ padding: 20 }} /> : null}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>👟</Text>
              <Text style={{ color: C.gray, fontSize: 15 }}>No products found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard item={item} onPress={() => navigation.navigate('Product', { slug: item.slug })} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: C.primary, textAlign: 'center', letterSpacing: -0.3 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, backgroundColor: C.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14, color: C.primary },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: C.gray },
  filterTextActive: { color: C.white },
  sortChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border },
  sortChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  sortText: { fontSize: 11, fontWeight: '600', color: C.gray },
  sortTextActive: { color: C.white },
  card: { backgroundColor: C.white, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  imageWrap: { width: '100%', height: CARD_WIDTH, backgroundColor: C.light },
  image: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: C.accent, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  cardInfo: { padding: 10 },
  brand: { fontSize: 9, color: C.gray, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  name: { fontSize: 12, fontWeight: '700', color: C.primary, lineHeight: 17, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  price: { fontSize: 14, fontWeight: '800', color: C.primary },
  oldPrice: { fontSize: 10, color: C.gray, textDecorationLine: 'line-through' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  ratingText: { fontSize: 10, color: C.gray },
});
