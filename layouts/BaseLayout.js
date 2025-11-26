// Layout.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Layout = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Header />

      {/* Contenu principal */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Footer */}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
});

export default Layout;
