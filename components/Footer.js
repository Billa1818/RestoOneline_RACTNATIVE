// ============================================
// components/Footer.js - Footer de navigation (CORRIGÉ)
// ============================================
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Footer({ state, descriptors, navigation }) {
  const routes = [
    { name: 'home', label: 'Accueil', icon: 'home' },
    { name: 'search', label: 'Recherche', icon: 'search' },
    { name: 'orders', label: 'Commandes', icon: 'receipt' },
    { name: 'settings', label: 'Paramètres', icon: 'settings' },
  ];

  return (
    <View style={styles.footer}>
      {routes.map((route, index) => {
        const isFocused = state.index === index;
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index].key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.name}
            onPress={onPress}
            style={styles.tab}
          >
            <Ionicons
              name={isFocused ? route.icon : `${route.icon}-outline`}
              size={24}
              color={isFocused ? '#FF6B35' : '#868E96'}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isFocused ? '#FF6B35' : '#868E96' },
              ]}
            >
              {route.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingVertical: 8,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});