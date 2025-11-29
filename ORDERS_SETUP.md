# Configuration Commandes & Paiements - Guide Client

## ✅ Fichiers Configurés

### 1. OrderService.js - Mis à Jour
**Fichier:** `services/orderService.js`

**Nouvelles méthodes de paiement:**
- `createPayment(orderId, amount, method)` - Créer un paiement
- `getPaymentDetails(paymentId)` - Récupérer détails
- `checkPaymentStatus(paymentId)` - Vérifier le statut
- `listPayments(filters)` - Lister les paiements
- `getPaymentStatistics()` - Statistiques paiements

**Constantes ajoutées:**
- `PAYMENT_METHODS` - Orange Money, MTN, Moov, Carte, Espèces
- `PAYMENT_STATUSES` - pending, processing, completed, failed, etc.
- `PAYMENT_STATUS_LABELS` - Traductions français

---

### 2. Écran Orders.js - Nouvelle Liste de Commandes
**Fichier:** `screens/Orders.js`

**Fonctionnalités:**
- Affiche la liste de toutes les commandes
- Filtres: Toutes, En cours, Livrées, Annulées
- Pull-to-refresh pour actualiser
- Statut avec icône et couleur
- Montant total par commande
- Navigation vers détails

**Props:**
```javascript
- navigation: React Navigation
```

**États:**
```javascript
- orders: Array<Order>
- loading: boolean
- refreshing: boolean
- filter: 'all' | 'active' | 'delivered' | 'cancelled'
```

---

### 3. Écran OrderDetails.js - Détails d'une Commande
**Fichier:** `screens/OrderDetails.js`

**Fonctionnalités:**
- Affiche les détails complets d'une commande
- Info client (nom, téléphone, email)
- Adresse de livraison
- Liste des articles avec prix
- Résumé paiement (sous-total, frais, total)
- Boutons d'action (annuler, payer)
- Sélection du mode de paiement
- Ouverture URL PayDunya si nécessaire

**Props:**
```javascript
route: {
  params: {
    orderId: string  // Numéro de commande (ex: 'ORD-A1B2C3D4')
  }
}
navigation: React Navigation
```

**Modes de paiement:**
- 🟠 Orange Money
- 🟡 MTN Mobile Money
- 🔴 Moov Money
- 💳 Carte bancaire
- 💵 Espèces

---

## 🔧 Intégration dans AppNavigator

Ajouter ces écrans à votre navigation:

```javascript
// Dans votre stack navigator
<Stack.Screen 
  name="Orders" 
  component={Orders}
  options={{ title: 'Mes commandes' }}
/>

<Stack.Screen 
  name="OrderDetails" 
  component={OrderDetails}
  options={{ headerShown: false }}
/>
```

---

## 📱 Utilisation

### Afficher la liste des commandes
```javascript
import Orders from '../screens/Orders';

// Dans votre navigateur
<Stack.Screen name="Orders" component={Orders} />

// Naviguer vers
navigation.navigate('Orders');
```

### Afficher les détails d'une commande
```javascript
import OrderDetails from '../screens/OrderDetails';

// Naviguer avec le numéro de commande
navigation.navigate('OrderDetails', { 
  orderId: 'ORD-A1B2C3D4' 
});
```

### Créer un paiement
```javascript
import * as orderService from '../services/orderService';

// Créer un paiement
const payment = await orderService.createPayment(
  orderId,
  totalAmount,
  orderService.PAYMENT_METHODS.ORANGE_MONEY
);

// payment.paydunya_invoice_url contient l'URL de paiement
```

### Vérifier le statut du paiement
```javascript
const payment = await orderService.checkPaymentStatus(paymentId);

if (payment.status === 'completed') {
  // Paiement réussi
}
```

---

## 🎯 Flux Utilisateur Complet

```
1. Utilisateur ouvre "Mes commandes"
   ↓ Affiche Orders.js
   
2. Voit la liste de ses commandes
   ↓ Peut filtrer (Toutes, En cours, etc.)
   
3. Clique sur une commande
   ↓ Affiche OrderDetails.js
   
4. Voit les détails complets
   ↓ Informations client, adresse, articles, prix
   
5. Clique sur "Passer au paiement"
   ↓ Affiche les modes de paiement
   
6. Choisit un mode (ex: Orange Money)
   ↓ Crée le paiement via API
   
7. Si PayDunya: redirection pour payer
   ↓ Utilisateur effectue le paiement
   
8. Webhook PayDunya notifie le serveur
   ↓ Statut du paiement mis à jour
   
9. Commande passe à "Acceptée"
   ↓ Utilisateur reçoit notification
```

---

## 📊 Structure des Données

### Order
```json
{
  "id": 1,
  "order_number": "ORD-A1B2C3D4",
  "status": "pending",
  "status_display": "En attente",
  "customer_name": "Jean Dupont",
  "customer_phone": "+22997654321",
  "customer_email": "jean@example.com",
  "delivery_address": "Cotonou, Rue 123",
  "delivery_description": "Maison bleue",
  "subtotal": "8000.00",
  "delivery_fee": "500.00",
  "total": "8500.00",
  "items": [
    {
      "id": 1,
      "item_name": "Poulet Yassa",
      "size_name": "Petit",
      "quantity": 2,
      "subtotal": "5000.00",
      "special_instructions": "Peu épicé"
    }
  ],
  "created_at": "2024-03-15T14:30:00Z",
  "accepted_at": null,
  "delivered_at": null
}
```

### Payment
```json
{
  "id": 1,
  "order": 5,
  "order_number": "ORD-A1B2C3D4",
  "amount": "8500.00",
  "payment_method": "orange_money",
  "payment_method_display": "Orange Money",
  "status": "completed",
  "transaction_id": "TXN123456789",
  "paydunya_token": "abc123xyz",
  "paydunya_invoice_url": "https://app.paydunya.com/invoice/abc123xyz",
  "created_at": "2024-03-15T14:35:00Z",
  "completed_at": "2024-03-15T14:40:00Z"
}
```

---

## 🎨 Personnalisation

### Couleurs des Statuts
Dans `OrderDetails.js` et `Orders.js`, modifier `getStatusColor()`:

```javascript
const getStatusColor = (status) => {
  const colors = {
    pending: '#FF9800',      // Orange
    accepted: '#2196F3',     // Bleu
    preparing: '#9C27B0',    // Violet
    ready: '#4CAF50',        // Vert
    in_delivery: '#FF5722',  // Rouge-Orange
    delivered: '#4CAF50',    // Vert
    cancelled: '#F44336',    // Rouge
  };
  return colors[status] || '#757575';
};
```

### Icônes des Statuts
Modifier `getStatusIcon()`:

```javascript
const getStatusIcon = (status) => {
  const icons = {
    pending: 'time-outline',
    accepted: 'checkmark-circle-outline',
    preparing: 'flame-outline',
    ready: 'checkmark-done-outline',
    in_delivery: 'bicycle-outline',
    delivered: 'home-outline',
    cancelled: 'close-circle-outline',
  };
  return icons[status] || 'help-circle-outline';
};
```

---

## ⚠️ Erreurs Courantes

### "Impossible de charger les commandes"
```javascript
// Cause: Pas d'authentification
// Solution: Vérifier que les tokens sont en AsyncStorage
```

### "Commande non trouvée"
```javascript
// Cause: orderId incorrect
// Solution: Vérifier le format (ex: 'ORD-A1B2C3D4')
```

### Paiement ne se termine pas
```javascript
// Cause: URL PayDunya non ouverte
// Solution: Vérifier que Linking est configuré
import { Linking } from 'react-native';
Linking.openURL(paymentUrl);
```

---

## 🔐 Sécurité

- ✅ Tokens stockés dans AsyncStorage
- ✅ Authentification automatique via interceptors
- ✅ Paiements traités par PayDunya (PCI-DSS)
- ✅ Validation côté serveur

---

## 📱 Instructions pour le Client

**Pour voir vos commandes:**
1. Allez dans "Mes commandes"
2. Vous verrez toutes vos commandes passées

**Pour consulter une commande:**
1. Cliquez sur une commande
2. Vous verrez tous les détails (articles, prix, statut)

**Pour payer une commande:**
1. Si le statut est "En attente", cliquez sur "Passer au paiement"
2. Choisissez votre mode de paiement
3. Suivez les instructions pour payer
4. Le paiement sera confirmé automatiquement

---

## 🔗 Endpoints Utilisés

### Commandes
- `GET /api/orders/orders/` - Lister
- `GET /api/orders/orders/{order_number}/` - Détails
- `POST /api/orders/orders/{order_number}/cancel/` - Annuler

### Paiements
- `POST /api/payments/` - Créer
- `GET /api/payments/{id}/` - Détails
- `GET /api/payments/{id}/check_status/` - Vérifier

---

## 📋 Checklist

- ✅ orderService.js mis à jour avec paiements
- ✅ Orders.js créé
- ✅ OrderDetails.js créé
- ⚠️ À faire: Ajouter les écrans à AppNavigator
- ⚠️ À faire: Tester les paiements
- ⚠️ À faire: Configurer Linking pour PayDunya

---
