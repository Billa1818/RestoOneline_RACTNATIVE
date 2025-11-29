// ============================================
// context/PaymentContext.js
// Gestion des paiements et checkout
// ============================================
import React, { createContext, useState, useContext, useCallback } from 'react';
import cartService from '../services/cartService';
import paymentService from '../services/paymentService';

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);

  /**
   * Créer une commande à partir du panier
   */
  const createOrder = useCallback(async (cartId, orderData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await cartService.checkout(cartId, orderData);

      if (result.success) {
        setCurrentOrder(result.data);
        console.log('✅ Commande créée:', result.data.order_number);
        return {
          success: true,
          data: result.data,
        };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err) {
      console.error('❌ Erreur création commande:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Créer un paiement pour une commande
   */
  const initiatePayment = useCallback(async (orderId, amount, paymentMethod) => {
    try {
      setLoading(true);
      setError(null);

      const result = await paymentService.createPayment(
        orderId,
        amount,
        paymentMethod
      );

      if (result.success) {
        setCurrentPayment(result.data);
        
        // Si c'est une méthode en ligne (pas cash), extraire l'URL
        if (result.data.paydunya_invoice_url) {
          setPaymentUrl(result.data.paydunya_invoice_url);
        }

        console.log('✅ Paiement initié:', result.data.id);
        return {
          success: true,
          data: result.data,
          paymentUrl: result.data.paydunya_invoice_url,
        };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err) {
      console.error('❌ Erreur paiement:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Vérifier le statut du paiement
   */
  const checkPaymentStatus = useCallback(async (paymentId) => {
    try {
      const result = await paymentService.checkPaymentStatus(paymentId);

      if (result.success) {
        setCurrentPayment(result.data);
        console.log('✅ Statut paiement:', result.data.status);
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      console.error('❌ Erreur vérification statut:', err);
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * Réinitialiser l'état du paiement
   */
  const resetPayment = useCallback(() => {
    setCurrentOrder(null);
    setCurrentPayment(null);
    setPaymentUrl(null);
    setError(null);
  }, []);

  const value = {
    currentOrder,
    currentPayment,
    loading,
    error,
    paymentUrl,
    createOrder,
    initiatePayment,
    checkPaymentStatus,
    resetPayment,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
