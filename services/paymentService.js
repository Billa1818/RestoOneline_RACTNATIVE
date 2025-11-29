// ============================================
// services/paymentService.js
// Service de gestion des paiements
// ============================================
import api from './api';

const PAYMENT_METHODS = {
  ORANGE_MONEY: 'orange_money',
  MTN_MONEY: 'mtn_money',
  MOOV_MONEY: 'moov_money',
  CARD: 'card',
  CASH: 'cash',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

const paymentService = {
  /**
   * Créer un paiement
   * @param {number} orderId - ID de la commande
   * @param {string} amount - Montant à payer
   * @param {string} paymentMethod - Méthode de paiement
   * @returns {Promise<Object>}
   */
  createPayment: async (orderId, amount, paymentMethod) => {
    try {
      const response = await api.post('/payments/', {
        order: orderId,
        amount: amount,
        payment_method: paymentMethod,
      });

      console.log(' Paiement créé:', response.data.id);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Erreur création paiement:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null,
      };
    }
  },

  /**
   * Vérifier le statut d'un paiement
   * @param {number} paymentId - ID du paiement
   * @returns {Promise<Object>}
   */
  checkPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}/check_status/`);

      console.log(' Statut paiement vérifié:', response.data.status);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Erreur vérification statut:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null,
      };
    }
  },

  /**
   * Récupérer les détails d'un paiement
   * @param {number} paymentId - ID du paiement
   * @returns {Promise<Object>}
   */
  getPaymentDetails: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}/`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Erreur récupération paiement:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  },

  /**
   * Obtenir les statistiques de paiement
   * @returns {Promise<Object>}
   */
  getStatistics: async () => {
    try {
      const response = await api.get('/payments/statistics/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Erreur statistiques paiement:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  },

  /**
   * Obtenir la liste des méthodes de paiement
   * @returns {Array}
   */
  getPaymentMethods: () => {
    return [
      {
        id: PAYMENT_METHODS.ORANGE_MONEY,
        label: 'Orange Money',
        icon: 'call',
        color: '#FF8C00',
      },
      {
        id: PAYMENT_METHODS.MTN_MONEY,
        label: 'MTN Mobile Money',
        icon: 'call',
        color: '#FFD700',
      },
      {
        id: PAYMENT_METHODS.MOOV_MONEY,
        label: 'Moov Money',
        icon: 'call',
        color: '#FF6B35',
      },
      {
        id: PAYMENT_METHODS.CARD,
        label: 'Carte bancaire',
        icon: 'card',
        color: '#5D0EC0',
      },
      {
        id: PAYMENT_METHODS.CASH,
        label: 'Espèces',
        icon: 'cash',
        color: '#4CAF50',
      },
    ];
  },

  /**
   * Obtenir le label d'une méthode de paiement
   * @param {string} methodId - ID de la méthode
   * @returns {string}
   */
  getPaymentMethodLabel: (methodId) => {
    const methods = paymentService.getPaymentMethods();
    const method = methods.find(m => m.id === methodId);
    return method ? method.label : 'Inconnu';
  },

  /**
   * Obtenir le label d'un statut
   * @param {string} status - Statut du paiement
   * @returns {string}
   */
  getStatusLabel: (status) => {
    const labels = {
      pending: 'En attente',
      processing: 'En cours',
      completed: 'Complété',
      failed: 'Échoué',
      cancelled: 'Annulé',
      refunded: 'Remboursé',
    };
    return labels[status] || 'Inconnu';
  },

  /**
   * Obtenir la couleur d'un statut
   * @param {string} status - Statut du paiement
   * @returns {string}
   */
  getStatusColor: (status) => {
    const colors = {
      pending: '#FF9800',
      processing: '#2196F3',
      completed: '#4CAF50',
      failed: '#F44336',
      cancelled: '#9E9E9E',
      refunded: '#5D0EC0',
    };
    return colors[status] || '#757575';
  },

  /**
   * Vérifier si un paiement est complété
   * @param {string} status - Statut du paiement
   * @returns {boolean}
   */
  isPaymentCompleted: (status) => {
    return status === PAYMENT_STATUS.COMPLETED;
  },

  /**
   * Vérifier si un paiement a échoué
   * @param {string} status - Statut du paiement
   * @returns {boolean}
   */
  isPaymentFailed: (status) => {
    return [PAYMENT_STATUS.FAILED, PAYMENT_STATUS.CANCELLED].includes(status);
  },

  /**
   * Vérifier si un paiement est en cours
   * @param {string} status - Statut du paiement
   * @returns {boolean}
   */
  isPaymentProcessing: (status) => {
    return [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PROCESSING].includes(status);
  },

  // Constantes exportées
  PAYMENT_METHODS,
  PAYMENT_STATUS,
};

export default paymentService;
