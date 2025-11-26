// ============================================
// screens/Settings.js - Page Paramètres (CORRIGÉ)
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { List, Switch, Divider, Dialog, Portal, RadioButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';

export default function Settings({ navigation }) {
  const { isLoggedIn, currentUser, logout } = useAuth();
  const { cartCount, favoritesCount } = useCart();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('fr');
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotifications(parsed.notifications ?? true);
        setDarkMode(parsed.darkMode ?? false);
        setLanguage(parsed.language ?? 'fr');
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      const parsed = settings ? JSON.parse(settings) : {};
      parsed[key] = value;
      await AsyncStorage.setItem('settings', JSON.stringify(parsed));
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
    }
  };

  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    saveSettings('notifications', newValue);
  };

  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    saveSettings('darkMode', newValue);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    saveSettings('language', lang);
    setLanguageDialogVisible(false);
  };

  const clearCache = async () => {
    Alert.alert(
      'Effacer le cache',
      'Êtes-vous sûr de vouloir effacer le cache ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('cache');
              Alert.alert('Succès', 'Cache effacé avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'effacer le cache');
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#E91E63';
      case 'gestionnaire':
        return '#2196F3';
      case 'livreur':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return 'shield-checkmark';
      case 'gestionnaire':
        return 'clipboard-list';
      case 'livreur':
        return 'bicycle';
      default:
        return 'person';
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => {
            logout();
            // Redirection vers Home
            navigation.navigate("home");


          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        cartCount={cartCount}
        favoritesCount={favoritesCount}
        navigation={navigation}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Section Utilisateur */}
        {isLoggedIn && currentUser ? (
          <View style={styles.userSection}>
            <View style={[styles.userCard, { borderLeftColor: getRoleColor(currentUser.role) }]}>
              <View style={[styles.avatarContainer, { backgroundColor: getRoleColor(currentUser.role) + '20' }]}>
                <Ionicons
                  name={getRoleIcon(currentUser.role)}
                  size={40}
                  color={getRoleColor(currentUser.role)}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{currentUser.name}</Text>
                <View style={styles.roleTag}>
                  <Text style={[styles.roleText, { color: getRoleColor(currentUser.role) }]}>
                    {currentUser.role.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.userEmail}>{currentUser.email}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#E91E63" />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noUserSection}>
            <View style={styles.noUserCard}>
              <Ionicons name="log-in-outline" size={40} color="#FF6B35" />
              <Text style={styles.noUserTitle}>Non connecté</Text>
              <Text style={styles.noUserSubtitle}>
                Vous êtes actuellement en tant que client
              </Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Ionicons name="log-in-outline" size={18} color="#fff" />
                <Text style={styles.loginButtonText}>Se connecter (Professionnel)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Divider style={styles.sectionDivider} />

        {/* Préférences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>

          <List.Item
            title="Notifications"
            description="Recevoir des notifications push"
            left={(props) => <List.Icon {...props} icon="bell" color="#FF6B35" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={handleNotificationsToggle}
                color="#FF6B35"
              />
            )}
          />

          <Divider />

          <List.Item
            title="Mode sombre"
            description="Activer le thème sombre"
            left={(props) => <List.Icon {...props} icon="weather-night" color="#FF6B35" />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={handleDarkModeToggle}
                color="#FF6B35"
              />
            )}
          />

          <Divider />

          <List.Item
            title="Langue"
            description={language === 'fr' ? 'Français' : 'English'}
            left={(props) => <List.Icon {...props} icon="translate" color="#FF6B35" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setLanguageDialogVisible(true)}
          />
        </View>

        {/* Application */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>

          <List.Item
            title="Effacer le cache"
            description="Libérer de l'espace"
            left={(props) => <List.Icon {...props} icon="delete" color="#FF6B35" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={clearCache}
          />

          <Divider />

          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" color="#FF6B35" />}
          />
        </View>

        {/* Légal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Légal</Text>

          <List.Item
            title="Conditions d'utilisation"
            left={(props) => <List.Icon {...props} icon="file-document" color="#FF6B35" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Termes', 'Page des conditions à venir')}
          />

          <Divider />

          <List.Item
            title="Politique de confidentialité"
            left={(props) => <List.Icon {...props} icon="shield-check" color="#FF6B35" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Confidentialité', 'Page de confidentialité à venir')}
          />

          <Divider />

          <List.Item
            title="À propos"
            left={(props) => <List.Icon {...props} icon="information-outline" color="#FF6B35" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('À propos', 'RestoOneline v1.0.0\n© 2024')}
          />
        </View>
      </ScrollView>

      {/* Language Dialog */}
      <Portal>
        <Dialog
          visible={languageDialogVisible}
          onDismiss={() => setLanguageDialogVisible(false)}
        >
          <Dialog.Title>Choisir la langue</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={handleLanguageChange}
              value={language}
            >
              <RadioButton.Item label="Français" value="fr" />
              <RadioButton.Item label="English" value="en" />
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  userSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 12,
    color: '#868E96',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFE5ED',
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E91E63',
    marginLeft: 8,
  },
  noUserSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  noUserCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noUserTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 4,
  },
  noUserSubtitle: {
    fontSize: 13,
    color: '#868E96',
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  sectionDivider: {
    marginVertical: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#868E96',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
});