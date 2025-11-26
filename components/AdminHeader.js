// ============================================
// components/AdminHeader.js
// ============================================
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Notification from './Notification';

export default function AdminHeader({ title, subtitle, navigation, rightButtons }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <Ionicons name="restaurant" size={28} color="#FF6B35"  />
          <Text style={styles.logoText}>RestoOnline</Text>
        </View>

        <View style={styles.headerIcons}>
          {/* Notification Component */}
          <Notification />
          {/* Optional right-side buttons (passed by parent) */}
          {rightButtons}
        </View>
      </View>

      {/* Title Section */}
      {title && (
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
    marginLeft: 8,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleSection: {
    marginTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
  },
  subtitle: {
    fontSize: 14,
    color: '#ADB5BD',
    marginTop: 2,
  },
});
