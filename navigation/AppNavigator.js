// ============================================
// navigation/AppNavigator.js
// ============================================
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import DeliveryDetails from '../screens/delivery/DeliveryDetails';
import DeliveryHistory from '../screens/delivery/DeliveryHistory';
import DeliveryHistoryDetails from '../screens/delivery/DeliveryHistoryDetails';


// Import des écrans
import Home from '../screens/Home';
import Search from '../screens/Search';
import Orders from '../screens/Orders';
import Settings from '../screens/Settings';
import OrderDetails from '../screens/OrderDetails';
import Cart from '../screens/Cart';
import DishDetails from '../screens/DishDetails';
import Login from '../screens/Login';
import DeliveryDashboard from '../screens/delivery/DeliveryDashboard';

// Import du Footer et Header personnalisés
import Footer from '../components/Footer';
import DeliveryFooter from '../components/DeliveryFooter';
import Header from '../components/Header';

// Import du contexte
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Wrapper pour le Header personnalisé avec SafeAreaView
function HeaderWithSafeArea({ navigation, route }) {
  const { cartCount, favoritesCount } = useCart();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        cartCount={cartCount}
        favoritesCount={favoritesCount}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

// TabNavigator avec Header et Footer personnalisés
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <Footer {...props} />}
      screenOptions={{
        header: (props) => <HeaderWithSafeArea {...props} />,
      }}
    >
      <Tab.Screen
        name="home"
        component={Home}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen
        name="search"
        component={Search}
        options={{ title: 'Recherche' }}
      />
      <Tab.Screen
        name="orders"
        component={Orders}
        options={{ title: 'Commandes' }}
      />
      <Tab.Screen
        name="settings"
        component={Settings}
        options={{ 
          title: 'Paramètres',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// Stack principal avec navigation conditionnelle par rôle
export default function AppNavigator() {
  const { currentUser } = useAuth();

  // Navigation pour les CLIENTS (défaut)
  const ClientNavigation = () => (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
      />

      <Stack.Screen
        name="OrderDetails"
        component={OrderDetails}
        options={{
          headerShown: true,
          header: (props) => <HeaderWithSafeArea {...props} />,
        }}
      />

      <Stack.Screen
        name="Cart"
        component={Cart}
        options={{
          headerShown: true,
          header: (props) => <HeaderWithSafeArea {...props} />,
        }}
      />

      <Stack.Screen
        name="DishDetails" 
        component={DishDetails}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );

  // Dashboard LIVREUR
  const DeliveryTabNavigator = () => (
    <Tab.Navigator
      tabBar={(props) => <DeliveryFooter {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DeliveryDash"
        component={DeliveryDashboard}
        options={{
          title: 'Livraisons',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="History"
        component={DeliveryHistory}  
        options={{
          title: 'Historique',
          headerShown:false,
       }}
      />
      <Stack.Screen 
        name="DeliveryHistoryDetails" 
        component={DeliveryHistoryDetails}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="DeliverySettings"
        component={Settings}
        options={{
          title: 'Paramètres',
          headerShown: false,
        }}
      />

      <Stack.Screen 
        name="DeliveryDetails" 
        component={DeliveryDetails}
        options={{ title: 'Détails de la livraison' }}
      />
    </Tab.Navigator>
  );

  // Affichage conditionnel selon le rôle
  if (!currentUser) {
    // Pas connecté : afficher l'app client
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="ClientApp"
          component={ClientNavigation}
        />

        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    );
  }

  // Connecté : afficher selon le rôle
  switch (currentUser.role) {
    case 'livreur':
      return (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="DeliveryApp"
            component={DeliveryTabNavigator}
          />
        </Stack.Navigator>
      );

    case 'client':
    default:
      return (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="ClientApp"
            component={ClientNavigation}
          />

          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
});