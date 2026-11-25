import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';

export function Logo() {
  return (
    <View style={styles.logoWrap}>
      <View style={styles.logoBox}>
        <Text style={styles.logoS}>S</Text>
        <Text style={styles.logoU}>u</Text>
      </View>
    </View>
  );
}

export default function Header({ title, onSearch, onNotif, onBack, showBack, right }) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={20} color={C.white} />
          </TouchableOpacity>
        ) : (
          <Logo />
        )}
        {title && <Text style={styles.title}>{title}</Text>}
      </View>
      <View style={styles.right}>
        {onSearch && (
          <TouchableOpacity style={styles.iconBtn} onPress={onSearch}>
            <Ionicons name="search-outline" size={20} color={C.white} />
          </TouchableOpacity>
        )}
        {onNotif && (
          <TouchableOpacity style={styles.iconBtn} onPress={onNotif}>
            <Ionicons name="notifications-outline" size={20} color={C.white} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        )}
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.bg },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logoWrap: { flexDirection: 'row', alignItems: 'center' },
  logoBox: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  logoS: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  logoU: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
  title: { fontSize: 16, fontWeight: '800', color: C.white, letterSpacing: -0.3 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent, borderWidth: 1.5, borderColor: C.bg },
});
