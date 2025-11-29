// Settings.js - Page Paramètres avec basculement Client/Livreur
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { List, Switch, Divider, Dialog, Portal, RadioButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export default function Settings({ navigation }) {
  const { 
    user, 
    device, 
    isAuthenticated, 
    userType, 
    isClient, 
    isDelivery,
    logout,
    refreshDeliveryProfile,
    updateClientInfo,
  } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('fr');
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    loadSettings();
    if (isDelivery) {
      loadDeliveryProfile();
    } else if (isClient) {
      loadClientProfile();
    }
  }, [userType]);

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

  const loadDeliveryProfile = async () => {
    if (!user) return;
    setProfileData({
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      phone: user.phone,
      username: user.username,
      type: 'delivery',
      status: user.is_available ? 'Disponible' : 'Indisponible',
      totalDeliveries: user.total_deliveries || 0,
      rating: user.average_rating || '0.00',
    });
  };

  const loadClientProfile = async () => {
    if (!device) return;
    setProfileData({
      name: device.customer_name || 'User',
      phone: device.customer_phone || '',
      email: device.customer_email || '',
      deviceName: device.device_name || 'Mon appareil',
      type: 'client',
      orderCount: device.order_count || 0,
    });
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
    Alert.alert('Mode sombre', 'Cette fonctionnalité sera disponible prochainement');
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    saveSettings('language', lang);
    setLanguageDialogVisible(false);
    Alert.alert('Langue', 'Cette fonctionnalité sera disponible prochainement');
  };

  const handleEditProfile = () => {
    if (isDelivery) {
      Alert.alert(
        'Profil livreur',
        'Contactez votre responsable pour modifier vos informations',
        [{ text: 'OK' }]
      );
    } else if (isClient) {
      navigation.navigate('EditClientProfile');
    }
  };

  const handleViewStatistics = () => {
    if (isDelivery && user) {
      navigation.navigate('DeliveryStatistics');
    }
  };

  const handleViewOrderHistory = () => {
    if (isClient) {
      navigation.navigate('OrderHistory');
    }
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
              Alert.alert(' Succès', 'Cache effacé avec succès');
            } catch (error) {
              Alert.alert(' Erreur', 'Impossible d\'effacer le cache');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      isDelivery 
        ? 'Vous serez reconnecté automatiquement en tant que client.' 
        : 'Cela réinitialisera vos informations client. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Le logout gère automatiquement le retour en mode client
            // Pas de navigation nécessaire
          },
        },
      ]
    );
  };

  const handleRefreshProfile = async () => {
    if (!isDelivery) return;
    
    setLoading(true);
    try {
      const result = await refreshDeliveryProfile();
      if (result.success) {
        loadDeliveryProfile();
        Alert.alert(' Succès', 'Profil mis à jour');
      } else {
        Alert.alert(' Erreur', result.error || 'Erreur de mise à jour');
      }
    } catch (error) {
      Alert.alert(' Erreur', 'Impossible de rafraîchir le profil');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Naviguer vers la page de connexion livreur
   */
  const handleGoToDeliveryLogin = () => {
    Alert.alert(
      'Espace Livreur',
      'Vous allez accéder à la connexion livreur. Vos données client seront conservées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          onPress: () => navigation.navigate('Login'),
        },
      ]
    );
  };

  // Render Profile Card selon le type d'utilisateur
  const renderProfileCard = () => {
    if (!profileData) return null;

    if (isDelivery) {
      return (
        <View style={styles.userSection}>
          <View style={[styles.userCard, { borderLeftColor: '#FF9800' }]}>
            <View style={[styles.avatarContainer, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="bicycle" size={40} color="#FF9800" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{profileData.name}</Text>
              <View style={[styles.roleTag, { backgroundColor: '#FFF3E0' }]}>
                <Text style={[styles.roleText, { color: '#FF9800' }]}>LIVREUR</Text>
              </View>
              <Text style={styles.userEmail}>{profileData.email}</Text>
              <Text style={styles.userPhone}>{profileData.phone}</Text>
            </View>
            <TouchableOpacity onPress={handleRefreshProfile} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FF9800" size="small" />
              ) : (
                <Ionicons name="refresh" size={24} color="#FF9800" />
              )}
            </TouchableOpacity>
          </View>

          {/* Stats Livreur */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{profileData.totalDeliveries}</Text>
              <Text style={styles.statLabel}>Livraisons</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color="#FFB300" />
              <Text style={styles.statValue}>{profileData.rating}</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons 
                name={user?.is_available ? "checkmark-done-circle" : "close-circle"} 
                size={24} 
                color={user?.is_available ? "#4CAF50" : "#F44336"} 
              />
              <Text style={[
                styles.statValue, 
                { color: user?.is_available ? "#4CAF50" : "#F44336" }
              ]}>
                {profileData.status}
              </Text>
              <Text style={styles.statLabel}>Statut</Text>
            </View>
          </View>

          {/* Actions Livreur */}
          <TouchableOpacity style={styles.actionButton} onPress={handleViewStatistics}>
            <Ionicons name="stats-chart" size={20} color="#5D0EC0" />
            <Text style={styles.actionButtonText}>Voir mes statistiques</Text>
            <Ionicons name="chevron-forward" size={20} color="#5D0EC0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#E91E63" />
            <Text style={styles.logoutText}>Retour au mode Client</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (isClient) {
      return (
        <View style={styles.userSection}>
          <View style={[styles.userCard, { borderLeftColor: '#5D0EC0' }]}>
            <View style={[styles.avatarContainer, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="person" size={40} color="#5D0EC0" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{profileData.name}</Text>
              <View style={[styles.roleTag, { backgroundColor: '#F3E5F5' }]}>
                <Text style={[styles.roleText, { color: '#5D0EC0' }]}>CLIENT</Text>
              </View>
              <Text style={styles.userEmail}>{profileData.email}</Text>
              <Text style={styles.userPhone}>{profileData.phone}</Text>
            </View>
          </View>

          {/* Stats Client */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { flex: 1 }]}>
              <Ionicons name="receipt" size={24} color="#2196F3" />
              <Text style={styles.statValue}>{profileData.orderCount}</Text>
              <Text style={styles.statLabel}>Commandes</Text>
            </View>
            <View style={[styles.statCard, { flex: 1 }]}>
              <Ionicons name="phone-portrait" size={24} color="#9C27B0" />
              <Text style={styles.statValue} numberOfLines={1}>
                {profileData.deviceName}
              </Text>
              <Text style={styles.statLabel}>Appareil</Text>
            </View>
          </View>

          {/* Actions Client */}
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <Ionicons name="person-circle" size={20} color="#5D0EC0" />
            <Text style={styles.actionButtonText}>Modifier mes informations</Text>
            <Ionicons name="chevron-forward" size={20} color="#5D0EC0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleViewOrderHistory}>
            <Ionicons name="time" size={20} color="#5D0EC0" />
            <Text style={styles.actionButtonText}>Historique des commandes</Text>
            <Ionicons name="chevron-forward" size={20} color="#5D0EC0" />
          </TouchableOpacity>

          {/* NOUVEAU: Bouton pour accéder au compte livreur */}
          <View style={styles.deliveryAccessSection}>
            <View style={styles.deliveryAccessCard}>
              <View style={styles.deliveryAccessHeader}>
                <Ionicons name="bicycle" size={24} color="#FF9800" />
                <Text style={styles.deliveryAccessTitle}>Vous êtes livreur ?</Text>
              </View>
              <Text style={styles.deliveryAccessSubtitle}>
                Accédez à votre espace professionnel pour gérer vos livraisons
              </Text>
              <TouchableOpacity 
                style={styles.deliveryAccessButton} 
                onPress={handleGoToDeliveryLogin}
              >
                <Ionicons name="log-in" size={18} color="#FFF" />
                <Text style={styles.deliveryAccessButtonText}>Connexion Livreur</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return null;
  };

  // Render Login Prompt pour utilisateur non connecté
  const renderLoginPrompt = () => {
    return (
      <View style={styles.noUserSection}>
        <View style={styles.noUserCard}>
          <Ionicons name="log-in-outline" size={50} color="#5D0EC0" />
          <Text style={styles.noUserTitle}>Espace Professionnel</Text>
          <Text style={styles.noUserSubtitle}>
            Connectez-vous en tant que livreur pour accéder à vos fonctionnalités
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="bicycle" size={18} color="#fff" />
            <Text style={styles.loginButtonText}>Connexion Livreur</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header navigation={navigation} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Section Profil */}
        {isAuthenticated ? renderProfileCard() : renderLoginPrompt()}

        <Divider style={styles.sectionDivider} />

        {/* Préférences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>

          <List.Item
            title="Notifications"
            description="Recevoir des notifications push"
            left={(props) => <List.Icon {...props} icon="bell" color="#5D0EC0" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={handleNotificationsToggle}
                color="#5D0EC0"
              />
            )}
          />

          <Divider />

          <List.Item
            title="Mode sombre"
            description="Activer le thème sombre"
            left={(props) => <List.Icon {...props} icon="weather-night" color="#5D0EC0" />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={handleDarkModeToggle}
                color="#5D0EC0"
              />
            )}
          />

          <Divider />

          <List.Item
            title="Langue"
            description={language === 'fr' ? 'Français' : 'English'}
            left={(props) => <List.Icon {...props} icon="translate" color="#5D0EC0" />}
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
            left={(props) => <List.Icon {...props} icon="delete" color="#5D0EC0" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={clearCache}
          />

          <Divider />

          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" color="#5D0EC0" />}
          />
        </View>

        {/* Légal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Légal</Text>

          <List.Item
            title="Conditions d'utilisation"
            left={(props) => <List.Icon {...props} icon="file-document" color="#5D0EC0" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Termes', 'Page des conditions à venir')}
          />

          <Divider />

          <List.Item
            title="Politique de confidentialité"
            left={(props) => <List.Icon {...props} icon="shield-check" color="#5D0EC0" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Confidentialité', 'Page de confidentialité à venir')}
          />

          <Divider />

          <List.Item
            title="À propos"
            left={(props) => <List.Icon {...props} icon="information-outline" color="#5D0EC0" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('À propos', 'RestoOnline v1.0.0\n© 2024')}
          />
        </View>

        <View style={{ height: 40 }} />
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
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#868E96',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#868E96',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFE5ED',
    borderRadius: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E91E63',
    marginLeft: 8,
  },
  // NOUVEAUX STYLES pour la section d'accès livreur
  deliveryAccessSection: {
    marginTop: 16,
  },
  deliveryAccessCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD54F',
    borderStyle: 'dashed',
  },
  deliveryAccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryAccessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginLeft: 8,
  },
  deliveryAccessSubtitle: {
    fontSize: 13,
    color: '#E65100',
    marginBottom: 16,
    lineHeight: 18,
  },
  deliveryAccessButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  deliveryAccessButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  noUserSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  noUserCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noUserTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noUserSubtitle: {
    fontSize: 14,
    color: '#868E96',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#5D0EC0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 15,
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