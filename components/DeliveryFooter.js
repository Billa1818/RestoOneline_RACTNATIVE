// ============================================
// components/DeliveryFooter.js - Footer pour Livreur (CORRIGÉ)
// ============================================
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DeliveryFooter({ state, descriptors, navigation }) {
  const routes = [
    { name: 'DeliveryDash', label: 'Livraisons', icon: 'bicycle' },
    { name: 'History', label: 'Historique', icon: 'time' },
    { name: 'DeliverySettings', label: 'Paramètres', icon: 'settings' },
  ];

  // Obtenir le nom de la route actuelle
  const currentRouteName = state.routes[state.index]?.name;

  // Déterminer quel tab est actif
  const getActiveIndex = () => {
    // Si on est sur DeliveryHistoryDetails, considérer que History est actif
    if (currentRouteName === 'DeliveryHistoryDetails') {
      return 1; // Index de DeliveryHistory
    }
    
    // Sinon, trouver l'index correspondant dans les routes du footer
    return routes.findIndex(route => route.name === currentRouteName);
  };

  const activeIndex = getActiveIndex();

  return (
    <View style={styles.footer}>
      {routes.map((route, index) => {
        const isFocused = activeIndex === index;
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.name,
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