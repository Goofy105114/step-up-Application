import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Dimensions, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const C = {
  bg: '#F8F8F8', white: '#fff', primary: '#111', accent: '#E34F20',
  gray: '#6B7280', light: '#F3F3F3', border: '#EBEBEB',
};

const BANNERS = [
  { id: 1, tag: 'New Arrivals', title: 'Summer\nCollection', sub: '30% OFF', colors: ['#1a1a2e', '#16213e'], img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format' },
  { id: 2, tag: 'Trending Now', title: 'Walk in\nStyle', sub: 'From ₹1,999', colors: ['#2d1b69', '#11998e'], img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format' },
  { id: 3, tag: 'Sports Edition', title: 'Run\nFurther', sub: 'Go Faster', colors: ['#c94b4b', '#4b134f'], img: 'https://images.unsplash.com/photo-1556906781-9a414e2a9c86?w=600&auto=format' },
];

const CATEGORIES = [
  { name: "Men's", slug: 'mens', icon: '👟' },
  { name: "Women's", slug: 'womens', icon: '👠' },
  { name: "Kids'", slug: 'kids', icon: '👶' },
  { name: 'Sports', slug: 'sports', icon: '⚽' },
  { name: 'Casual', slug: 'casual', icon: '🥿' },
  { name: 'Formal', slug: 'formal', icon: '👔' },
  { name: 'Sandals', slug: 'sandals', icon: '🩴' },
];

function ProductCard({ item, onPress }) {
  const discount = item.sale_price
    ? Math.round(((item.base_price - item.sale_price) / item.base_price) * 100)
    : null;
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.productImageWrap}>
        <Image source={{ uri: item.primary_image }} style={styles.productImage} resizeMode="cover" />
        {discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
        {item.is_new_arrival && !discount && (
          <View style={[styles.discountBadge, { backgroundColor: '#111' }]}>
            <Text style={styles.discountText}>NEW</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{item.brand || 'StepUp'}</Text>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.salePrice}>{formatPrice(item.sale_price || item.base_price)}</Text>
          {item.sale_price && (
            <Text style={styles.basePrice}>{formatPrice(item.base_price)}</Text>
          )}
        </View>
        {item.avg_rating > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text style={styles.ratingText}>{parseFloat(item.avg_rating).toFixed(1)} ({item.review_count})</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [userName, setUserName] = useState('');
  const bannerRef = useRef(null);

  useEffect(() => {
    loadData();
    loadUser();
    const timer = setInterval(() => {
      setBannerIdx((i) => (i + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (bannerRef.current) {
      bannerRef.current.scrollTo({ x: bannerIdx * (width - 32), animated: true });
    }
  }, [bannerIdx]);

  const loadUser = async () => {
    try {
      const u = await AsyncStorage.getItem('user');
      if (u) setUserName(JSON.parse(u).first_name);
    } catch {}
  };

  const loadData = async () => {
    try {
      const [f, b] = await Promise.all([
        api.get('/products?featured=true&limit=6'),
        api.get('/products?bestseller=true&limit=6'),
      ]);
      setFeatured(f.data.data || []);
      setBestsellers(b.data.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{userName ? `Hey, ${userName} 👋` : 'Welcome back 👋'}</Text>
            <Text style={styles.headerTitle}>StepUp</Text>
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search-outline" size={22} color={C.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero Banner Carousel */}
        <View style={styles.bannerContainer}>
          <ScrollView
            ref={bannerRef}
            horizontal pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {BANNERS.map((b, idx) => (
              <TouchableOpacity
                key={b.id}
                activeOpacity={0.95}
                onPress={() => navigation.navigate('ShopList')}
                style={{ width: width - 32 }}
              >
                <LinearGradient colors={b.colors} style={styles.banner}>
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerTag}>{b.tag}</Text>
                    <Text style={styles.bannerTitle}>{b.title}</Text>
                    <Text style={styles.bannerSub}>{b.sub}</Text>
                    <View style={styles.bannerBtn}>
                      <Text style={styles.bannerBtnText}>Shop Now</Text>
                      <Ionicons name="arrow-forward" size={14} color="#fff" />
                    </View>
                  </View>
                  <Image source={{ uri: b.img }} style={styles.bannerImage} />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Dots */}
          <View style={styles.dots}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, i === bannerIdx && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.slug}
                style={styles.catChip}
                onPress={() => navigation.navigate('ShopList', { category: cat.slug, title: cat.name })}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={styles.catName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ShopList', { featured: true })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color={C.accent} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={featured}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ProductCard item={item} onPress={() => navigation.navigate('Product', { slug: item.slug })} />
              )}
            />
          )}
        </View>

        {/* Flash Sale Banner */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <LinearGradient colors={['#E34F20', '#c0392b']} style={styles.flashBanner}>
            <View>
              <Text style={styles.flashTitle}>⚡ Flash Sale</Text>
              <Text style={styles.flashSub}>Up to 40% off on selected items</Text>
            </View>
            <TouchableOpacity style={styles.flashBtn} onPress={() => navigation.navigate('ShopList')}>
              <Text style={styles.flashBtnText}>Shop Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Bestsellers */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bestsellers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ShopList', { bestseller: true })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color={C.accent} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={bestsellers}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ProductCard item={item} onPress={() => navigation.navigate('Product', { slug: item.slug })} />
              )}
            />
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  greeting: { fontSize: 12, color: C.gray, letterSpacing: 0.3 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: C.primary, letterSpacing: -0.5 },
  searchBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  bannerContainer: { marginBottom: 8 },
  banner: { height: 180, borderRadius: 16, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  bannerContent: { flex: 1, zIndex: 2 },
  bannerTag: { fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  bannerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', lineHeight: 30, marginBottom: 4 },
  bannerSub: { fontSize: 14, color: '#E34F20', fontWeight: '700', marginBottom: 14 },
  bannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
  bannerBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bannerImage: { width: 130, height: 160, resizeMode: 'cover', position: 'absolute', right: 0, bottom: 0, opacity: 0.85 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotActive: { width: 20, backgroundColor: C.accent },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: C.primary, letterSpacing: -0.3 },
  seeAll: { fontSize: 13, color: C.accent, fontWeight: '600' },
  catChip: { alignItems: 'center', backgroundColor: C.white, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, minWidth: 70, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  catIcon: { fontSize: 22, marginBottom: 4 },
  catName: { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 0.2 },
  productCard: { width: 160, backgroundColor: C.white, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  productImageWrap: { width: '100%', height: 160, backgroundColor: C.light },
  productImage: { width: '100%', height: '100%' },
  discountBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: C.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  discountText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  productInfo: { padding: 10 },
  productBrand: { fontSize: 10, color: C.gray, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  productName: { fontSize: 13, fontWeight: '700', color: C.primary, lineHeight: 18, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  salePrice: { fontSize: 14, fontWeight: '800', color: C.primary },
  basePrice: { fontSize: 11, color: C.gray, textDecorationLine: 'line-through' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingText: { fontSize: 11, color: C.gray },
  flashBanner: { borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flashTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  flashSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  flashBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  flashBtnText: { color: C.accent, fontWeight: '800', fontSize: 12 },
});
