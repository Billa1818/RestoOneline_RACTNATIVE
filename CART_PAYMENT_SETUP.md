# Configuration Panier & Paiement - Guide Client

## ✅ Fichiers Créés

### 1. Service Panier
**Fichier:** `services/cartService.js`

**Fonctionnalités:**
- `getOrCreateCart(deviceId)` - Récupère/crée le panier
- `addItemToCart(cartId, menuItemId, sizeId, qty, notes)` - Ajoute un article
- `updateCartItemQuantity(cartId, itemId, quantity)` - Modifie la quantité
- `removeItemFromCart(cartId, itemId)` - Retire un article
- `clearCart(cartId)` - Vide le panier
- `checkout(cartId, orderData)` - Crée une commande
- `getDeviceId()` - Obtient le device_id

**Utilisation:**
```javascript
import cartService from '../services/cartService';

// Ajouter au panier
const result = await cartService.addItemToCart(
  cartId,     // ID du panier
  5,          // ID du plat
  15,         // ID du format
  2,          // Quantité
  'Peu épicé' // Instructions
);
```

---

### 2. Service Paiement
**Fichier:** `services/paymentService.js`

**Fonctionnalités:**
- `createPayment(orderId, amount, method)` - Crée un paiement
- `checkPaymentStatus(paymentId)` - Vérifie le statut
- `getPaymentDetails(paymentId)` - Récupère les détails
- `getPaymentMethods()` - Liste les méthodes
- `getStatusLabel(status)` - Label du statut
- `getStatusColor(status)` - Couleur du statut
- `isPaymentCompleted(status)` - Paiement réussi?
- `isPaymentFailed(status)` - Paiement échoué?

**Méthodes de paiement:**
```javascript
paymentService.PAYMENT_METHODS = {
  ORANGE_MONEY: 'orange_money',
  MTN_MONEY: 'mtn_money',
  MOOV_MONEY: 'moov_money',
  CARD: 'card',
  CASH: 'cash',
}
```

**Statuts:**
```javascript
paymentService.PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
}
```

---

### 3. Contexte Paiement
**Fichier:** `context/PaymentContext.js`

**Hook:** `usePayment()`

**API du contexte:**
```javascript
const {
  currentOrder,      // Commande créée
  currentPayment,    // Paiement en cours
  loading,           // État de chargement
  error,             // Message d'erreur
  paymentUrl,        // URL PayDunya
  createOrder,       // Créer commande
  initiatePayment,   // Initier paiement
  checkPaymentStatus,// Vérifier statut
  resetPayment,      // Réinitialiser
} = usePayment();
```

---

## 🔧 Intégration dans App.js

Le `PaymentProvider` est ajouté à la hiérarchie:
```javascript
<PaperProvider>
  <AuthProvider>
    <CartProvider>
      <NotificationProvider>
        <PaymentProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PaymentProvider>
      </NotificationProvider>
    </CartProvider>
  </AuthProvider>
</PaperProvider>
```

---

## 📱 Flux Panier → Paiement

### 1. Ajouter au Panier
```javascript
import { useCart } from '../context/CartContext';
import cartService from '../services/cartService';

export default function DishDetails() {
  const { addToCart } = useCart();
  const deviceId = await cartService.getDeviceId();
  const cart = await cartService.getOrCreateCart(deviceId);
  
  const handleAddToCart = async (dish, size) => {
    const result = await cartService.addItemToCart(
      cart.id,
      dish.id,
      size.id,
      1,
      ''
    );
    
    if (result.success) {
      // Mettre à jour le contexte local
      addToCart(dish);
    }
  };
}
```

### 2. Afficher le Panier
```javascript
import { useCart } from '../context/CartContext';

export default function CartScreen() {
  const { 
    cartItems,      // Articles dans le panier
    removeFromCart, // Retirer un article
    updateQuantity, // Modifier quantité
  } = useCart();

  return (
    <FlatList
      data={cartItems}
      renderItem={({ item }) => (
        <CartItem 
          item={item}
          onRemove={() => removeFromCart(item.id)}
          onUpdateQty={(qty) => updateQuantity(item.id, qty)}
        />
      )}
    />
  );
}
```

### 3. Checkout (Créer Commande)
```javascript
import { usePayment } from '../context/PaymentContext';
import cartService from '../services/cartService';

export default function CheckoutScreen() {
  const { createOrder } = usePayment();
  const { cartItems } = useCart();
  
  const handleCheckout = async () => {
    const deviceId = await cartService.getDeviceId();
    const cart = await cartService.getOrCreateCart(deviceId);
    
    const orderData = {
      delivery_address: 'Cotonou, Akpakpa, Rue 123',
      delivery_latitude: 6.3654200,
      delivery_longitude: 2.4183800,
      delivery_description: 'Maison bleue',
      customer_name: 'Jean Dupont',
      customer_phone: '+22997654321',
      customer_email: 'jean@example.com',
      delivery_fee: '500',
      notes: 'Livraison rapide',
    };
    
    const result = await createOrder(cart.id, orderData);
    
    if (result.success) {
      // Commande créée avec succès
      navigation.navigate('Payment', { order: result.data });
    }
  };
}
```

### 4. Paiement
```javascript
import { usePayment } from '../context/PaymentContext';
import paymentService from '../services/paymentService';

export default function PaymentScreen({ route }) {
  const { order } = route.params;
  const { initiatePayment, paymentUrl } = usePayment();
  
  const handlePayment = async (methodId) => {
    const result = await initiatePayment(
      order.id,
      order.total,
      methodId
    );
    
    if (result.success) {
      if (result.paymentUrl) {
        // Rediriger vers PayDunya
        WebBrowser.openBrowserAsync(result.paymentUrl);
      } else {
        // Paiement par espèces ou traité localement
        navigation.navigate('OrderSuccess', { order });
      }
    }
  };
  
  const methods = paymentService.getPaymentMethods();
  
  return (
    <View>
      {methods.map(method => (
        <TouchableOpacity
          key={method.id}
          onPress={() => handlePayment(method.id)}
        >
          <Text>{method.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

### 5. Vérification Statut (Après Paiement)
```javascript
import { usePayment } from '../context/PaymentContext';

export default function PaymentConfirmScreen() {
  const { currentPayment, checkPaymentStatus } = usePayment();
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    // Vérifier le statut toutes les 3 secondes
    const interval = setInterval(async () => {
      const payment = await checkPaymentStatus(currentPayment.id);
      if (payment && payment.status !== 'processing') {
        setStatus(payment.status);
        clearInterval(interval);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [currentPayment.id, checkPaymentStatus]);
  
  if (status === 'completed') {
    return <View><Text>✅ Paiement réussi!</Text></View>;
  }
  
  if (status === 'failed') {
    return <View><Text>❌ Paiement échoué</Text></View>;
  }
  
  return <View><ActivityIndicator /></View>;
}
```

---

## 🎯 Cas d'Utilisation

### Cas 1: Paiement par Espèces
```javascript
// Pas besoin de vérifier le statut
const result = await initiatePayment(
  order.id,
  order.total,
  paymentService.PAYMENT_METHODS.CASH
);

// Aller directement à la confirmation
navigation.navigate('OrderSuccess');
```

### Cas 2: Paiement Mobile Money
```javascript
// Créer le paiement (reçoit l'URL PayDunya)
const result = await initiatePayment(
  order.id,
  order.total,
  paymentService.PAYMENT_METHODS.ORANGE_MONEY
);

// Rediriger l'utilisateur
if (result.paymentUrl) {
  WebBrowser.openBrowserAsync(result.paymentUrl);
}

// Vérifier périodiquement le statut
const checkStatus = setInterval(async () => {
  const payment = await checkPaymentStatus(result.data.id);
  if (!paymentService.isPaymentProcessing(payment.status)) {
    clearInterval(checkStatus);
    if (paymentService.isPaymentCompleted(payment.status)) {
      navigation.navigate('OrderSuccess');
    } else {
      navigation.navigate('PaymentFailed');
    }
  }
}, 5000);
```

### Cas 3: Panier Persistant
```javascript
// Au démarrage de l'app
useEffect(() => {
  const loadCart = async () => {
    const deviceId = await cartService.getDeviceId();
    const cart = await cartService.getOrCreateCart(deviceId);
    
    // Synchroniser avec le contexte local
    setCartItems(cart.items);
  };
  
  loadCart();
}, []);
```

---

## 🔄 Structure des Données

### Panier (Cart)
```json
{
  "id": 1,
  "device": 1,
  "items": [
    {
      "id": 1,
      "menu_item": 5,
      "size": 15,
      "quantity": 2,
      "special_instructions": "Peu épicé",
      "item_total": "5000.00",
      "menu_item_details": {...},
      "size_details": {...}
    }
  ],
  "total_items": 3,
  "total_amount": "8000.00"
}
```

### Commande (Order)
```json
{
  "id": 1,
  "order_number": "ORD-A1B2C3D4",
  "status": "pending",
  "customer_name": "Jean Dupont",
  "customer_phone": "+22997654321",
  "delivery_address": "Cotonou, Rue 123",
  "subtotal": "8000.00",
  "delivery_fee": "500.00",
  "total": "8500.00",
  "items": [...],
  "created_at": "2024-03-15T14:30:00Z"
}
```

### Paiement (Payment)
```json
{
  "id": 1,
  "order": 5,
  "order_number": "CMD-2024-001",
  "paydunya_token": "abc123xyz",
  "paydunya_invoice_url": "https://app.paydunya.com/invoice/abc123xyz",
  "amount": "15000.00",
  "payment_method": "orange_money",
  "status": "completed",
  "transaction_id": "TXN123456789",
  "created_at": "2024-11-27T10:00:00Z"
}
```

---

## ⚠️ Erreurs Courantes

### Erreur: "Panier vide"
```javascript
// Cause: Pas d'articles dans le panier
// Solution: Vérifier que cartItems.length > 0
if (cartItems.length === 0) {
  Alert.alert('Erreur', 'Votre panier est vide');
  return;
}
```

### Erreur: "Paiement non trouvé"
```javascript
// Cause: ID du paiement incorrect
// Solution: Vérifier que currentPayment.id existe
if (!currentPayment?.id) {
  Alert.alert('Erreur', 'ID paiement manquant');
  return;
}
```

### Erreur: "Commande non trouvée"
```javascript
// Cause: Essayer de créer un paiement avant la commande
// Solution: Créer la commande d'abord
const orderResult = await createOrder(cartId, orderData);
if (orderResult.success) {
  await initiatePayment(orderResult.data.id, amount, method);
}
```

---

## 💡 Bonnes Pratiques

1. **Toujours récupérer le device_id** avant de créer un panier
2. **Vérifier le statut du paiement** régulièrement après redirection
3. **Afficher les erreurs à l'utilisateur** avec des messages clairs
4. **Vider le panier** après une commande réussie
5. **Sauvegarder le numéro de commande** pour le suivi
6. **Gérer les timeouts** pour les requêtes réseau

---

## 🔐 Sécurité

- Les paiements par carte sont traités par PayDunya (PCI-DSS)
- Les transactions mobiles passent par les opérateurs
- Le backend valide tous les paiements
- Les URLs PayDunya sont validées côté serveur

---

## 📋 Checklist

- ✅ Service panier créé: `cartService.js`
- ✅ Service paiement créé: `paymentService.js`
- ✅ Contexte paiement créé: `PaymentContext.js`
- ✅ Provider ajouté à `App.js`
- ⚠️ À faire: Créer l'écran Panier
- ⚠️ À faire: Créer l'écran Checkout
- ⚠️ À faire: Créer l'écran Paiement
- ⚠️ À faire: Intégrer WebBrowser pour PayDunya

---
