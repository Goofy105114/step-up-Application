import React, { useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { formatPrice } from '../utils/format';

const { width } = Dimensions.get('window');

const TRENDING = ['Running Shoes', 'Heels', 'Sneakers', 'Football Boots', 'Sandals', 'Kids Shoes'];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef(null);
  const inputRef = useRef(null);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            ref={inputRef} autoFocus style={styles.input}
            placeholder="Search shoes, brands…" placeholderTextColor="#9CA3AF"
            value={query} onChangeText={onChangeText} returnKeyType="search"
            onSubmitEditing={() => search(query)}
          />
          {query ? <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity> : null}
        </View>
      </View>

      {!searched ? (
        <View style={{ padding: 20 }}>
          <Text style={styles.trendingTitle}>Trending Searches</Text>
          <View style={styles.tags}>
            {TRENDING.map(t => (
              <TouchableOpacity key={t} style={styles.tag} onPress={() => { setQuery(t); search(t); }}>
                <Ionicons name="trending-up-outline" size={13} color="#E34F20" />
                <Text style={styles.tagText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : loading ? (
        <ActivityIndicator size="large" color="#E34F20" style={{ marginTop: 60 }} />
      ) : results.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 50, marginBottom: 16 }}>🔍</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 8 }}>No results for "{query}"</Text>
          <Text style={{ color: '#6B7280', textAlign: 'center' }}>Try a different keyword or browse categories</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          columnWrapperStyle={{ gap: 16 }}
          ListHeaderComponent={<Text style={styles.resultCount}>{results.length} results for "{query}"</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { width: (width - 48) / 2 }]}
              onPress={() => navigation.navigate('Product', { slug: item.slug })}
            >
              <Image source={{ uri: item.primary_image }} style={styles.cardImg} />
              <View style={{ padding: 10 }}>
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.cardPrice}>{formatPrice(item.sale_price || item.base_price)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, gap: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, height: 46 },
  input: { flex: 1, fontSize: 15, color: '#111' },
  trendingTitle: { fontSize: 15, fontWeight: '800', color: '#111', marginBottom: 14 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: '#EBEBEB' },
  tagText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  resultCount: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  card: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  cardImg: { width: '100%', height: (width - 48) / 2, backgroundColor: '#F3F3F3' },
  cardName: { fontSize: 12, fontWeight: '700', color: '#111', lineHeight: 17, marginBottom: 4 },
  cardPrice: { fontSize: 14, fontWeight: '800', color: '#111' },
});
