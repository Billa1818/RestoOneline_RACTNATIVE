# Configuration du Device ID

## Problème Identifié

L'erreur **"Informations manquantes"** signifie que `deviceId` est `null` en AsyncStorage.

## Solution

Vous devez sauvegarder le `device_id` lors du **login ou registration**.

## Où Ajouter le Code

### 1. Dans votre écran de Login
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Après une connexion réussie:
const handleLogin = async (username, password) => {
  try {
    const response = await api.post('/accounts/users/login/', {
      username,
      password
    });

    // Sauvegarder les tokens
    await AsyncStorage.setItem('access_token', response.data.access);
    await AsyncStorage.setItem('refresh_token', response.data.refresh);
    
    // ✅ IMPORTANT: Sauvegarder le device_id
    await AsyncStorage.setItem('device_id', String(response.data.device_id));
    
    navigation.replace('Home');
  } catch (error) {
    Alert.alert('Erreur', 'Login échoué');
  }
};
```

### 2. Dans votre écran de Registration
```javascript
// Après une inscription réussie:
const handleRegister = async (data) => {
  try {
    const response = await api.post('/accounts/users/register/', data);

    // Sauvegarder les tokens
    await AsyncStorage.setItem('access_token', response.data.access);
    await AsyncStorage.setItem('refresh_token', response.data.refresh);
    
    // ✅ IMPORTANT: Sauvegarder le device_id
    await AsyncStorage.setItem('device_id', String(response.data.device_id));
    
    navigation.replace('Home');
  } catch (error) {
    Alert.alert('Erreur', 'Inscription échouée');
  }
};
```

### 3. Fallback Temporaire

J'ai ajouté un fallback dans `OrderDetails.js`:
```javascript
setDeviceId(1);  // Utilise 1 par défaut si pas trouvé
```

Cela permet de tester sans error, mais **il faut vraiment sauvegarder le device_id**.

## Comment Vérifier

### Dans la Console
```javascript
// Ajouter dans DevTools ou Console React Native:
import AsyncStorage from '@react-native-async-storage/async-storage';
const deviceId = await AsyncStorage.getItem('device_id');
console.log('Device ID:', deviceId);
```

### Dans l'Écran
Après login, le device_id devrait être sauvegardé.

## Flux Complet

```
1. Utilisateur se connecte
   ↓
2. API retourne device_id
   ↓
3. App sauvegarde en AsyncStorage
   ↓
4. OrderDetails charge et utilise
   ↓
5. Notation fonctionne ✅
```

## Exemple Complet (LoginScreen.js)

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Email et mot de passe requis');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/accounts/users/login/', {
        email,
        password
      });

      // Sauvegarder les tokens
      await AsyncStorage.setItem('access_token', response.data.access);
      await AsyncStorage.setItem('refresh_token', response.data.refresh);
      
      // ✅ Sauvegarder le device_id
      const deviceId = response.data.device_id || response.data.device?.id;
      if (deviceId) {
        await AsyncStorage.setItem('device_id', String(deviceId));
        console.log('✅ Device ID sauvegardé:', deviceId);
      }

      // Sauvegarder l'utilisateur
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

      navigation.replace('Home');
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Login échoué');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput 
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput 
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button 
        title="Connexion" 
        onPress={handleLogin}
        loading={loading}
      />
    </View>
  );
}
```

## Points Importants

1. **Timing:** Sauvegarder APRÈS le login réussi
2. **Clé:** Utilisez toujours `'device_id'` (même cas)
3. **Valeur:** Doit être un string, donc `String(deviceId)`
4. **Check:** Vérifiez que l'API retourne `device_id`

## Si Ça Ne Marche Pas

### Vérifier 1: L'API retourne-t-elle device_id?
```javascript
// Dans LoginScreen, faire un console.log:
console.log('📱 Response data:', response.data);
// Chercher device_id ou device.id
```

### Vérifier 2: Le device_id est-il sauvegardé?
```javascript
// Immédiatement après setItem:
const saved = await AsyncStorage.getItem('device_id');
console.log('💾 Saved device_id:', saved);
```

### Vérifier 3: OrderDetails récupère-t-il le device_id?
```javascript
// Dans la console de OrderDetails:
// Vérifier le log: "📱 Device ID from storage: 123"
```

## API Structure Attendue

```json
{
  "access": "token...",
  "refresh": "token...",
  "user": {...},
  "device_id": 3,
  // ou
  "device": {
    "id": 3,
    "name": "iPhone 12"
  }
}
```

## Quick Fix pour Tester

Si vous n'avez pas accès à modifier le Login, ajoutez ce code temporaire:

```javascript
// Dans OrderDetails.js, dans useEffect:
useEffect(() => {
  loadOrderDetails();
  // TEST SEULEMENT:
  setTimeout(() => {
    AsyncStorage.setItem('device_id', '1'); // Fallback
  }, 100);
}, []);
```

## Checkpoints

- [ ] API login retourne device_id
- [ ] Device_id sauvegardé après login
- [ ] OrderDetails recharge device_id au montage
- [ ] console.log montre le device_id
- [ ] La notation fonctionne sans erreur

---

**Résumé:** Ajoutez `await AsyncStorage.setItem('device_id', String(id))` après un login réussi.
