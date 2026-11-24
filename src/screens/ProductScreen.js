import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const C = {
  bg: '#F8F8F8', white: '#fff', primary: '#111', accent: '#E34F20',
  gray: '#6B7280', light: '#F3F3F3', border: '#EBEBEB',
};

export default function ProductScreen({ navigation, route }) {
  const { slug } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

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
  const sizesForColor = product
    ? product.variants?.filter(v => v.color === selectedColor) || []
    : [];

  const selectColor = (color) => {
    setSelectedColor(color);
    const v = product.variants.find(v => v.color === color);
    setSelectedVariant(v);
  };

  const selectSize = (variant) => setSelectedVariant(variant);

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
      await api.post('/cart/items', {
        product_id: product.id,
        variant_id: selectedVariant.id,
        quantity: 1,
      });
      Toast.show({ type: 'success', text1: 'Added to cart! 🛍️', text2: `${product.name} · Size ${selectedVariant.size}` });
    } catch (e) {
      Toast.show({ type: 'error', text1: e.response?.data?.message || 'Failed to add' });
    } finally { setAddingToCart(false); }
  };

  const toggleWishlist = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) { navigation.navigate('Profile'); return; }
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${product.id}`);
      } else {
        await api.post('/wishlist', { product_id: product.id });
      }
      setWishlisted(!wishlisted);
      Toast.show({ type: 'success', text1: wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️' });
    } catch {}
  };

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
      <ActivityIndicator size="large" color={C.accent} />
    </View>
  );
  if (!product) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: C.gray }}>Product not found</Text>
    </View>
  );

  const images = product.images?.length
    ? product.images.map(i => i.url)
    : product.primary_image ? [product.primary_image] : [];

  const discount = product.sale_price
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      {/* Back + wishlist */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={C.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={toggleWishlist}>
          <Ionicons name={wishlisted ? 'heart' : 'heart-outline'} size={22} color={wishlisted ? '#EF4444' : C.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Image */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: images[imgIdx] || 'https://via.placeholder.com/400' }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {images.length > 1 && (
            <View style={styles.imageDots}>
              {images.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setImgIdx(i)}>
                  <View style={[styles.imgDot, i === imgIdx && styles.imgDotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {discount && (
            <View style={styles.discountTag}>
              <Text style={styles.discountTagText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Product info */}
          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>{product.brand || 'StepUp'} · {product.category_name}</Text>
              <Text style={styles.name}>{product.name}</Text>
            </View>
          </View>

          {/* Rating */}
          {product.avg_rating > 0 && (
            <View style={styles.ratingRow}>
              {[1,2,3,4,5].map(i => (
                <Ionicons key={i} name={i <= Math.round(product.avg_rating) ? 'star' : 'star-outline'} size={14} color="#F59E0B" />
              ))}
              <Text style={styles.ratingText}>{parseFloat(product.avg_rating).toFixed(1)} ({product.review_count} reviews)</Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.sale_price || product.base_price)}</Text>
            {product.sale_price && <Text style={styles.oldPrice}>{formatPrice(product.base_price)}</Text>}
          </View>

          {/* Color picker */}
          {colors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Color: <Text style={{ fontWeight: '800' }}>{selectedColor}</Text></Text>
              <View style={styles.colorRow}>
                {colors.map((color) => {
                  const v = product.variants.find(v => v.color === color);
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorBtn, selectedColor === color && styles.colorBtnActive]}
                      onPress={() => selectColor(color)}
                    >
                      <View style={[styles.colorDot, { backgroundColor: v?.color_hex || '#ccc' }]} />
                      <Text style={[styles.colorLabel, selectedColor === color && { color: C.primary }]}>{color}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Size picker */}
          {sizesForColor.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Size</Text>
              <View style={styles.sizeRow}>
                {sizesForColor.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.sizeBtn,
                      selectedVariant?.id === v.id && styles.sizeBtnActive,
                      v.stock_qty < 1 && styles.sizeBtnOut,
                    ]}
                    onPress={() => v.stock_qty > 0 && selectSize(v)}
                    disabled={v.stock_qty < 1}
                  >
                    <Text style={[
                      styles.sizeText,
                      selectedVariant?.id === v.id && styles.sizeTextActive,
                      v.stock_qty < 1 && { color: '#D1D5DB' },
                    ]}>{v.size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedVariant && (
                <Text style={styles.stockText}>
                  {selectedVariant.stock_qty > 10
                    ? '✓ In Stock'
                    : selectedVariant.stock_qty > 0
                    ? `⚡ Only ${selectedVariant.stock_qty} left!`
                    : '✗ Out of Stock'}
                </Text>
              )}
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Material */}
          {product.material && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Material</Text>
              <Text style={styles.description}>{product.material}</Text>
            </View>
          )}

          {/* Features */}
          <View style={styles.features}>
            {[
              { icon: 'car-outline', label: 'Free delivery above ₹599' },
              { icon: 'refresh-outline', label: '30-day easy returns' },
              { icon: 'shield-checkmark-outline', label: '100% genuine product' },
            ].map(({ icon, label }) => (
              <View key={label} style={styles.featureItem}>
                <Ionicons name={icon} size={18} color={C.accent} />
                <Text style={styles.featureText}>{label}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Add to cart */}
      <View style={styles.cartBar}>
        <TouchableOpacity style={styles.addToCartBtn} onPress={addToCart} disabled={addingToCart}>
          {addingToCart
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name="bag-add-outline" size={20} color="#fff" />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyNowBtn}
          onPress={async () => {
            await addToCart();
            navigation.navigate('Cart');
          }}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  imageSection: { width, height: width * 0.9, backgroundColor: C.white, position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  imageDots: { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  imgDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.2)' },
  imgDotActive: { width: 20, backgroundColor: C.accent },
  discountTag: { position: 'absolute', top: 16, right: 16, backgroundColor: C.accent, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  discountTagText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  content: { backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, paddingHorizontal: 20, paddingTop: 24 },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  brand: { fontSize: 11, color: C.gray, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  name: { fontSize: 22, fontWeight: '800', color: C.primary, lineHeight: 28 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  ratingText: { fontSize: 12, color: C.gray, marginLeft: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  price: { fontSize: 26, fontWeight: '800', color: C.primary },
  oldPrice: { fontSize: 16, color: C.gray, textDecorationLine: 'line-through' },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: C.gray, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white },
  colorBtnActive: { borderColor: C.primary, backgroundColor: C.light },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  colorLabel: { fontSize: 12, fontWeight: '600', color: C.gray },
  sizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sizeBtn: { width: 52, height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  sizeBtnActive: { borderColor: C.primary, backgroundColor: C.primary },
  sizeBtnOut: { borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  sizeText: { fontSize: 13, fontWeight: '700', color: C.primary },
  sizeTextActive: { color: C.white },
  stockText: { fontSize: 12, color: C.accent, marginTop: 8, fontWeight: '600' },
  description: { fontSize: 14, color: C.gray, lineHeight: 22 },
  features: { gap: 10, marginBottom: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.white, padding: 14, borderRadius: 12 },
  featureText: { fontSize: 13, color: C.primary, fontWeight: '500' },
  cartBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: 16, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border },
  addToCartBtn: { flex: 1, backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addToCartText: { color: C.white, fontSize: 15, fontWeight: '800' },
  buyNowBtn: { flex: 1, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  buyNowText: { color: C.white, fontSize: 15, fontWeight: '800' },
});
