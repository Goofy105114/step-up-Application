import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, Dimensions, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { formatPrice } from '../utils/format';

const { width } = Dimensions.get('window');
const CARD = (width - 48) / 2;
const C = { bg: '#0D0D0D', card: '#1A1A1A', card2: '#222', border: '#2A2A2A', accent: '#E34F20', white: '#fff', gray: '#9CA3AF', dim: '#6B7280' };

const FILTERS = [
  { label: 'All Footwear', value: '' },
  { label: "Men's", value: 'mens' },
  { label: "Women's", value: 'womens' },
  { label: 'Sports', value: 'sports' },
  { label: "Kids'", value: 'kids' },
  { label: 'Casual', value: 'casual' },
  { label: 'Formal', value: 'formal' },
  { label: 'Sandals', value: 'sandals' },
];

const SORT = [
  { label: 'Sort: Popularity ▾', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
];

function ProductCard({ item, onPress }) {
  const discount = item.sale_price
    ? Math.round(((parseFloat(item.base_price) - parseFloat(item.sale_price)) / parseFloat(item.base_price)) * 100)
    : null;
  return (
    <TouchableOpacity style={[styles.card, { width: CARD }]} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.imgWrap, { height: CARD }]}>
        {item.primary_image
          ? <Image source={{ uri: item.primary_image }} style={styles.img} resizeMode="cover" />
          : <View style={[styles.img, { alignItems: 'center', justifyContent: 'center' }]}><Ionicons name="image-outline" size={40} color={C.card2} /></View>
        }
        {discount && <View style={styles.badge}><Text style={styles.badgeText}>-{discount}%</Text></View>}
        {item.is_new_arrival && !discount && <View style={[styles.badge, { backgroundColor: '#3B82F6' }]}><Text style={styles.badgeText}>NEW</Text></View>}
        {item.is_bestseller && <View style={[styles.badge, { backgroundColor: '#8B5CF6', top: 'auto', bottom: 8 }]}><Text style={styles.badgeText}>BEST</Text></View>}
        <TouchableOpacity style={styles.wishBtn}>
          <Ionicons name="heart-outline" size={13} color={C.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={styles.brand}>{(item.brand || 'StepUp').toUpperCase()}</Text>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(item.sale_price || item.base_price)}</Text>
          {item.sale_price && <Text style={styles.oldPrice}>{formatPrice(item.base_price)}</Text>}
        </View>
        {item.avg_rating > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text style={styles.ratingText}>{parseFloat(item.avg_rating).toFixed(1)} ({item.review_count})</Text>
          </View>
        )}
        <TouchableOpacity style={styles.addCartBtn} onPress={onPress}>
          <Ionicons name="bag-add-outline" size={12} color={C.white} />
          <Text style={styles.addCartText}>Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function ShopScreen({ navigation, route }) {
  const initCat = route?.params?.category || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(initCat);
  const [sort, setSort] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [currentSort, setCurrentSort] = useState(SORT[0]);

  useEffect(() => {
    setProducts([]); setPage(1); setHasMore(true);
    fetch(1, true);
  }, [category, sort, search]);

  const fetch = async (p = 1, reset = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ limit: '12', page: String(p) });
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      if (sort === 'price_asc') { params.set('sort', 'price'); params.set('order', 'asc'); }
      if (sort === 'price_desc') { params.set('sort', 'price'); params.set('order', 'desc'); }
      if (sort === 'rating') { params.set('sort', 'rating'); params.set('order', 'desc'); }
      const res = await api.get(`/products?${params}`);
      const data = res.data.data || [];
      setProducts(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === 12);
    } catch {}
    finally { setLoading(false); setLoadingMore(false); }
  };

  const loadMore = () => { if (!hasMore || loadingMore) return; const n = page + 1; setPage(n); fetch(n); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}><Text style={styles.logoS}>S</Text><Text style={styles.logoU}>u</Text></View>
          <Text style={styles.logoLabel}>STEPUP</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search-outline" size={18} color={C.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="notifications-outline" size={18} color={C.white} /></TouchableOpacity>
        </View>
      </View>

      {/* Title + count */}
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.pageTag}>$525 DROP EXCLUSIVE</Text>
          <Text style={styles.pageTitle}>Explore Collection</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={15} color={C.dim} />
        <TextInput style={styles.searchInput} placeholder="Search 240+ elite styles, editions…"
          placeholderTextColor={C.dim} value={search} onChangeText={setSearch} returnKeyType="search" />
      </View>

      {/* Category filter chips */}
      <FlatList
        data={FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.value}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, category === item.value && styles.chipActive]}
            onPress={() => setCategory(item.value)}
          >
            <Text style={[styles.chipText, category === item.value && styles.chipTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Sort bar */}
      <View style={styles.sortBar}>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(!showSort)}>
          <Ionicons name="funnel-outline" size={13} color={C.accent} />
          <Text style={styles.sortBtnText}>{currentSort.label}</Text>
          <Ionicons name={showSort ? 'chevron-up' : 'chevron-down'} size={12} color={C.accent} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setSort('rating')}>
          <Ionicons name="star-outline" size={13} color={sort === 'rating' ? C.accent : C.dim} />
          <Text style={[styles.sortBtnText, { color: sort === 'rating' ? C.accent : C.dim }]}>Rating</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <Text style={styles.resultCount}>{products.length} results</Text>
      </View>

      {/* Sort dropdown */}
      {showSort && (
        <View style={styles.sortDropdown}>
          {SORT.map((s) => (
            <TouchableOpacity key={s.value} style={styles.sortOption} onPress={() => { setSort(s.value); setCurrentSort(s); setShowSort(false); }}>
              <Text style={[styles.sortOptionText, sort === s.value && { color: C.accent }]}>{s.label}</Text>
              {sort === s.value && <Ionicons name="checkmark" size={14} color={C.accent} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Products */}
      {loading ? <ActivityIndicator color={C.accent} style={{ marginTop: 60 }} size="large" /> : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100, gap: 16 }}
          columnWrapperStyle={{ gap: 16 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={C.accent} style={{ padding: 20 }} /> : null}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 40 }}>👟</Text>
              <Text style={{ color: C.gray, marginTop: 12 }}>No products found</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  logoS: { fontSize: 16, fontWeight: '900', color: '#fff' },
  logoU: { fontSize: 11, fontWeight: '700', color: '#fff' },
  logoLabel: { fontSize: 11, fontWeight: '800', color: C.white, letterSpacing: 3 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' },
  titleRow: { paddingHorizontal: 16, marginBottom: 10 },
  pageTag: { fontSize: 9, color: C.accent, fontWeight: '800', letterSpacing: 2, marginBottom: 2 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: C.white },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: C.border },
  searchInput: { flex: 1, fontSize: 13, color: C.white },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border },
  chipActive: { backgroundColor: C.white, borderColor: C.white },
  chipText: { fontSize: 12, fontWeight: '700', color: C.gray },
  chipTextActive: { color: C.bg, fontWeight: '800' },
  sortBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.card, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  sortBtnText: { fontSize: 11, fontWeight: '700', color: C.accent },
  resultCount: { fontSize: 11, color: C.dim },
  sortDropdown: { position: 'absolute', top: 190, left: 16, right: 16, backgroundColor: C.card, borderRadius: 12, zIndex: 100, borderWidth: 1, borderColor: C.border, padding: 4 },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  sortOptionText: { fontSize: 13, fontWeight: '600', color: C.white },
  card: { backgroundColor: C.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  imgWrap: { width: '100%', backgroundColor: C.card2, position: 'relative' },
  img: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: C.accent, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 },
  badgeText: { fontSize: 8, fontWeight: '900', color: '#fff' },
  wishBtn: { position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  info: { padding: 10 },
  brand: { fontSize: 8, color: C.dim, letterSpacing: 1, marginBottom: 2 },
  name: { fontSize: 12, fontWeight: '700', color: C.white, lineHeight: 16, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  price: { fontSize: 15, fontWeight: '900', color: C.white },
  oldPrice: { fontSize: 10, color: C.dim, textDecorationLine: 'line-through' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
  ratingText: { fontSize: 10, color: C.dim },
  addCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: C.accent, borderRadius: 8, paddingVertical: 7 },
  addCartText: { fontSize: 10, fontWeight: '800', color: '#fff' },
});
