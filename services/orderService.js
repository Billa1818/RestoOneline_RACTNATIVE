// orderService.js - Service pour la gestion des commandes et paniers
// Basé sur la documentation API - Module Orders

import api, { handleApiError } from './api';

const ORDER_BASE_URL = '/orders';
const ORDERS_ENDPOINT = `${ORDER_BASE_URL}/orders`;
const CARTS_ENDPOINT = `${ORDER_BASE_URL}/carts`;

/**
 * ============================================================================
 * SECTION COMMANDES (Orders)
 * ============================================================================
 */

/**
 * 1.1 Lister les commandes
 * GET /api/orders/orders/
 * @param {Object} filters - Filtres optionnels
 * @param {string} filters.status - Filtrer par statut
 * @param {string} filters.device_id - Filtrer par ID d'appareil
 * @param {number} filters.delivery_person_id - Filtrer par ID du livreur
 * @returns {Promise<Array>} Liste des commandes
 */
export const getOrders = async (filters = {}) => {
  try {
    const response = await api.get(ORDERS_ENDPOINT, { params: filters });
    // S'assurer que la réponse est un array
    const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
    console.log(' getOrders retourne:', data.length, 'commandes');
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.2 Créer une nouvelle commande
 * POST /api/orders/orders/
 * @param {Object} orderData - Données de la commande
 * @param {number} orderData.device - ID du device
 * @param {string} orderData.delivery_address - Adresse de livraison
 * @param {number} orderData.delivery_latitude - Latitude
 * @param {number} orderData.delivery_longitude - Longitude
 * @param {string} orderData.delivery_description - Description du lieu
 * @param {string} orderData.customer_name - Nom du client
 * @param {string} orderData.customer_phone - Téléphone du client
 * @param {string} orderData.customer_email - Email du client
 * @param {string} orderData.delivery_fee - Frais de livraison
 * @param {string} orderData.notes - Notes spéciales
 * @param {Array} orderData.items - Articles de la commande
 * @returns {Promise<Object>} Commande créée
 */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post(ORDERS_ENDPOINT, orderData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.3 Obtenir les détails d'une commande
 * GET /api/orders/orders/{order_number}/
 * @param {string} orderNumber - Numéro de commande (ex: ORD-A1B2C3D4)
 * @returns {Promise<Object>} Détails complets de la commande
 */
export const getOrderDetails = async (orderNumber) => {
  try {
    const response = await api.get(`${ORDERS_ENDPOINT}/${orderNumber}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.4 Modifier une commande
 * PUT/PATCH /api/orders/orders/{order_number}/
 * @param {string} orderNumber - Numéro de commande
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Commande mise à jour
 */
export const updateOrder = async (orderNumber, updateData) => {
  try {
    const response = await api.patch(`${ORDERS_ENDPOINT}/${orderNumber}/`, updateData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.5 Supprimer une commande
 * DELETE /api/orders/orders/{order_number}/
 * @param {string} orderNumber - Numéro de commande
 * @returns {Promise<void>}
 */
export const deleteOrder = async (orderNumber) => {
  try {
    await api.delete(`${ORDERS_ENDPOINT}/${orderNumber}/`);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.6 Obtenir les commandes en attente
 * GET /api/orders/orders/pending/
 * @returns {Promise<Array>} Commandes avec statut pending
 */
export const getPendingOrders = async () => {
  try {
    const response = await api.get(`${ORDERS_ENDPOINT}/pending/`);
    // S'assurer que la réponse est un array
    const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
    console.log('📦 getPendingOrders retourne:', data.length, 'commandes');
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.7 Obtenir les commandes actives
 * GET /api/orders/orders/active/
 * @returns {Promise<Array>} Commandes en cours
 */
export const getActiveOrders = async () => {
  try {
    const response = await api.get(`${ORDERS_ENDPOINT}/active/`);
    // S'assurer que la réponse est un array
    const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
    console.log(' getActiveOrders retourne:', data.length, 'commandes');
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.8 Accepter une commande
 * POST /api/orders/orders/{order_number}/accept/
 * @param {string} orderNumber - Numéro de commande
 * @returns {Promise<Object>} Commande acceptée
 */
export const acceptOrder = async (orderNumber) => {
  try {
    const response = await api.post(`${ORDERS_ENDPOINT}/${orderNumber}/accept/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.9 Refuser une commande
 * POST /api/orders/orders/{order_number}/refuse/
 * @param {string} orderNumber - Numéro de commande
 * @param {string} reason - Raison du refus
 * @returns {Promise<Object>} Commande refusée
 */
export const refuseOrder = async (orderNumber, reason) => {
  try {
    const response = await api.post(`${ORDERS_ENDPOINT}/${orderNumber}/refuse/`, { reason });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.10 Démarrer la préparation
 * POST /api/orders/orders/{order_number}/start_preparing/
 * @param {string} orderNumber - Numéro de commande
 * @returns {Promise<Object>} Commande en préparation
 */
export const startPreparingOrder = async (orderNumber) => {
  try {
    const response = await api.post(`${ORDERS_ENDPOINT}/${orderNumber}/start_preparing/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.11 Marquer une commande comme prête
 * POST /api/orders/orders/{order_number}/mark_ready/
 * @param {string} orderNumber - Numéro de commande
 * @returns {Promise<Object>} Commande prête
 */
export const markOrderReady = async (orderNumber) => {
  try {
    const response = await api.post(`${ORDERS_ENDPOINT}/${orderNumber}/mark_ready/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.12 Annuler une commande
 * POST /api/orders/orders/{order_number}/cancel/
 * @param {string} orderNumber - Numéro de commande
 * @param {string} reason - Raison de l'annulation
 * @returns {Promise<Object>} Commande annulée
 */
export const cancelOrder = async (orderNumber, reason) => {
  try {
    const response = await api.post(`${ORDERS_ENDPOINT}/${orderNumber}/cancel/`, { reason });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.13 Suivre une commande (endpoint public)
 * GET /api/orders/orders/{order_number}/track/
 * @param {string} orderNumber - Numéro de commande
 * @returns {Promise<Object>} Infos de suivi de la commande
 */
export const trackOrder = async (orderNumber) => {
  try {
    const response = await api.get(`${ORDERS_ENDPOINT}/${orderNumber}/track/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.14 Obtenir les statistiques des commandes
 * GET /api/orders/orders/statistics/
 * @returns {Promise<Object>} Statistiques globales
 */
export const getOrdersStatistics = async () => {
  try {
    const response = await api.get(`${ORDERS_ENDPOINT}/statistics/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * ============================================================================
 * SECTION PANIERS (Carts)
 * ============================================================================
 */

/**
 * 2.1 Lister tous les paniers
 * GET /api/orders/carts/
 * @param {string} deviceId - ID d'appareil (optionnel)
 * @returns {Promise<Array>} Liste des paniers
 */
export const getCarts = async (deviceId = null) => {
  try {
    const params = deviceId ? { device_id: deviceId } : {};
    const response = await api.get(CARTS_ENDPOINT, { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 2.2 Obtenir ou créer le panier de l'appareil
 * GET/POST /api/orders/carts/my_cart/
 * @param {string} deviceId - ID de l'appareil
 * @returns {Promise<Object>} Panier de l'appareil
 */
export const getMyCart = async (deviceId) => {
  try {
    const response = await api.get(`${CARTS_ENDPOINT}/my_cart/`, {
      params: { device_id: deviceId }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 2.2 (POST) Créer le panier pour un nouvel appareil
 * POST /api/orders/carts/my_cart/
 * @param {string} deviceId - ID de l'appareil
 * @returns {Promise<Object>} Panier créé
 */
export const createMyCart = async (deviceId) => {
  try {
    const response = await api.post(`${CARTS_ENDPOINT}/my_cart/`, {
      device_id: deviceId
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 2.3 Ajouter un article au panier
 * POST /api/orders/carts/{id}/add_item/
 * @param {number} cartId - ID du panier
 * @param {number} menuItemId - ID du plat
 * @param {number} sizeId - ID du format
 * @param {number} quantity - Quantité
 * @param {string} specialInstructions - Instructions spéciales (optionnel)
 * @returns {Promise<Object>} Panier mis à jour
 */
export const addItemToCart = async (cartId, menuItemId, sizeId, quantity, specialInstructions = '') => {
  try {
    const response = await api.post(`${CARTS_ENDPOINT}/${cartId}/add_item/`, {
      menu_item_id: menuItemId,
      size_id: sizeId,
      quantity,
      special_instructions: specialInstructions
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 2.4 Mettre à jour la quantité d'un article
 * POST /api/orders/carts/{id}/update_item/
 * @param {number} cartId - ID du panier
 * @param {number} itemId - ID de l'article dans le panier
 * @param {number} quantity - Nouvelle quantité (0 pour supprimer)
 * @returns {Promise<Object>} Panier mis à jour
 */
export const updateCartItem = async (cartId, itemId, quantity) => {
  try {
    const response = await api.post(`${CARTS_ENDPOINT}/${cartId}/update_item/`, {
      item_id: itemId,
      quantity
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 2.5 Supprimer un article du panier
 * POST /api/orders/carts/{id}/remove_item/
 * @param {number} cartId - ID du panier
 * @param {number} itemId - ID de l'article
 * @returns {Promise<Object>} Panier mis à jour
 */
export const removeCartItem = async (cartId, itemId) => {
  try {
    const response = await api.post(`${CARTS_ENDPOINT}/${cartId}/remove_item/`, {
      item_id: itemId
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 2.6 Vider le panier
 * POST /api/orders/carts/{id}/clear/
 * @param {number} cartId - ID du panier
 * @returns {Promise<Object>} Panier vide
 */
export const clearCart = async (cartId) => {
  try {
    const response = await api.post(`${CARTS_ENDPOINT}/${cartId}/clear/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 2.7 Effectuer le checkout (panier → commande)
 * POST /api/orders/carts/{id}/checkout/
 * @param {number} cartId - ID du panier
 * @param {Object} checkoutData - Données de livraison
 * @param {string} checkoutData.delivery_address - Adresse
 * @param {number} checkoutData.delivery_latitude - Latitude
 * @param {number} checkoutData.delivery_longitude - Longitude
 * @param {string} checkoutData.delivery_description - Description
 * @param {string} checkoutData.customer_name - Nom du client
 * @param {string} checkoutData.customer_phone - Téléphone
 * @param {string} checkoutData.customer_email - Email
 * @param {string} checkoutData.delivery_fee - Frais de livraison
 * @param {string} checkoutData.notes - Notes (optionnel)
 * @returns {Promise<Object>} Commande créée
 */
export const checkoutCart = async (cartId, checkoutData) => {
  try {
    const response = await api.post(`${CARTS_ENDPOINT}/${cartId}/checkout/`, checkoutData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * ============================================================================
 * SECTION PAIEMENTS (Payments)
 * ============================================================================
 */

const PAYMENTS_ENDPOINT = '/payments';

/**
 * Créer un paiement pour une commande
 * POST /api/payments/
 * @param {number} orderId - ID de la commande
 * @param {string} amount - Montant à payer
 * @param {string} paymentMethod - Méthode de paiement (orange_money, mtn_money, etc.)
 * @returns {Promise<Object>} Détails du paiement créé
 */
export const createPayment = async (orderId, amount, paymentMethod) => {
  try {
    const response = await api.post(PAYMENTS_ENDPOINT, {
      order: orderId,
      amount: amount,
      payment_method: paymentMethod
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupérer les détails d'un paiement
 * GET /api/payments/{id}/
 * @param {number} paymentId - ID du paiement
 * @returns {Promise<Object>} Détails du paiement
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await api.get(`${PAYMENTS_ENDPOINT}/${paymentId}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Vérifier le statut d'un paiement
 * GET /api/payments/{id}/check_status/
 * @param {number} paymentId - ID du paiement
 * @returns {Promise<Object>} Statut du paiement
 */
export const checkPaymentStatus = async (paymentId) => {
  try {
    const response = await api.get(`${PAYMENTS_ENDPOINT}/${paymentId}/check_status/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Lister les paiements avec filtres optionnels
 * GET /api/payments/
 * @param {Object} filters - Filtres optionnels
 * @param {number} filters.order_id - Filtrer par ID de commande
 * @param {string} filters.status - Filtrer par statut
 * @param {string} filters.payment_method - Filtrer par méthode
 * @returns {Promise<Array>} Liste des paiements
 */
export const listPayments = async (filters = {}) => {
  try {
    const response = await api.get(PAYMENTS_ENDPOINT, { params: filters });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Obtenir les statistiques des paiements
 * GET /api/payments/statistics/
 * @returns {Promise<Object>} Statistiques des paiements
 */
export const getPaymentStatistics = async () => {
  try {
    const response = await api.get(`${PAYMENTS_ENDPOINT}/statistics/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * ============================================================================
 * HELPERS ET UTILITAIRES
 * ============================================================================
 */

/**
 * Obtenir ou créer le panier pour un device
 * Fonction helper combinant les deux appels
 * @param {string} deviceId - ID de l'appareil
 * @returns {Promise<Object>} Panier de l'appareil
 */
export const getOrCreateCart = async (deviceId) => {
  try {
    // Essayer d'abord de récupérer le panier existant
    return await getMyCart(deviceId);
  } catch (error) {
    // Si le panier n'existe pas, le créer
    if (error.status === 404) {
      return await createMyCart(deviceId);
    }
    throw error;
  }
};

/**
 * Convertir les articles du panier au format attendu par createOrder
 * @param {Array} cartItems - Articles du panier
 * @returns {Array} Articles formatés
 */
export const formatCartItemsForOrder = (cartItems) => {
  return cartItems.map(item => ({
    size_id: item.size,
    quantity: item.quantity,
    special_instructions: item.special_instructions || ''
  }));
};

/**
 * Statuts des commandes
 */
export const ORDER_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  READY: 'ready',
  ASSIGNED: 'assigned',
  IN_DELIVERY: 'in_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUSED: 'refused'
};

/**
 * Affichage des statuts en français
 */
export const ORDER_STATUS_LABELS = {
  pending: 'En attente',
  accepted: 'Acceptée',
  preparing: 'En préparation',
  ready: 'Prête',
  assigned: 'Assignée',
  in_delivery: 'En cours de livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refused: 'Refusée'
};

/**
 * Vérifier si une commande peut être annulée
 * @param {string} status - Statut de la commande
 * @returns {boolean}
 */
export const canCancelOrder = (status) => {
  const nonCancellableStatuses = ['delivered', 'cancelled', 'refused'];
  return !nonCancellableStatuses.includes(status);
};

/**
 * Vérifier si une commande est terminée
 * @param {string} status - Statut de la commande
 * @returns {boolean}
 */
export const isOrderCompleted = (status) => {
  const completedStatuses = ['delivered', 'cancelled', 'refused'];
  return completedStatuses.includes(status);
};

/**
 * Vérifier si une commande est en cours
 * @param {string} status - Statut de la commande
 * @returns {boolean}
 */
export const isOrderActive = (status) => {
  const activeStatuses = ['accepted', 'preparing', 'ready', 'assigned', 'in_delivery'];
  return activeStatuses.includes(status);
};

/**
 * Constantes pour les méthodes de paiement
 */
export const PAYMENT_METHODS = {
  ORANGE_MONEY: 'orange_money',
  MTN_MONEY: 'mtn_money',
  MOOV_MONEY: 'moov_money',
  CARD: 'card',
  CASH: 'cash'
};

/**
 * Constantes pour les statuts de paiement
 */
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

/**
 * Labels pour les statuts de paiement
 */
export const PAYMENT_STATUS_LABELS = {
  pending: 'En attente',
  processing: 'En cours',
  completed: 'Complété',
  failed: 'Échoué',
  cancelled: 'Annulé',
  refunded: 'Remboursé'
};

export default {
  // Orders
  getOrders,
  createOrder,
  getOrderDetails,
  updateOrder,
  deleteOrder,
  getPendingOrders,
  getActiveOrders,
  acceptOrder,
  refuseOrder,
  startPreparingOrder,
  markOrderReady,
  cancelOrder,
  trackOrder,
  getOrdersStatistics,
  // Carts
  getCarts,
  getMyCart,
  createMyCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  checkoutCart,
  // Payments
  createPayment,
  getPaymentDetails,
  checkPaymentStatus,
  listPayments,
  getPaymentStatistics,
  // Helpers
  getOrCreateCart,
  formatCartItemsForOrder,
  // Constants
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  canCancelOrder,
  isOrderCompleted,
  isOrderActive
};
