import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Dimensions, FlatList, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const C = { bg: '#0D0D0D', card: '#1A1A1A', card2: '#222', border: '#2A2A2A', accent: '#E34F20', white: '#fff', gray: '#9CA3AF', dim: '#6B7280' };

const CATEGORIES = [
  { label: 'All', value: '', icon: '👟' },
  { label: "Men's", value: 'mens', icon: '👞' },
  { label: "Women's", value: 'womens', icon: '👠' },
  { label: 'Sports', value: 'sports', icon: '⚽' },
  { label: "Kids'", value: 'kids', icon: '👶' },
  { label: 'Casual', value: 'casual', icon: '🥿' },
  { label: 'Formal', value: 'formal', icon: '👔' },
  { label: 'Sandals', value: 'sandals', icon: '🩴' },
];

function ProductCard({ item, onPress }) {
  const discount = item.sale_price
    ? Math.round(((parseFloat(item.base_price) - parseFloat(item.sale_price)) / parseFloat(item.base_price)) * 100)
    : null;
  return (
    <TouchableOpacity style={styles.pCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.pImgWrap}>
        <Image source={{ uri: item.primary_image }} style={styles.pImg} resizeMode="cover" />
        {discount && (
          <View style={styles.discBadge}><Text style={styles.discText}>-{discount}%</Text></View>
        )}
        {item.is_new_arrival && !discount && (
          <View style={[styles.discBadge, { backgroundColor: '#3B82F6' }]}><Text style={styles.discText}>NEW</Text></View>
        )}
        <TouchableOpacity style={styles.heartBtn}>
          <Ionicons name="heart-outline" size={14} color={C.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.pInfo}>
        <Text style={styles.pBrand}>{item.brand || 'StepUp'}</Text>
        <Text style={styles.pName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.pBottom}>
          <View>
            <Text style={styles.pPrice}>{formatPrice(item.sale_price || item.base_price)}</Text>
            {item.sale_price && <Text style={styles.pOld}>{formatPrice(item.base_price)}</Text>}
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={onPress}>
            <Ionicons name="add" size={16} color={C.white} />
          </TouchableOpacity>
        </View>
        {item.avg_rating > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text style={styles.ratingTxt}>{parseFloat(item.avg_rating).toFixed(1)} ({item.review_count})</Text>
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
  const [activeCategory, setActiveCategory] = useState('');
  const [userName, setUserName] = useState('');
  const [bannerIdx, setBannerIdx] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadData();
    AsyncStorage.getItem('user').then(u => { if (u) setUserName(JSON.parse(u).first_name); });
    const t = setInterval(() => setBannerIdx(i => (i + 1) % 2), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: bannerIdx * (width - 32), animated: true });
  }, [bannerIdx]);

  const loadData = async () => {
    try {
      const [f, b] = await Promise.all([
        api.get('/products?featured=true&limit=8'),
        api.get('/products?bestseller=true&limit=6'),
      ]);
      setFeatured(f.data.data || []);
      setBestsellers(b.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoS}>S</Text>
              <Text style={styles.logoU}>u</Text>
            </View>
            <Text style={styles.logoLabel}>STEPUP</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Search')}>
              <Ionicons name="search-outline" size={18} color={C.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={18} color={C.white} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <View style={styles.avatarSmall}>
              <Text style={{ color: C.white, fontSize: 10, fontWeight: '800' }}>{userName?.[0] || 'G'}</Text>
            </View>
          </View>
        </View>

        {/* Search bar */}
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')} activeOpacity={0.8}>
          <Ionicons name="search-outline" size={16} color={C.dim} />
          <Text style={styles.searchPlaceholder}>Search sneakers, boots, runners…</Text>
          <View style={styles.filterIconBtn}>
            <Ionicons name="options-outline" size={14} color={C.white} />
          </View>
        </TouchableOpacity>

        {/* Hero Banner */}
        <View style={{ marginBottom: 8 }}>
          <ScrollView ref={scrollRef} horizontal pagingEnabled={false} showsHorizontalScrollIndicator={false}
            scrollEnabled={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {/* Banner 1 */}
            <TouchableOpacity style={{ width: width - 32 }} onPress={() => navigation.navigate('ShopList')} activeOpacity={0.95}>
              <View style={styles.heroBanner}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format' }}
                  style={styles.heroImg} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.heroGrad}>
                  <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>DROP 03 // LIMITED · 24H RELEASE</Text></View>
                  <Text style={styles.heroTitle}>STEP INTO{'\n'}THE FUTURE</Text>
                  <Text style={styles.heroSub}>Next-gen reactive cushioning with adaptive lockdown lattice.</Text>
                  <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('ShopList')}>
                    <Text style={styles.heroBtnText}>Shop New Drop →</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </TouchableOpacity>
            {/* Banner 2 */}
            <TouchableOpacity style={{ width: width - 32 }} onPress={() => navigation.navigate('ShopList', { category: 'womens' })} activeOpacity={0.95}>
              <View style={styles.heroBanner}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format' }}
                  style={styles.heroImg} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.heroGrad}>
                  <View style={[styles.heroBadge, { backgroundColor: '#3B82F6' }]}><Text style={styles.heroBadgeText}>WOMEN'S COLLECTION</Text></View>
                  <Text style={styles.heroTitle}>CRAFTED{'\n'}FOR MOTION</Text>
                  <Text style={styles.heroSub}>Engineered biomechanics meeting raw streetwear aesthetic.</Text>
                  <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('ShopList', { category: 'womens' })}>
                    <Text style={styles.heroBtnText}>Explore Journey →</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </ScrollView>
          {/* Dots */}
          <View style={styles.dots}>
            {[0, 1].map(i => <View key={i} style={[styles.dot, i === bannerIdx && styles.dotActive]} />)}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>CATEGORIES</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ShopList')}>
              <Text style={styles.seeAll}>View Matrix</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.catChip, activeCategory === cat.value && styles.catChipActive]}
                onPress={() => { setActiveCategory(cat.value); navigation.navigate('ShopList', { category: cat.value, title: cat.label }); }}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={[styles.catLabel, activeCategory === cat.value && styles.catLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Flash Sale */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <LinearGradient colors={[C.accent, '#c0392b']} style={styles.flashCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18 }}>⚡</Text>
              <View>
                <Text style={styles.flashTitle}>FLASH SALE — 40% OFF</Text>
                <Text style={styles.flashSub}>Selected street performance icons and limited summer drops.</Text>
              </View>
            </View>
            <View style={styles.flashRight}>
              <View style={styles.timer}>
                <Text style={styles.timerLabel}>04h 18m 12s</Text>
              </View>
              <TouchableOpacity style={styles.claimBtn} onPress={() => navigation.navigate('ShopList')}>
                <Text style={styles.claimText}>Claim Now</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Trending Drops */}
        <View style={[styles.section, { marginBottom: 24 }]}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionTitle}>TRENDING DROPS</Text>
              <Text style={styles.sectionSub}>Just landed from the design lab</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ShopList')}>
              <Text style={styles.seeAll}>See All (24)</Text>
            </TouchableOpacity>
          </View>
          {loading ? <ActivityIndicator color={C.accent} style={{ padding: 20 }} /> : (
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

        {/* Editorial Banner */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('ShopList')}>
            <View style={styles.editorialBanner}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1556906781-9a414e2a9c86?w=800&auto=format' }}
                style={styles.editorialImg} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.editorialGrad}>
                <Text style={styles.editorialTag}>EDITORIAL</Text>
                <Text style={styles.editorialTitle}>CRAFTED FOR MOTION</Text>
                <Text style={styles.editorialSub}>Engineered biomechanics meeting raw streetwear aesthetic.</Text>
                <View style={styles.editorialBtn}>
                  <Text style={styles.editorialBtnText}>Explore Journal ↗</Text>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bestsellers */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionTitle}>BESTSELLERS</Text>
              <Text style={styles.sectionSub}>Our most loved styles</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ShopList', { bestseller: true })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? <ActivityIndicator color={C.accent} style={{ padding: 20 }} /> : (
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  logoS: { fontSize: 16, fontWeight: '900', color: '#fff' },
  logoU: { fontSize: 11, fontWeight: '700', color: '#fff' },
  logoLabel: { fontSize: 11, fontWeight: '800', color: C.white, letterSpacing: 3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent, borderWidth: 1.5, borderColor: C.bg },
  avatarSmall: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderWidth: 1, borderColor: C.border },
  searchPlaceholder: { flex: 1, fontSize: 13, color: C.dim },
  filterIconBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' },
  heroBanner: { height: 280, borderRadius: 16, overflow: 'hidden', backgroundColor: C.card },
  heroImg: { width: '100%', height: '100%', position: 'absolute' },
  heroGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingTop: 60 },
  heroBadge: { backgroundColor: C.accent, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 8 },
  heroBadgeText: { fontSize: 8, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 32, marginBottom: 6 },
  heroSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 16, marginBottom: 14 },
  heroBtn: { backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, alignSelf: 'flex-start' },
  heroBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10, marginBottom: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.card2 },
  dotActive: { width: 20, backgroundColor: C.accent },
  section: { marginBottom: 8 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: C.white, letterSpacing: 2 },
  sectionSub: { fontSize: 11, color: C.dim, marginTop: 2 },
  seeAll: { fontSize: 11, color: C.accent, fontWeight: '700' },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  catChipActive: { backgroundColor: C.white, borderColor: C.white },
  catIcon: { fontSize: 13 },
  catLabel: { fontSize: 12, fontWeight: '700', color: C.gray },
  catLabelActive: { color: C.bg },
  flashCard: { borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  flashTitle: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  flashSub: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2, lineHeight: 14 },
  flashRight: { alignItems: 'flex-end', gap: 8 },
  timer: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  timerLabel: { fontSize: 11, fontWeight: '800', color: '#fff', fontVariant: ['tabular-nums'] },
  claimBtn: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  claimText: { fontSize: 11, fontWeight: '900', color: C.accent },
  pCard: { width: 155, backgroundColor: C.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  pImgWrap: { width: '100%', height: 155, backgroundColor: C.card2, position: 'relative' },
  pImg: { width: '100%', height: '100%' },
  discBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: C.accent, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  discText: { fontSize: 9, fontWeight: '900', color: '#fff' },
  heartBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  pInfo: { padding: 10 },
  pBrand: { fontSize: 9, color: C.dim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  pName: { fontSize: 12, fontWeight: '700', color: C.white, marginBottom: 8 },
  pBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pPrice: { fontSize: 15, fontWeight: '900', color: C.white },
  pOld: { fontSize: 10, color: C.dim, textDecorationLine: 'line-through' },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  ratingTxt: { fontSize: 10, color: C.dim },
  editorialBanner: { height: 200, borderRadius: 16, overflow: 'hidden' },
  editorialImg: { width: '100%', height: '100%', position: 'absolute' },
  editorialGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  editorialTag: { fontSize: 9, color: C.accent, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  editorialTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 4 },
  editorialSub: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 12, lineHeight: 15 },
  editorialBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  editorialBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
