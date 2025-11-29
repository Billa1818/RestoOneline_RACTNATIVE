# 🛒 Fonctionnalités du Panier - Guide complet

## ✅ Fonctionnalités implémentées

### 1. **Ajouter au panier** 
Depuis Home.js, Search.js et DishDetails.js

```javascript
// Home.js / Search.js - Ajout rapide
addToCartSimple(dish) → Ajoute directement avec prix min

// DishDetails.js - Ajout complet
addToCart() → Ajoute avec format sélectionné + instructions
```

### 2. **Retirer du panier** ✨
Depuis Cart.js avec confirmation

```javascript
handleRemoveItem(item) → Affiche confirmation
removeItemFromCart(item) → Retire via API + panier local
```

### 3. **Modifier les quantités** ✨
Augmenter/diminuer directement dans le panier

```javascript
handleIncreaseQuantity(item) → Augmente de 1
handleDecreaseQuantity(item) → Diminue de 1
// Si quantité < 1, propose la suppression
```

### 4. **Synchronisation API**
Tous les changements sont sauvegardés sur l'API:
- Ajout via `orderService.addItemToCart()`
- Suppression via `orderService.removeCartItem()`
- Modification via `orderService.updateCartItem()`

### 5. **Panier persistant**
- Device ID unique sauvegardé en AsyncStorage
- Panier maintenu sur l'API entre les sessions
- Synchronisation automatique

---

## 📱 Cart.js - Écran complet

### Structure
```
Header (Titre + badge compteur)
  ↓
Contenu vide (si 0 articles) OU
  ↓
Restaurant Info (nom, temps livraison)
  ↓
Articles du panier
  - Image + nom + prix
  - Instructions spéciales
  - Contrôles quantité (-, +)
  - Bouton supprimer
  ↓
Ajouter d'autres articles (lien)
  ↓
Adresse de livraison (modifiable)
  ↓
Résumé (sous-total + frais)
  ↓
Bouton "Commander"
  ↓
Modal Checkout
  - Informations client
  - Adresse détaillée
  - Choix réseau paiement
```

### États
```javascript
// Général
loading               // Pendant checkout
deviceId             // ID unique appareil
cartId               // ID panier API

// Modales
addressModalVisible  // Modifier adresse
checkoutModalVisible // Modal paiement

// Données livraison
deliveryAddress      // Adresse
deliveryLatitude     // Coordonnées
deliveryLongitude    // Coordonnées
deliveryDescription  // Description lieu

// Données client
customerName         // Nom
customerEmail        // Email
phoneNumber          // Téléphone
selectedNetwork      // MTN/MOOV/CELTIIS

// Opérations
removingItem         // ID article en suppression
updatingQuantity     // ID article en mise à jour
```

---

## 🎯 Flux utilisateur

### Ajouter au panier
```
Home/Search/Details → Bouton "Ajouter"
  ↓
Si plusieurs formats → Accès à DishDetails
  ↓
Si un seul format → Ajout direct
  ↓
API: orderService.addItemToCart()
  ↓
CartContext: addToCart()
  ↓
Alert "Succès"
```

### Modifier le panier
```
Cart → Article visible
  ↓
Boutons - et + pour quantité
  ↓
API: orderService.updateCartItem()
  ↓
CartContext: updateCartQuantity()
  ↓
Mise à jour instantanée
```

### Retirer du panier
```
Cart → Bouton corbeille
  ↓
Alert confirmation
  ↓
API: orderService.removeCartItem()
  ↓
CartContext: removeFromCart()
  ↓
Article disparaît
```

### Commander
```
Cart → Bouton "Commander"
  ↓
Modal avec formulaire
  ↓
Valider: Nom, Email, Téléphone, Adresse
  ↓
API: orderService.checkoutCart()
  ↓
Reçoit: Numéro commande
  ↓
Alert succès
  ↓
Vide panier + Navigation suivi
```

---

## 🔌 Intégration orderService

### Fonctions utilisées

```javascript
// Panier
getOrCreateCart(deviceId)
  → Récupère ou crée le panier API

addItemToCart(cartId, menuItemId, sizeId, quantity, instructions)
  → Ajoute un article

updateCartItem(cartId, itemId, quantity)
  → Modifie la quantité

removeCartItem(cartId, itemId)
  → Supprime un article

checkoutCart(cartId, checkoutData)
  → Crée la commande
```

### Structure de données

```javascript
// Article dans cartItems
{
  id: number,                           // ID unique
  menu_item_details: {                  // Info plat
    name: string,
    image: string,
    category_name: string
  },
  size_details: {                       // Info format
    id: number,
    size: string,
    price: string
  },
  item_name: string,
  item_price: string,
  quantity: number,
  special_instructions: string,
  created_at: string,
  updated_at: string
}
```

---

## 🎨 Styles et UI

### Couleurs principales
```
Primaire: #5D0EC0 (Violet)
Secondaire: #F44336 (Rouge pour suppression)
Texte: #495057 (Gris foncé)
Arrière-plan: #F8F9FA (Gris clair)
```

### Composants
- Cards pour les sections
- Dividers entre articles
- Modals pour checkout et adresse
- ActivityIndicators pour les loaders
- Ionicons pour les icônes

---

## 🔄 Synchronisation API-Local

### Double synchronisation
1. **API** (persistance)
   - orderService.addItemToCart()
   - orderService.updateCartItem()
   - orderService.removeCartItem()

2. **Local** (affichage)
   - CartContext.addToCart()
   - CartContext.updateCartQuantity()
   - CartContext.removeFromCart()

### Gestion d'erreurs
```javascript
try {
  // Appel API
  await orderService.removeCartItem(cartId, itemId);
  
  // Synchronisation local
  removeFromCart(itemId);
  
  // Feedback utilisateur
  Alert.alert('Succès', '...');
} catch (error) {
  Alert.alert('Erreur', error.message);
}
```

---

## ✨ Améliorations UX

### Loading states
- ActivityIndicator pendant suppression
- Boutons désactivés pendant mise à jour
- Couleur réduite (opacity) pendant opération

### Confirmations
- Alert avant suppression
- Résumé avant checkout
- Numéro commande affiché

### Validation
- Nom, Email, Téléphone obligatoires
- Adresse obligatoire
- Panier non vide

### Navigation
- Retour vers Home depuis panier vide
- Navigation vers suivi après commande
- Gestion des back

---

## 🐛 Débogage

### Console logs
```javascript
// Ajouter au Cart.js:
console.log('Cart ID:', cartId);
console.log('Device ID:', deviceId);
console.log('Cart Items:', cartItems);
console.log('Removing:', removingItem);
console.log('Updating:', updatingQuantity);
```

### AsyncStorage
```javascript
// Vérifier les données locales:
const deviceId = await AsyncStorage.getItem('device_id');
console.log('Stored Device ID:', deviceId);
```

---

## 📝 À vérifier avant production

- [ ] Ajouter au panier depuis Home
- [ ] Ajouter au panier depuis Search
- [ ] Ajouter au panier depuis Details avec format
- [ ] Augmenter la quantité dans Cart
- [ ] Diminuer la quantité dans Cart
- [ ] Supprimer un article
- [ ] Confirmation de suppression fonctionne
- [ ] Calcul du total correct
- [ ] Modal adresse fonctionne
- [ ] Modal checkout affiche tous les champs
- [ ] Checkout crée la commande
- [ ] Numéro commande s'affiche
- [ ] Panier se vide après checkout
- [ ] Navigation vers suivi fonctionne

---

## 🚀 Prochaines étapes

### Optionnel
- [ ] Ajouter les codes de promotion
- [ ] Sauvegarde des adresses favorites
- [ ] Historique des commandes
- [ ] Réclamations sur commandes
- [ ] Chat avec le restaurant
