# 📋 Guide des Fichiers - Système de Notation

## Structure des Fichiers

```
RestoOneline/
├── services/
│   ├── ratingService.js              ✨ NOUVEAU
│   ├── api.js                         (configuré)
│   ├── orderService.js                (utilisé)
│   └── ...
├── screens/
│   ├── OrderDetails.js                📝 MODIFIÉ
│   └── ...
└── Documentation/
    ├── RATINGS_README.md              📖 RÉSUMÉ (LIRE EN PREMIER)
    ├── RATINGS_IMPLEMENTATION.md      📖 COMPLET
    ├── SETUP_RATINGS.md               ⚙️ SETUP
    ├── IMPLEMENTATION_SUMMARY.md      📝 SUMMARY
    └── FICHIERS_RATINGS.md            📋 CE FICHIER
```

## 🎯 Par Où Commencer?

### 1️⃣ Pour Comprendre Vite
**Lire:** `RATINGS_README.md`
- ⏱️ 5 min
- 📝 Résumé complet
- 💡 Exemples d'API

### 2️⃣ Pour l'Architecture
**Lire:** `RATINGS_IMPLEMENTATION.md`
- ⏱️ 15 min
- 🏗️ Architecture détaillée
- 🔄 Flux de données

### 3️⃣ Pour la Configuration
**Lire:** `SETUP_RATINGS.md`
- ⏱️ 10 min
- ⚙️ Configuration
- 🐛 Dépannage

### 4️⃣ Pour les Détails
**Lire:** `IMPLEMENTATION_SUMMARY.md`
- ⏱️ 5 min
- ✅ Checklist de validation
- 📊 Statistiques

## 📄 Descriptions Détaillées

### services/ratingService.js (360 lignes)

**Type:** Service réutilisable

**Exports:**
```javascript
// Notifications de livraison (6)
getDeliveryRatings()
createDeliveryRating()
getDeliveryRatingDetails()
updateDeliveryRating()
deleteDeliveryRating()
getDeliveryPersonRatings()

// Notifications de plats (7)
getMenuItemRatings()
createMenuItemRating()
getMenuItemRatingDetails()
updateMenuItemRating()
deleteMenuItemRating()
rateOrderItems()
getMenuItemRatingsByItem()

// Helpers (1)
getDeviceId()

// Constantes (6)
RATING_SCALES
RATING_LABELS
DELIVERY_RATING_CRITERIA
DELIVERY_CRITERIA_LABELS
MENU_ITEM_RATING_CRITERIA
MENU_ITEM_CRITERIA_LABELS
```

**Utilisation:**
```javascript
import * as ratingService from '../services/ratingService';

// Créer une note de livraison
await ratingService.createDeliveryRating({
  order: 5,
  device: 3,
  delivery_person: 10,
  rating: 5,
  comment: "Excellent!"
});

// Créer plusieurs notes de plats
await ratingService.rateOrderItems({
  order_id: 5,
  items: [...]
});
```

### screens/OrderDetails.js (1080 lignes)

**Type:** Écran avec modals

**État supplémentaire:**
```javascript
[showRatingModal, setShowRatingModal]
[deviceId, setDeviceId]
[ratingType, setRatingType]
[deliveryRating, setDeliveryRating]
[itemsRatings, setItemsRatings]
[isSubmittingRating, setIsSubmittingRating]
```

**Nouvelles fonctions:**
```javascript
loadDeviceId()                    // Charge le device_id
handleOpenRatingModal(type)       // Ouvre modal
handleCloseRatingModal()          // Ferme modal
handleSubmitDeliveryRating()      // Soumet note livraison
handleSubmitItemsRatings()        // Soumet notes plats
```

**Nouveaux composants:**
```javascript
<Button mode="outlined">⭐ Noter le livreur</Button>
<Button mode="outlined">⭐ Noter les plats</Button>
<Modal visible={showRatingModal}>
  {/* Modal de notation */}
</Modal>
```

## 🔍 Points Clés à Retenir

### 1. Activation
Notes visibles seulement si: `order.status === 'delivered'`

### 2. Device ID Requis
Doit être en AsyncStorage:
```javascript
const deviceId = await AsyncStorage.getItem('device_id');
```

### 3. Validation Client
- Livraison: évaluation globale requise
- Plats: minimum 1 plat noté

### 4. Soumission
- POST vers `/api/delivery-ratings/`
- POST vers `/api/menu-item-ratings/rate_order_items/`

### 5. Gestion d'Erreurs
- Messages d'alerte clairs
- Logs console pour déboguer
- Valeurs par défaut sensibles

## 📚 Fichiers Documentation

### RATINGS_README.md ⭐ LIRE DABORD
```
Taille: ~5 pages
Contenu:
- Vue d'ensemble
- Fonctionnalités principales
- Flux d'utilisation
- Architecture technique
- FAQ
```

### RATINGS_IMPLEMENTATION.md 📖 RÉFÉRENCE
```
Taille: ~10 pages
Contenu:
- Architecture complète
- Services et endpoints
- Constantes et labels
- Gestion des erreurs
- Tests et validation
- Améliorations futures
```

### SETUP_RATINGS.md ⚙️ CONFIGURATION
```
Taille: ~8 pages
Contenu:
- Prérequis
- Configuration API
- Données requises
- Personnalisation
- Tests manuels
- Dépannage
- Déploiement
```

### IMPLEMENTATION_SUMMARY.md 📝 RÉSUMÉ
```
Taille: ~4 pages
Contenu:
- Fichiers créés/modifiés
- Fonctionnalités implémentées
- Flux de données
- Points clés
- Checklist
```

## 🛠️ Comment Utiliser

### Pour Modifier le Style
📝 **Fichier:** `screens/OrderDetails.js`
**Section:** `StyleSheet.create({...})`
```javascript
ratingButton: {
  borderColor: '#FFB800',  // Couleur or
},
sectionLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
},
// ...
```

### Pour Ajouter un Critère
📝 **Fichiers:** `ratingService.js` + `OrderDetails.js`
1. Ajouter le champ dans `ratingService.js`
2. Ajouter le contrôle dans le modal
3. Inclure dans la soumission

### Pour Modifier les Labels
📝 **Fichier:** `services/ratingService.js`
```javascript
export const DELIVERY_CRITERIA_LABELS = {
  rating: 'Votre texte ici',
  speed_rating: 'Votre texte ici',
  professionalism_rating: 'Votre texte ici'
}
```

### Pour Tester Localement
1. Créer une commande
2. Marquer comme 'delivered' (via API/admin)
3. Recharger l'écran
4. Vérifier boutons
5. Tester modals
6. Vérifier API calls

## 🔗 Dépendances Entre Fichiers

```
OrderDetails.js
├── import * as ratingService from '../services/ratingService'
├── import * as orderService from '../services/orderService'
├── import AsyncStorage from '@react-native-async-storage/async-storage'
├── utilise ratingService.createDeliveryRating()
├── utilise ratingService.rateOrderItems()
└── utilise ratingService.RATING_LABELS (optionnel)

ratingService.js
├── import api from './api'
├── utilise api.get()
├── utilise api.post()
├── utilise api.patch()
├── utilise api.delete()
└── exporte constantes et fonctions
```

## ✅ Vérifications

Pour vérifier que tout est en place:
```bash
# Vérifier les fichiers
ls -l services/ratingService.js
grep "ratingService" screens/OrderDetails.js

# Vérifier la syntaxe
node -c services/ratingService.js
node -c screens/OrderDetails.js

# Vérifier les imports
grep "import \* as ratingService" screens/OrderDetails.js
```

## 📞 FAQ Fichiers

**Q: Où modifier les textes?**
A: `services/ratingService.js` (RATING_LABELS, etc.) ou `screens/OrderDetails.js` (textes en dur)

**Q: Où modifier les couleurs?**
A: `screens/OrderDetails.js` dans `StyleSheet.create()`

**Q: Où modifier la validation?**
A: `screens/OrderDetails.js` dans `handleSubmitDeliveryRating()` et `handleSubmitItemsRatings()`

**Q: Où modifier les endpoints API?**
A: `services/ratingService.js` à la ligne où est défini `DELIVERY_RATINGS_ENDPOINT`, etc.

**Q: Où modifier le nombre d'étoiles?**
A: `screens/OrderDetails.js` où il y a `[1, 2, 3, 4, 5].map()`

**Q: Comment ajouter une nouvelle métrique?**
A: Ajouter dans le state + dans le modal + dans la soumission

## 🚀 Prochaines Étapes

1. **Tester localement** avec l'API de dev
2. **Déployer en staging** pour test
3. **Monitorer les erreurs** en production
4. **Analyser les utilisations** pour améliorer
5. **Ajouter des améliorations** (photos, etc.)

---

**Dernière mise à jour:** 29 Novembre 2025
**Statut:** ✅ Prêt pour production
