import React, { useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { formatPrice } from '../utils/format';

const { width } = Dimensions.get('window');
const CARD = (width - 48) / 2;
const C = { bg: '#0D0D0D', card: '#1A1A1A', card2: '#222', border: '#2A2A2A', accent: '#E34F20', white: '#fff', gray: '#9CA3AF', dim: '#6B7280' };
const TRENDING = ['Running Shoes', 'Heels', 'Sneakers', 'Football Boots', 'Sandals', 'Kids Shoes', 'Casual'];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef(null);

  const search = async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(true);
    try {
      const res = await api.get(`/products?search=${encodeURIComponent(q)}&limit=20`);
      setResults(res.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const onChangeText = (text) => {
    setQuery(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => search(text), 500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View style={styles.searchRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={C.dim} />
          <TextInput
            autoFocus style={styles.input}
            placeholder="Search sneakers, boots, runners…"
            placeholderTextColor={C.dim}
            value={query} onChangeText={onChangeText}
            returnKeyType="search"
            onSubmitEditing={() => search(query)}
          />
          {query ? (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={16} color={C.dim} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {!searched ? (
        <View style={{ padding: 20 }}>
          <Text style={styles.trendingTitle}>TRENDING SEARCHES</Text>
          <View style={styles.tags}>
            {TRENDING.map(t => (
              <TouchableOpacity key={t} style={styles.tag} onPress={() => { setQuery(t); search(t); }}>
                <Ionicons name="trending-up-outline" size={12} color={C.accent} />
                <Text style={styles.tagText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : loading ? (
        <ActivityIndicator size="large" color={C.accent} style={{ marginTop: 60 }} />
      ) : results.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 50, marginBottom: 16 }}>🔍</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: C.white, marginBottom: 8 }}>No results for "{query}"</Text>
          <Text style={{ color: C.dim, textAlign: 'center' }}>Try a different keyword</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          columnWrapperStyle={{ gap: 16 }}
          ListHeaderComponent={<Text style={styles.resultCount}>{results.length} results for "{query}"</Text>}
          renderItem={({ item }) => {
            const discount = item.sale_price
              ? Math.round(((parseFloat(item.base_price) - parseFloat(item.sale_price)) / parseFloat(item.base_price)) * 100)
              : null;
            return (
              <TouchableOpacity
                style={[styles.card, { width: CARD }]}
                onPress={() => navigation.navigate('Product', { slug: item.slug })}
                activeOpacity={0.9}
              >
                <View style={{ height: CARD, position: 'relative' }}>
                  <Image source={{ uri: item.primary_image }} style={styles.cardImg} />
                  {discount && <View style={styles.badge}><Text style={styles.badgeText}>-{discount}%</Text></View>}
                </View>
                <View style={{ padding: 10 }}>
                  <Text style={styles.cardBrand}>{(item.brand || 'StepUp').toUpperCase()}</Text>
                  <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.cardPrice}>{formatPrice(item.sale_price || item.base_price)}</Text>
                    {item.sale_price && <Text style={styles.cardOld}>{formatPrice(item.base_price)}</Text>}
                  </View>
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
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 14, gap: 8, height: 44, borderWidth: 1, borderColor: '#2A2A2A' },
  input: { flex: 1, fontSize: 14, color: '#fff' },
  trendingTitle: { fontSize: 10, fontWeight: '900', color: '#6B7280', letterSpacing: 2, marginBottom: 14 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1A1A1A', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: '#2A2A2A' },
  tagText: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  resultCount: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  card: { backgroundColor: '#1A1A1A', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' },
  cardImg: { width: '100%', height: '100%', backgroundColor: '#222' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#E34F20', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 },
  badgeText: { fontSize: 8, fontWeight: '900', color: '#fff' },
  cardBrand: { fontSize: 8, color: '#6B7280', letterSpacing: 1, marginBottom: 2 },
  cardName: { fontSize: 11, fontWeight: '700', color: '#fff', lineHeight: 16, marginBottom: 5 },
  cardPrice: { fontSize: 14, fontWeight: '900', color: '#fff' },
  cardOld: { fontSize: 10, color: '#6B7280', textDecorationLine: 'line-through' },
});
