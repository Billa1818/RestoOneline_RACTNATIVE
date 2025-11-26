// ============================================
// App.js
// ============================================
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
]);
export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </PaperProvider>
  );
}