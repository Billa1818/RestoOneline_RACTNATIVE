# Implémentation des Notations (Ratings)

## Vue d'ensemble
Fonctionnalité permettant aux clients de noter les livreurs et les plats après la livraison d'une commande.

## Architecture

### 1. Service de Notation (`services/ratingService.js`)
Service centralisé pour gérer toutes les opérations de notation:

#### Endpoints de notation de livraison
- `getDeliveryRatings()` - Récupérer toutes les notes de livraison
- `createDeliveryRating(ratingData)` - Créer une note de livraison
- `getDeliveryRatingDetails(ratingId)` - Détails d'une note
- `updateDeliveryRating(ratingId, updateData)` - Modifier une note
- `deleteDeliveryRating(ratingId)` - Supprimer une note
- `getDeliveryPersonRatings(deliveryPersonId)` - Notes par livreur

#### Endpoints de notation de plats
- `getMenuItemRatings()` - Récupérer toutes les notes de plats
- `createMenuItemRating(ratingData)` - Créer une note de plat
- `getMenuItemRatingDetails(ratingId)` - Détails d'une note
- `updateMenuItemRating(ratingId, updateData)` - Modifier une note
- `deleteMenuItemRating(ratingId)` - Supprimer une note
- `rateOrderItems(ratingData)` - Noter plusieurs plats en une fois
- `getMenuItemRatingsByItem(menuItemId)` - Notes par plat

### 2. Écran des Détails de Commande (`screens/OrderDetails.js`)

#### État (State)
```javascript
const [showRatingModal, setShowRatingModal] = useState(false); // Visibilité modal
const [deviceId, setDeviceId] = useState(null); // ID de l'appareil
const [ratingType, setRatingType] = useState(null); // 'delivery' ou 'items'
const [deliveryRating, setDeliveryRating] = useState({...}); // Notes du livreur
const [itemsRatings, setItemsRatings] = useState({}); // Notes des plats
const [isSubmittingRating, setIsSubmittingRating] = useState(false); // Chargement
```

#### Fonctionnalités principales

##### 1. Affichage des boutons de notation
```
Visible uniquement si: order.status === 'delivered'
Boutons:
- "Noter le livreur" → ouvre modal livraison
- "Noter les plats" → ouvre modal articles
```

##### 2. Modal de notation du livreur
- Évaluation globale (1-5 étoiles)
- Rapidité de livraison (1-5 étoiles)
- Professionnalisme (1-5 étoiles)
- Commentaire optionnel
- Validation: évaluation globale requise

##### 3. Modal de notation des plats
- Affiche tous les articles de la commande
- Pour chaque article:
  - Note globale (1-5 étoiles)
  - Goût (1-5 étoiles)
  - Présentation (1-5 étoiles)
  - Portion (1-5 étoiles)
  - Commentaire optionnel
- Validation: au moins 1 article noté

#### Flux de notation

1. **Ouverture du modal**
```javascript
handleOpenRatingModal(type) // type: 'delivery' ou 'items'
```

2. **Saisie des notes**
- Clic sur les étoiles pour sélectionner la note
- Saisie du commentaire optionnel

3. **Soumission**
```javascript
// Pour livraison
handleSubmitDeliveryRating()
├─ Validation évaluation globale
├─ POST /api/delivery-ratings/
└─ Rafraîchit les détails

// Pour plats
handleSubmitItemsRatings()
├─ Validation: minimum 1 plat noté
├─ POST /api/menu-item-ratings/rate_order_items/
└─ Rafraîchit les détails
```

## Intégration API

### Note de Livraison
**Endpoint:** `POST /api/delivery-ratings/`

```javascript
{
  order: 5,                          // ID de la commande
  device: 3,                         // ID de l'appareil
  delivery_person: 10,               // ID du livreur
  rating: 5,                         // Note globale (1-5)
  speed_rating: 5,                   // Note de rapidité (1-5)
  professionalism_rating: 4,         // Note de professionnalisme (1-5)
  comment: "Excellent service!"      // Optionnel
}
```

### Notes de Plats
**Endpoint:** `POST /api/menu-item-ratings/rate_order_items/`

```javascript
{
  order_id: 5,
  items: [
    {
      order_item: 15,                 // ID article dans panier
      device: 3,                      // ID appareil
      menu_item: 8,                   // ID du plat
      rating: 5,                      // Note globale (1-5)
      taste_rating: 5,                // Note goût (1-5)
      presentation_rating: 5,         // Note présentation (1-5)
      portion_rating: 4,              // Note portion (1-5)
      comment: "Délicieux!"           // Optionnel
    }
  ]
}
```

## Constantes et Labels

### Échelles
```javascript
RATING_SCALES = {
  EXCELLENT: 5,
  VERY_GOOD: 4,
  GOOD: 3,
  FAIR: 2,
  POOR: 1
}

RATING_LABELS = {
  5: 'Excellent',
  4: 'Très bien',
  3: 'Bien',
  2: 'Passable',
  1: 'Mauvais'
}
```

### Critères de Livraison
```javascript
DELIVERY_CRITERIA_LABELS = {
  rating: 'Évaluation générale',
  speed_rating: 'Rapidité de livraison',
  professionalism_rating: 'Professionnalisme'
}
```

### Critères de Plats
```javascript
MENU_ITEM_CRITERIA_LABELS = {
  rating: 'Évaluation générale',
  taste_rating: 'Goût',
  presentation_rating: 'Présentation',
  portion_rating: 'Portion'
}
```

## Gestion des Erreurs

### Validation
- Évaluation globale requise pour livraison
- Minimum 1 plat noté pour les articles
- Les notes doivent être entre 1-5

### Réponses d'erreur
```javascript
400: "Seules les commandes livrées peuvent être notées"
400: "Cette livraison a déjà été notée"
404: "Commande ou livreur non trouvé"
```

## Données Requises

### Device ID
Stocké localement en AsyncStorage:
```javascript
const deviceId = await AsyncStorage.getItem('device_id');
```

### Order Data
- `order.id` - ID de la commande
- `order.delivery_person` - Informations du livreur
- `order.items` - Articles commandés

## Tests et Validation

### Cas de test à couvrir
1. ✅ Affichage des boutons si statut 'delivered'
2. ✅ Modal livraison s'affiche correctement
3. ✅ Modal plats liste tous les articles
4. ✅ Validation des notes requises
5. ✅ Soumission vers API
6. ✅ Messages d'erreur/succès
7. ✅ Rafraîchissement après soumission

### Points de vérification
- Device ID disponible en AsyncStorage
- Order details chargés avant notation
- Gestion du chargement pendant soumission
- Fermeture du modal après succès

## Améliorations Futures

1. **Historique des notes**
   - Afficher si déjà noté
   - Permettre modification de notes existantes

2. **Photos/Evidence**
   - Permettre upload de photos
   - Pour justifier une note basse

3. **Filtrage avancé**
   - Notes par période
   - Statistiques personnalisées

4. **Notifications**
   - Alerte quand livreur note est basse
   - Suggestions d'amélioration

5. **Partage**
   - Partager avis sur réseau social
   - Signaler avis problématiques

## Notes d'Implementation

- Les notes sont soumises immédiatement après le "delivered"
- Pas de limite de temps pour noter (ajustable si nécessaire)
- Les commentaires sont stockés en texte libre
- Les moyennes se calculent automatiquement côté serveur
