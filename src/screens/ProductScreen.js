import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const C = { bg: '#0D0D0D', card: '#1A1A1A', card2: '#222', border: '#2A2A2A', accent: '#E34F20', white: '#fff', gray: '#9CA3AF', dim: '#6B7280' };

const SPECS = [
  { icon: 'flash-outline', title: 'Carbon Fiber Plate Propulsion', desc: 'Full-length dual-density energy rebound' },
  { icon: 'layers-outline', title: 'Breathable Engineered FlyWeave', desc: 'Zonal support with zero-chafing lock-down' },
  { icon: 'car-outline', title: 'Free Express Delivery & 30-Day Trial', desc: 'From top exchange program' },
];

export default function ProductScreen({ navigation, route }) {
  const { slug } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [expandedSpec, setExpandedSpec] = useState(null);

  useEffect(() => { fetchProduct(); }, [slug]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${slug}`);
      const p = res.data.data;
      setProduct(p);
      if (p.variants?.length) {
        setSelectedColor(p.variants[0].color);
        setSelectedVariant(p.variants[0]);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const colors = product ? [...new Set(product.variants?.map(v => v.color))] : [];
  const sizesForColor = product ? (product.variants?.filter(v => v.color === selectedColor) || []) : [];

  const selectColor = (color) => {
    setSelectedColor(color);
    setSelectedVariant(product.variants.find(v => v.color === color));
  };

  const addToCart = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Sign in required', 'Please log in to add items to cart.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Profile') },
      ]);
      return;
    }
    if (!selectedVariant) { Toast.show({ type: 'error', text1: 'Select size and color' }); return; }
    if (selectedVariant.stock_qty < 1) { Toast.show({ type: 'error', text1: 'Out of stock' }); return; }
    setAddingToCart(true);
    try {
      await api.post('/cart/items', { product_id: product.id, variant_id: selectedVariant.id, quantity: 1 });
      Toast.show({ type: 'success', text1: 'Added to bag! 🛍️', text2: `${product.name} · Size ${selectedVariant.size}` });
    } catch (e) {
      Toast.show({ type: 'error', text1: e.response?.data?.message || 'Failed to add' });
    } finally { setAddingToCart(false); }
  };

  const toggleWishlist = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) { navigation.navigate('Profile'); return; }
    try {
      if (wishlisted) await api.delete(`/wishlist/${product.id}`);
      else await api.post('/wishlist', { product_id: product.id });
      setWishlisted(!wishlisted);
      Toast.show({ type: 'success', text1: wishlisted ? 'Removed from wishlist' : 'Saved to wishlist ❤️' });
    } catch {}
  };

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
      <ActivityIndicator size="large" color={C.accent} />
    </View>
  );
  if (!product) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
      <Text style={{ color: C.gray }}>Product not found</Text>
    </View>
  );

  const images = product.images?.length ? product.images.map(i => i.url) : product.primary_image ? [product.primary_image] : [];
  const discount = product.sale_price
    ? Math.round(((parseFloat(product.base_price) - parseFloat(product.sale_price)) / parseFloat(product.base_price)) * 100)
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Product Detail</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="share-outline" size={18} color={C.white} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleWishlist}>
            <Ionicons name={wishlisted ? 'heart' : 'heart-outline'} size={18} color={wishlisted ? C.accent : C.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* Image gallery */}
        <View style={styles.imgContainer}>
          <Image source={{ uri: images[imgIdx] || 'https://via.placeholder.com/400' }} style={styles.mainImg} resizeMode="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent', 'transparent', 'rgba(13,13,13,0.9)']} style={styles.imgGrad} />

          {/* Badges */}
          {product.is_new_arrival && (
            <View style={styles.limitedBadge}><Text style={styles.limitedText}>✦ LIMITED RELEASE 2026</Text></View>
          )}

          {/* Image dots */}
          {images.length > 1 && (
            <View style={styles.imgDots}>
              {images.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setImgIdx(i)}>
                  <View style={[styles.imgDot, i === imgIdx && styles.imgDotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Product name overlay */}
          <View style={styles.imgOverlay}>
            <Text style={styles.imgProductName}>{(product.brand || 'STEPUP').toUpperCase()} // SERIES 04</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>

          {/* Brand + rating row */}
          <View style={styles.brandRow}>
            <Text style={styles.brandTag}>{(product.brand || 'StepUp').toUpperCase()} PERFORMANCE // SERIES 04</Text>
            {product.is_bestseller && <View style={styles.topRatedBadge}><Text style={styles.topRatedText}>⭐ Top Rated</Text></View>}
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          {product.avg_rating > 0 && (
            <View style={styles.ratingRow}>
              {[1,2,3,4,5].map(i => (
                <Ionicons key={i} name="star" size={13} color={i <= Math.round(product.avg_rating) ? '#F59E0B' : C.card2} />
              ))}
              <Text style={styles.ratingText}>{parseFloat(product.avg_rating).toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({product.review_count} verified reviews)</Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.sale_price || product.base_price)}</Text>
            {product.sale_price && <Text style={styles.oldPrice}>{formatPrice(product.base_price)}</Text>}
            {discount && <View style={styles.discountTag}><Text style={styles.discountText}>-{discount}% OFF</Text></View>}
          </View>

          {/* Color picker */}
          {colors.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <Text style={styles.sectionLabel}>Select Color: <Text style={{ color: C.white }}>{selectedColor}</Text></Text>
                <Text style={styles.colorCount}>{colors.length} COLORWAYS</Text>
              </View>
              <View style={styles.colorRow}>
                {colors.map((color) => {
                  const v = product.variants.find(v => v.color === color);
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorSwatch, selectedColor === color && styles.colorSwatchActive]}
                      onPress={() => selectColor(color)}
                    >
                      <View style={[styles.colorDot, { backgroundColor: v?.color_hex || '#888' }]} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Size picker */}
          {sizesForColor.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <Text style={styles.sectionLabel}>Select US Size (Men's)</Text>
                <TouchableOpacity><Text style={styles.guideLink}>↑ Size Guide</Text></TouchableOpacity>
              </View>
              <View style={styles.sizeGrid}>
                {sizesForColor.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.sizeBtn,
                      selectedVariant?.id === v.id && styles.sizeBtnActive,
                      v.stock_qty < 1 && styles.sizeBtnOut,
                    ]}
                    onPress={() => v.stock_qty > 0 && setSelectedVariant(v)}
                    disabled={v.stock_qty < 1}
                  >
                    <Text style={[
                      styles.sizeText,
                      selectedVariant?.id === v.id && styles.sizeTextActive,
                      v.stock_qty < 1 && styles.sizeTextOut,
                    ]}>{v.size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedVariant && selectedVariant.stock_qty > 0 && selectedVariant.stock_qty <= 5 && (
                <Text style={styles.lowStock}>⚡ {selectedVariant.stock_qty} ITEMS LEFT</Text>
              )}
              {selectedVariant && selectedVariant.stock_qty < 1 && (
                <Text style={[styles.lowStock, { color: '#EF4444' }]}>✗ OUT OF STOCK</Text>
              )}
            </View>
          )}

          {/* Specs accordion */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Engineered Specifications</Text>
            {SPECS.map((spec, i) => (
              <TouchableOpacity
                key={i}
                style={styles.specRow}
                onPress={() => setExpandedSpec(expandedSpec === i ? null : i)}
              >
                <View style={styles.specLeft}>
                  <View style={styles.specIcon}><Ionicons name={spec.icon} size={16} color={C.accent} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.specTitle}>{spec.title}</Text>
                    {expandedSpec === i && <Text style={styles.specDesc}>{spec.desc}</Text>}
                  </View>
                </View>
                <Ionicons name={expandedSpec === i ? 'chevron-up' : 'chevron-down'} size={14} color={C.dim} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>About This Product</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addBagBtn} onPress={addToCart} disabled={addingToCart}>
          {addingToCart
            ? <ActivityIndicator color={C.white} size="small" />
            : <>
                <Ionicons name="bag-add-outline" size={18} color={C.white} />
                <Text style={styles.addBagText}>Add to Bag</Text>
              </>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyNowBtn}
          onPress={async () => { await addToCart(); if (!addingToCart) navigation.navigate('Cart'); }}
        >
          <LinearGradient colors={[C.accent, '#c0392b']} style={styles.buyNowGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.buyNowText}>Buy Now · {formatPrice(product.sale_price || product.base_price)}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  topTitle: { fontSize: 13, fontWeight: '700', color: C.white, letterSpacing: 0.5 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' },
  imgContainer: { width, height: width * 0.85, position: 'relative', backgroundColor: C.card },
  mainImg: { width: '100%', height: '100%' },
  imgGrad: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
  limitedBadge: { position: 'absolute', top: 14, left: 14, backgroundColor: C.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  limitedText: { fontSize: 8, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  imgDots: { position: 'absolute', bottom: 14, right: 14, flexDirection: 'row', gap: 5 },
  imgDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  imgDotActive: { width: 20, backgroundColor: C.white },
  imgOverlay: { position: 'absolute', bottom: 14, left: 14 },
  imgProductName: { fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: '700', letterSpacing: 1 },
  content: { backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  brandTag: { fontSize: 9, color: C.dim, fontWeight: '700', letterSpacing: 1.5 },
  topRatedBadge: { backgroundColor: '#1A1A1A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#F59E0B' },
  topRatedText: { fontSize: 10, fontWeight: '700', color: '#F59E0B' },
  productName: { fontSize: 24, fontWeight: '900', color: C.white, lineHeight: 30, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 14 },
  ratingText: { fontSize: 13, fontWeight: '800', color: C.white, marginLeft: 6 },
  reviewCount: { fontSize: 11, color: C.dim },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  price: { fontSize: 32, fontWeight: '900', color: C.white },
  oldPrice: { fontSize: 18, color: C.dim, textDecorationLine: 'line-through' },
  discountTag: { backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  discountText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  section: { marginBottom: 24 },
  sectionLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: C.dim, textTransform: 'uppercase', letterSpacing: 1 },
  colorCount: { fontSize: 9, color: C.dim, letterSpacing: 0.5 },
  guideLink: { fontSize: 11, color: C.accent, fontWeight: '700' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  colorSwatchActive: { borderColor: C.white, borderWidth: 2.5 },
  colorDot: { width: 26, height: 26, borderRadius: 13 },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizeBtn: { width: 52, height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  sizeBtnActive: { borderColor: C.white, backgroundColor: C.white },
  sizeBtnOut: { borderColor: C.card2, backgroundColor: C.card },
  sizeText: { fontSize: 13, fontWeight: '700', color: C.white },
  sizeTextActive: { color: C.bg },
  sizeTextOut: { color: '#3A3A3A' },
  lowStock: { fontSize: 11, color: C.accent, fontWeight: '800', marginTop: 10, letterSpacing: 0.5 },
  specRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  specLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  specIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  specTitle: { fontSize: 13, fontWeight: '700', color: C.white, lineHeight: 18 },
  specDesc: { fontSize: 11, color: C.dim, marginTop: 4, lineHeight: 16 },
  description: { fontSize: 13, color: C.gray, lineHeight: 21 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, padding: 16, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.border },
  addBagBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.card, borderRadius: 14, paddingVertical: 16, flex: 1, borderWidth: 1, borderColor: C.border },
  addBagText: { color: C.white, fontSize: 13, fontWeight: '800' },
  buyNowBtn: { flex: 2, borderRadius: 14, overflow: 'hidden' },
  buyNowGrad: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  buyNowText: { color: C.white, fontSize: 14, fontWeight: '900' },
});
