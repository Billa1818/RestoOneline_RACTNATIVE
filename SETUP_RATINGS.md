# Guide de Configuration - Fonctionnalité Notations

## 🔧 Installation et Configuration

### Prérequis
- React Native avec Expo 54+
- react-native-paper 5.14+
- @react-native-async-storage/async-storage 2.2+
- axios pour les requêtes API

### Étapes d'installation

1. **Les fichiers sont déjà créés:**
   ```
   ✅ services/ratingService.js
   ✅ screens/OrderDetails.js (modifié)
   ✅ Documentation (RATINGS_IMPLEMENTATION.md)
   ```

2. **Aucune dépendance supplémentaire requise** (tout déjà installé)

3. **Vérifier les imports:**
   ```javascript
   // OrderDetails.js utilise:
   import * as ratingService from '../services/ratingService';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   ```

## 📝 Configuration API

### Base URL
Vérifiée dans `services/api.js`:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://10.165.54.238:8000/api'
  : 'https://votre-api.com/api';
```

### Endpoints Disponibles

#### Ratings Livraison
```
GET    /api/delivery-ratings/                  - Lister
POST   /api/delivery-ratings/                  - Créer
GET    /api/delivery-ratings/{id}/             - Détails
PATCH  /api/delivery-ratings/{id}/             - Modifier
DELETE /api/delivery-ratings/{id}/             - Supprimer
GET    /api/delivery-ratings/by_delivery_person/ - Par livreur
```

#### Ratings Plats
```
GET    /api/menu-item-ratings/                 - Lister
POST   /api/menu-item-ratings/                 - Créer
GET    /api/menu-item-ratings/{id}/            - Détails
PATCH  /api/menu-item-ratings/{id}/            - Modifier
DELETE /api/menu-item-ratings/{id}/            - Supprimer
POST   /api/menu-item-ratings/rate_order_items/ - Batch
GET    /api/menu-item-ratings/by_menu_item/    - Par plat
```

## 🔑 Données Requises

### 1. Device ID
Doit être stocké en AsyncStorage lors du login:
```javascript
// À faire dans le login/registration
await AsyncStorage.setItem('device_id', String(deviceIdFromServer));
```

### 2. Order Data
L'écran OrderDetails utilise:
```javascript
order = {
  id: number,                  // ID commande
  status: 'delivered',         // Statut
  delivery_person: {
    id: number,
    // ...autres champs
  },
  items: [
    {
      id: number,              // ID article
      menu_item: {
        id: number,
        // ...
      },
      item_name: string,
      size_name: string,
    }
  ]
}
```

## 🎨 Personnalisation

### Couleurs
Modifier dans `OrderDetails.js`:
```javascript
// Étoiles pleines
color={star <= rating ? '#FFB800' : '#ccc'}  // Gold pour sélectionné

// Boutons
style={[styles.paymentButton, { backgroundColor: '#4CAF50' }]} // Vert pour "Livrée"
style={styles.ratingButton}  // Utilise couleur primary
```

### Textes
Modifier les labels:
```javascript
ratingService.DELIVERY_CRITERIA_LABELS = {
  rating: 'Évaluation générale',
  speed_rating: 'Rapidité',
  professionalism_rating: 'Professionnalisme'
}

ratingService.MENU_ITEM_CRITERIA_LABELS = {
  rating: 'Note',
  taste_rating: 'Goût',
  presentation_rating: 'Présentation',
  portion_rating: 'Portion'
}
```

### Validation
Modifier dans `handleSubmitDeliveryRating()`:
```javascript
if (deliveryRating.rating === 0) {
  Alert.alert('Erreur', 'Veuillez donner une note globale');
  return;
}
```

## ⚙️ Configuration Avancée

### 1. Limiter la notation à une période
```javascript
// Ajouter dans handleOpenRatingModal()
const hoursSinceDelivery = (Date.now() - new Date(order.delivered_at)) / 3600000;
if (hoursSinceDelivery > 24) {
  Alert.alert('Notation', 'Vous pouvez noter jusqu\'à 24h après livraison');
  return;
}
```

### 2. Vérifier si déjà noté
```javascript
// Dans loadOrderDetails()
const existingRating = await ratingService.getDeliveryRatings({
  order_id: orderId,
  device_id: deviceId
});

if (existingRating.length > 0) {
  // Désactiver bouton ou afficher message
}
```

### 3. Analytics
```javascript
// Dans handleSubmitDeliveryRating() après succès
logAnalytics('delivery_rating_submitted', {
  rating: deliveryRating.rating,
  order_id: order.id,
  timestamp: new Date()
});
```

## 🧪 Tests

### Test manuel
1. Créer une commande avec statut 'pending'
2. Faire passer au statut 'delivered' (côté serveur/admin)
3. Recharger OrderDetails
4. Vérifier que les boutons apparaissent
5. Cliquer sur "Noter le livreur"
6. Sélectionner des étoiles
7. Ajouter commentaire
8. Soumettre
9. Vérifier le succès et rafraîchissement

### Test des erreurs
1. Tenter de soumettre sans note globale → Erreur attendue
2. Tenter de noter les plats sans sélectionner aucun → Erreur attendue
3. Tenter avec device_id invalide → Erreur API
4. Tenter de noter une commande non livrée → Erreur API

## 🐛 Dépannage

### Problème: Modal ne s'ouvre pas
**Solution:**
```javascript
// Vérifier que showRatingModal est dans useState
const [showRatingModal, setShowRatingModal] = useState(false);

// Vérifier que le Modal a visible={showRatingModal}
<Modal visible={showRatingModal} animationType="slide">
```

### Problème: Device ID non trouvé
**Solution:**
```javascript
// Vérifier AsyncStorage dans login:
console.log('Device ID:', await AsyncStorage.getItem('device_id'));

// Ajouter un fallback:
const deviceId = await AsyncStorage.getItem('device_id') || 'fallback-id';
```

### Problème: API retourne 404
**Solution:**
```javascript
// Vérifier les endpoints:
console.log('Endpoint:', `/api/delivery-ratings/`);
console.log('Base URL:', api.defaults.baseURL);

// Vérifier les IDs envoyés:
console.log('Rating data:', ratingData);
```

### Problème: Erreur "Seules les commandes livrées peuvent être notées"
**Solution:**
```javascript
// Vérifier le statut:
console.log('Order status:', order.status);

// Le statut doit être exactement 'delivered'
if (order.status !== 'delivered') {
  // Les boutons ne s'affichent pas
}
```

## 📚 Documentation Complète

Pour plus de détails, voir:
- `RATINGS_IMPLEMENTATION.md` - Architecture complète
- `IMPLEMENTATION_SUMMARY.md` - Résumé des changements
- `services/ratingService.js` - Commentaires du code
- `screens/OrderDetails.js` - Logique de l'écran

## ✅ Checklist de Déploiement

- [ ] Device ID sauvegardé correctement en AsyncStorage
- [ ] API endpoints testés en Postman/Insomnia
- [ ] Tests manuels passés (voir section Tests)
- [ ] Messages d'erreur personnalisés si nécessaire
- [ ] Couleurs cohérentes avec design de l'app
- [ ] Textes traduits si besoin
- [ ] Analytics intégrées si applicable
- [ ] Documentation lue par l'équipe

## 🚀 Déploiement

1. **Développement:**
   - Tester avec API localhost
   - Vérifier les logs console
   - Tester tous les cas d'erreur

2. **Staging:**
   - Tester avec API de staging
   - Vérifier les performances
   - Test A/B si applicable

3. **Production:**
   - Utiliser API production
   - Monitorer les erreurs
   - Analyser les utilisations

## 📞 Support

En cas de problème, consulter:
1. Les messages d'erreur de l'app
2. Les logs serveur API
3. Les commentaires dans le code
4. La documentation fournie
