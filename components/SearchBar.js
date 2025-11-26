
// ============================================
// components/SearchBar.js
// ============================================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export default function SearchBarComponent({ searchQuery, onChangeSearch }) {
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Rechercher un plat..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
        iconColor="#FF6B35"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
});

