// ============================================
// screens/Login.js
// ============================================
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function Login({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('livreur');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: 'livreur',
      name: 'Livreur',
      icon: 'bicycle',
      description: 'Livraisons',
      credentials: { email: 'livreur@example.com', password: 'livreur123' },
    },
  ];

  const handleQuickLogin = (role) => {
    const credentials = roles.find((r) => r.id === role)?.credentials;
    if (credentials) {
      setEmail(credentials.email);
      setPassword(credentials.password);
      setSelectedRole(role);
    }
  };

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const success = login(email, password, selectedRole);
      setIsLoading(false);

      if (success) {
        Alert.alert('Succès', `Connecté en tant que ${selectedRole}`);
        setTimeout(() => {
          if (selectedRole === 'livreur') {
            navigation.navigate('DeliveryApp');
          }
        }, 500);
      } else {
        Alert.alert('Erreur', 'Email ou mot de passe incorrect');
      }
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="restaurant" size={50} color="#FF6B35" />
          <Text style={styles.title}>RestoOnline</Text>
          <Text style={styles.subtitle}>Espace Professionnel</Text>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Seuls les membres et admins du restaurant peuvent se connecter ici
          </Text>
        </View>

        {/* Sélection du rôle */}
        <Text style={styles.sectionTitle}>Choisir votre rôle</Text>
        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.roleCardSelected,
              ]}
              onPress={() => {
                setSelectedRole(role.id);
                handleQuickLogin(role.id);
              }}
            >
              <Ionicons
                name={role.icon}
                size={32}
                color={selectedRole === role.id ? '#FF6B35' : '#666'}
              />
              <Text
                style={[
                  styles.roleName,
                  selectedRole === role.id && styles.roleNameSelected,
                ]}
              >
                {role.name}
              </Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Formulaire de connexion */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Identifiants</Text>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#FF6B35" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#FF6B35" />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Credentials Info */}
          <View style={styles.credentialsBox}>
            <Text style={styles.credentialsTitle}>📋 Identifiants de test :</Text>
            <Text style={styles.credentialsText}>
              Email: {email || 'Sélectionnez un rôle'}
            </Text>
            <Text style={styles.credentialsText}>
              Mot de passe: {password ? '••••••••' : 'Sélectionnez un rôle'}
            </Text>
          </View>
        </View>

        {/* Bouton Login */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Ionicons name="log-in-outline" size={20} color="#fff" />
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </Text>
        </TouchableOpacity>

        {/* Client Link */}
        <View style={styles.clientSection}>
          <Text style={styles.clientText}>Vous êtes client ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.clientLink}>Accéder à l'app client</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  rolesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  roleCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  roleName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  roleNameSelected: {
    color: '#FF6B35',
  },
  roleDescription: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
  },
  credentialsBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  credentialsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  credentialsText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
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
  clientSection: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  clientText: {
    fontSize: 14,
    color: '#666',
  },
  clientLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 8,
  },
});
