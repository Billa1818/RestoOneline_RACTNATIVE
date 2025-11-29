# Configuration des Notifications - Guide Complet

## ✅ Fichiers Créés

### 1. Service de Notifications
**Fichier:** `services/notificationService.js`

**Fonctionnalités:**
- `getMyNotifications(deviceId)` - Récupère les notifications
- `getUnreadCount(deviceId)` - Compte les non lues
- `markAsRead(notificationId)` - Marque comme lue
- `markAllAsRead(deviceId)` - Marque toutes comme lues
- `deleteOldNotifications()` - Supprime les anciennes (>30j)
- `getNotificationIcon(type)` - Retourne l'icône appropriée
- `getNotificationColor(type)` - Retourne la couleur appropriée
- `formatNotificationTime(date)` - Formate la date (ex: "5 min")

**Utilisation:**
```javascript
import notificationService from '../services/notificationService';

const result = await notificationService.getMyNotifications(deviceId);
```

---

### 2. Contexte Notifications
**Fichier:** `context/NotificationContext.js`

**Hook:** `useNotification()`

**API du contexte:**
```javascript
const {
  notifications,           // Array de notifications
  unreadCount,            // Nombre de non lues
  loading,                // État de chargement
  deviceId,               // ID de l'appareil
  lastRefresh,            // Dernière actualisation
  loadNotifications,      // Charger notifications
  fetchUnreadCount,       // Récupérer le nombre
  markNotificationAsRead, // Marquer lue
  markAllAsRead,          // Marquer toutes lues
  removeNotification,     // Supprimer une notif
  clearAllNotifications,  // Vider toutes
  addNotification,        // Ajouter une notif (temps réel)
  refresh,                // Actualiser
} = useNotification();
```

**Comportement:**
- Charge automatiquement les notifications au montage
- Actualise toutes les 30 secondes
- Synchronisation bidirectionnelle (local + serveur)

---

### 3. Composant Notification
**Fichier:** `components/Notification.js`

**Fonctionnalités:**
- Bouton notification avec badge du nombre non lues
- Modal avec liste scrollable des notifications
- Actions: marquer comme lue, supprimer, tout effacer
- Pull-to-refresh pour actualiser
- Icons et couleurs basées sur le type
- Affichage du temps relatif (5 min, 2h, etc)
- Affichage du numéro de commande si disponible

**État du composant:**
- Récupère les données via `useNotification()`
- Pas de state local, tout géré par le contexte

---

## 🔧 Intégration dans App.js

Le `NotificationProvider` est ajouté à la hiérarchie:
```javascript
<PaperProvider>
  <AuthProvider>
    <CartProvider>
      <NotificationProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </NotificationProvider>
    </CartProvider>
  </AuthProvider>
</PaperProvider>
```

---

## 📱 Types de Notifications

### Commandes (Orders)
| Type | Icône | Couleur |
|------|-------|--------|
| `order_created` | bag-add | Bleu |
| `order_accepted` | checkmark-circle | Vert |
| `order_refused` | close-circle | Rouge |
| `order_preparing` | flame | Orange |
| `order_ready` | checkmark-done | Vert |
| `order_assigned` | person | Bleu |
| `order_picked_up` | car | Orange |
| `order_in_delivery` | bicycle | Orange |
| `order_delivered` | home | Vert |

### Livraison (Delivery)
| Type | Icône | Couleur |
|------|-------|--------|
| `delivery_assigned` | person-add | Bleu |
| `delivery_accepted` | checkmark | Vert |
| `delivery_completed` | checkmark-done | Vert |

### Paiements & Autres
| Type | Icône | Couleur |
|------|-------|--------|
| `payment_received` | card | Vert |
| `payment_failed` | alert-circle | Rouge |
| `rating_received` | star | Orange |
| `account_created` | person-circle | Violet |

---

## 🚀 Utilisation dans les Composants

### Exemple 1: Afficher le nombre de notifications
```javascript
import { useNotification } from '../context/NotificationContext';

export default function MyComponent() {
  const { unreadCount } = useNotification();
  
  return <Text>{unreadCount} notifications non lues</Text>;
}
```

### Exemple 2: Charger et afficher les notifications
```javascript
import { useNotification } from '../context/NotificationContext';

export default function NotificationsScreen() {
  const { notifications, loading, refresh } = useNotification();
  
  return (
    <FlatList
      data={notifications}
      renderItem={({ item }) => <NotificationCard notification={item} />}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
    />
  );
}
```

### Exemple 3: Ajouter une notification en temps réel
```javascript
const { addNotification } = useNotification();

// Quand vous recevez une notification WebSocket
addNotification({
  id: 123,
  type: 'order_ready',
  title: 'Commande prête',
  message: 'Votre commande est prête pour la livraison',
  order_id: 456,
  created_at: new Date().toISOString(),
  is_read: false,
  data: {},
});
```

---

## 🔄 Flux de Données

```
API Backend
    ↓
notificationService
    ↓
NotificationContext
    ↓ (useNotification)
Composants/Écrans
    ↓
Component Notification (bouton + modal)
```

---

## ⚙️ Configuration API

**Endpoints utilisés:**
```
GET    /api/notifications/notifications/my_notifications/
GET    /api/notifications/notifications/unread_count/
POST   /api/notifications/notifications/{id}/mark_as_read/
POST   /api/notifications/notifications/mark_all_as_read/
DELETE /api/notifications/notifications/delete_old_notifications/
```

**Auth:**
- Utilise les tokens stockés dans AsyncStorage
- Intercepteurs axios automatiques pour Authorization

**Device ID:**
- Généré et stocké automatiquement
- Passé comme query param pour les requêtes

---

## 🐛 Débogage

**Logs disponibles:**
```javascript
// Dans notificationService.js
console.log('✅ Notifications récupérées:', count);
console.log('✅ Nombre non lues:', count);
console.log('✅ Notification marquée comme lue');
console.log('❌ Erreur ...');

// Dans NotificationContext.js
console.log('📱 Notifications chargées:', count);
```

**Vérifier les notifications dans AsyncStorage:**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const device = await AsyncStorage.getItem('device_id');
console.log('Device ID:', device);
```

---

## 🎨 Personnalisation

### Ajouter un nouveau type de notification

1. **notificationService.js - Ajouter les mappings:**
```javascript
// getNotificationIcon
'mon_nouveau_type': 'mon-icone',

// getNotificationColor
'mon_nouveau_type': '#COULEUR',
```

2. **Utiliser automatiquement:**
```javascript
const icon = notificationService.getNotificationIcon('mon_nouveau_type');
const color = notificationService.getNotificationColor('mon_nouveau_type');
```

### Modifier la fréquence d'actualisation

Dans `NotificationContext.js`, modifier cette ligne:
```javascript
// Actuellement: toutes les 30 secondes
const interval = setInterval(loadNotifications, 30000);

// Pour 60 secondes:
const interval = setInterval(loadNotifications, 60000);
```

---

## ✨ Prochaines Étapes Optionnelles

1. **WebSocket en temps réel:**
   - Intégrer une connexion WebSocket pour les notifications instantanées
   - Utiliser `Socket.io` ou similaire

2. **Notifications Push:**
   - Intégrer Expo Notifications
   - Envoyer alerts même quand l'app est fermée

3. **Notifications Locales:**
   - Créer des rappels locaux
   - Alarmes pour commandes importantes

4. **Persistance améliorée:**
   - Stocker les notifications en base locale SQLite
   - Syncer avec le serveur au redémarrage

---

## 📋 Checklist d'Intégration

- ✅ Service créé: `notificationService.js`
- ✅ Contexte créé: `NotificationContext.js`
- ✅ Composant mis à jour: `Notification.js`
- ✅ Provider ajouté à `App.js`
- ⚠️ À tester: Intégration avec vos écrans
- ⚠️ À configurer: API endpoints si différents

---

## 🆘 Troubleshooting

**Notifications ne se chargent pas:**
1. Vérifier que le device_id existe
2. Vérifier l'authentification (access_token)
3. Vérifier l'URL de base de l'API

**Badge non actualisé:**
1. Vérifier que markNotificationAsRead est appelé
2. Vérifier que le compteur local est mis à jour

**Icône/couleur incorrecte:**
1. Vérifier le type dans la réponse API
2. Ajouter le mapping manquant dans getNotificationIcon/Color

---
