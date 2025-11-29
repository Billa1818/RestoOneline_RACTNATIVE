// Login.js - Écran de connexion avec réinitialisation de mot de passe
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import UserService from '../services/UserService';

export default function Login({ navigation }) {
  const { loginDelivery, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // États pour la modal de réinitialisation
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async () => {
    // Validation des champs
    if (!username.trim()) {
      Alert.alert('Erreur', "Veuillez saisir votre nom d'utilisateur");
      return;
    }

    if (!password.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre mot de passe');
      return;
    }

    if (username.trim().length < 3) {
      Alert.alert('Erreur', "Le nom d'utilisateur doit contenir au moins 3 caractères");
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      // Appel API via le contexte
      const result = await loginDelivery(username.trim(), password);

      if (result.success) {
        // Succès
        Alert.alert(
          '✅ Connexion réussie',
          `Bienvenue ${result.user.first_name} ${result.user.last_name} !`,
          [
            {
              text: 'Continuer',
              onPress: () => {
                // Navigation vers l'app livreur
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'DeliveryApp' }],
                });
              },
            },
          ]
        );
      } else {
        // Erreur de connexion
        let errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
        
        if (result.error) {
          if (result.error.includes('Accès refusé')) {
            errorMessage = 'Accès refusé. Cet espace est réservé aux livreurs.';
          } else if (result.error.includes('connexion')) {
            errorMessage = result.error;
          } else if (result.error.includes('serveur')) {
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
          }
        }

        Alert.alert('❌ Erreur de connexion', errorMessage);
      }
    } catch (error) {
      console.error('Erreur login:', error);
      Alert.alert(
        '❌ Erreur',
        'Une erreur inattendue est survenue. Veuillez réessayer.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setResetModalVisible(true);
    setResetEmail('');
    setResetSent(false);
  };

  const handleResetPassword = async () => {
    // Validation email
    if (!resetEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre adresse email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) {
      Alert.alert('Erreur', 'Veuillez saisir une adresse email valide');
      return;
    }

    setIsResetting(true);

    try {
      const result = await UserService.requestPasswordReset(resetEmail.trim());
      
      setResetSent(true);
      setTimeout(() => {
        setResetModalVisible(false);
        Alert.alert(
          ' Email envoyé',
          'Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation sous peu.',
          [{ text: 'OK' }]
        );
      }, 2000);
    } catch (error) {
      console.error('Erreur reset password:', error);
      Alert.alert(
        ' Erreur',
        'Impossible d\'envoyer l\'email de réinitialisation. Veuillez réessayer.',
      );
    } finally {
      setIsResetting(false);
    }
  };

  const closeResetModal = () => {
    setResetModalVisible(false);
    setResetEmail('');
    setResetSent(false);
  };

  const navigateToClient = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="bicycle" size={60} color="#5D0EC0" />
            </View>
            <Text style={styles.title}>Espace Livreur</Text>
            <Text style={styles.subtitle}>Connectez-vous pour commencer vos livraisons</Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              Connexion sécurisée réservée aux livreurs partenaires
            </Text>
          </View>

          {/* Formulaire de connexion */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Identifiants</Text>

            {/* Username */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#5D0EC0" />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChangeText={setUsername}
                  editable={!isLoading && !authLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                {username.length > 0 && (
                  <TouchableOpacity onPress={() => setUsername('')}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#5D0EC0" />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading && !authLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotButton}
              disabled={isLoading || authLoading}
            >
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton Login */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (isLoading || authLoading) && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading || authLoading}
            activeOpacity={0.8}
          >
            {isLoading || authLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={22} color="#fff" />
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Client Link */}
          <View style={styles.clientSection}>
            <Text style={styles.clientText}>Vous êtes client ?</Text>
            <TouchableOpacity
              style={styles.clientButton}
              onPress={navigateToClient}
              disabled={isLoading || authLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="storefront-outline" size={18} color="#5D0EC0" />
              <Text style={styles.clientButtonText}>Accéder à l'app client</Text>
              <Ionicons name="arrow-forward" size={18} color="#5D0EC0" />
            </TouchableOpacity>
          </View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Ionicons name="information-circle-outline" size={16} color="#999" />
            <Text style={styles.footerText}>
              En vous connectant, vous acceptez nos conditions d'utilisation
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Réinitialisation du mot de passe */}
      <Modal
        visible={resetModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeResetModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header Modal */}
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="key" size={32} color="#5D0EC0" />
                </View>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={closeResetModal}
                  disabled={isResetting}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {!resetSent ? (
                <>
                  {/* Titre */}
                  <Text style={styles.modalTitle}>Réinitialiser le mot de passe</Text>
                  <Text style={styles.modalSubtitle}>
                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                  </Text>

                  {/* Input Email */}
                  <View style={styles.modalInputWrapper}>
                    <Text style={styles.modalInputLabel}>Adresse email</Text>
                    <View style={styles.modalInputContainer}>
                      <Ionicons name="mail-outline" size={20} color="#5D0EC0" />
                      <TextInput
                        style={styles.modalInput}
                        placeholder="exemple@email.com"
                        value={resetEmail}
                        onChangeText={setResetEmail}
                        editable={!isResetting}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={handleResetPassword}
                      />
                    </View>
                  </View>

                  {/* Info Box */}
                  <View style={styles.modalInfoBox}>
                    <Ionicons name="information-circle" size={20} color="#FF9800" />
                    <Text style={styles.modalInfoText}>
                      Assurez-vous d'utiliser l'email associé à votre compte livreur.
                    </Text>
                  </View>

                  {/* Boutons */}
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      isResetting && styles.modalButtonDisabled,
                    ]}
                    onPress={handleResetPassword}
                    disabled={isResetting}
                    activeOpacity={0.8}
                  >
                    {isResetting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="send" size={20} color="#fff" />
                        <Text style={styles.modalButtonText}>Envoyer le lien</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={closeResetModal}
                    disabled={isResetting}
                  >
                    <Text style={styles.modalCancelText}>Annuler</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Écran de confirmation
                <View style={styles.successContainer}>
                  <View style={styles.successIconContainer}>
                    <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                  </View>
                  <Text style={styles.successTitle}>Email envoyé !</Text>
                  <Text style={styles.successText}>
                    Si cette adresse est associée à un compte, vous recevrez un email avec les instructions de réinitialisation.
                  </Text>
                  <Text style={styles.successNote}>
                    Vérifiez également votre dossier spam.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3E5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#5D0EC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    padding: 4,
  },
  forgotText: {
    fontSize: 14,
    color: '#5D0EC0',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#5D0EC0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#5D0EC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  clientSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  clientText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  clientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#5D0EC0',
    gap: 8,
  },
  clientButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5D0EC0',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    flex: 1,
  },

  // Styles Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalInputWrapper: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
  },
  modalInfoBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalInfoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
  modalButton: {
    backgroundColor: '#5D0EC0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalCancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },

  // Styles Success Screen
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  successNote: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});