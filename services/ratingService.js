// ratingService.js - Service pour la gestion des notes de livraison et plats
// Basé sur la documentation API - Module Ratings

import api, { handleApiError } from './api';

const RATINGS_BASE_URL = '/ratings';
const DELIVERY_RATINGS_ENDPOINT = `${RATINGS_BASE_URL}/delivery-ratings/`;
const MENU_ITEM_RATINGS_ENDPOINT = `${RATINGS_BASE_URL}/menu-item-ratings/`;

/**
 * ============================================================================
 * SECTION NOTES DE LIVRAISON (Delivery Ratings)
 * ============================================================================
 */

/**
 * 1.1 Lister les notes de livraison /apidelivery-ratings/
 * GET /api/delivery-ratings/
 * @param {Object} filters - Filtres optionnels
 * @param {number} filters.delivery_person_id - Filtrer par ID du livreur
 * @param {string} filters.device_id - Filtrer par device_id STRING (ex: "android_A50_de_Billa_1764280348580")
 * @param {number} filters.order_id - Filtrer par ID de commande
 * @returns {Promise<Array>} Liste des notes de livraison
 */
export const getDeliveryRatings = async (filters = {}) => {
  try {
    const response = await api.get(DELIVERY_RATINGS_ENDPOINT, { params: filters });
    const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
    console.log('⭐ getDeliveryRatings retourne:', data.length, 'notes');
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.2 Créer une note de livraison
 * POST /api/delivery-ratings/
 * @param {Object} ratingData - Données de notation
 * @param {number} ratingData.order - ID de la commande
 * @param {string} ratingData.device - String identifiant du device (ex: "android_A50_de_Billa_1764280348580")
 * @param {number} ratingData.delivery_person - ID du livreur
 * @param {number} ratingData.rating - Note globale (1-5)
 * @param {string} ratingData.comment - Commentaire (optionnel)
 * @param {number} ratingData.speed_rating - Note de rapidité (1-5, optionnel)
 * @param {number} ratingData.professionalism_rating - Note de professionnalisme (1-5, optionnel)
 * @returns {Promise<Object>} Note créée
 */
export const createDeliveryRating = async (ratingData) => {
  try {
    const response = await api.post(DELIVERY_RATINGS_ENDPOINT, ratingData);
    console.log('✅ Note de livraison créée');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.3 Obtenir les détails d'une note de livraison
 * GET /api/delivery-ratings/{id}/
 * @param {number} ratingId - ID de la note
 * @returns {Promise<Object>} Détails de la note
 */
export const getDeliveryRatingDetails = async (ratingId) => {
  try {
    const response = await api.get(`${DELIVERY_RATINGS_ENDPOINT}/${ratingId}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.4 Modifier une note de livraison
 * PATCH /api/delivery-ratings/{id}/
 * @param {number} ratingId - ID de la note
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Note mise à jour
 */
export const updateDeliveryRating = async (ratingId, updateData) => {
  try {
    const response = await api.patch(`${DELIVERY_RATINGS_ENDPOINT}${ratingId}/`, updateData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.5 Supprimer une note de livraison
 * DELETE /api/delivery-ratings/{id}/
 * @param {number} ratingId - ID de la note
 * @returns {Promise<void>}
 */
export const deleteDeliveryRating = async (ratingId) => {
  try {
    await api.delete(`${DELIVERY_RATINGS_ENDPOINT}/${ratingId}/`);
    console.log(' Note de livraison supprimée');
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 1.6 Obtenir les notes par livreur
 * GET /api/delivery-ratings/by_delivery_person/?delivery_person_id={id}
 * @param {number} deliveryPersonId - ID du livreur
 * @returns {Promise<Object>} Notes et statistiques du livreur
 */
export const getDeliveryPersonRatings = async (deliveryPersonId) => {
  try {
    const response = await api.get(`${DELIVERY_RATINGS_ENDPOINT}/by_delivery_person/`, {
      params: { delivery_person_id: deliveryPersonId }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * ============================================================================
 * SECTION NOTES DE PLATS (Menu Item Ratings)
 * ============================================================================
 */

/**
 * 2.1 Lister les notes de plats
 * GET /api/menu-item-ratings/
 * @param {Object} filters - Filtres optionnels
 * @param {number} filters.menu_item_id - Filtrer par ID du plat
 * @param {string} filters.device_id - Filtrer par device_id STRING (ex: "android_A50_de_Billa_1764280348580")
 * @param {number} filters.order_id - Filtrer par ID de commande
 * @returns {Promise<Array>} Liste des notes de plats
 */
export const getMenuItemRatings = async (filters = {}) => {
  try {
    const response = await api.get(MENU_ITEM_RATINGS_ENDPOINT, { params: filters });
    const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
    console.log(' getMenuItemRatings retourne:', data.length, 'notes');
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 2.2 Créer une note de plat
 * POST /api/menu-item-ratings/
 * @param {Object} ratingData - Données de notation
 * @param {number} ratingData.order_item - ID de l'article de commande
 * @param {number} ratingData.order - ID de la commande
 * @param {string} ratingData.device - String identifiant du device (ex: "android_A50_de_Billa_1764280348580")
 * @param {number} ratingData.menu_item - ID du plat
 * @param {number} ratingData.rating - Note globale (1-5)
 * @param {string} ratingData.comment - Commentaire (optionnel)
 * @param {number} ratingData.taste_rating - Note de goût (1-5, optionnel)
 * @param {number} ratingData.presentation_rating - Note de présentation (1-5, optionnel)
 * @param {number} ratingData.portion_rating - Note de portion (1-5, optionnel)
 * @returns {Promise<Object>} Note créée
 */
export const createMenuItemRating = async (ratingData) => {
  try {
    const response = await api.post(MENU_ITEM_RATINGS_ENDPOINT, ratingData);
    console.log(' Note de plat créée');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 2.3 Obtenir les détails d'une note de plat
 * GET /api/menu-item-ratings/{id}/
 * @param {number} ratingId - ID de la note
 * @returns {Promise<Object>} Détails de la note
 */
export const getMenuItemRatingDetails = async (ratingId) => {
  try {
    const response = await api.get(`${MENU_ITEM_RATINGS_ENDPOINT}/${ratingId}/`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 2.4 Modifier une note de plat
 * PATCH /api/menu-item-ratings/{id}/
 * @param {number} ratingId - ID de la note
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Note mise à jour
 */
export const updateMenuItemRating = async (ratingId, updateData) => {
  try {
    const response = await api.patch(`${MENU_ITEM_RATINGS_ENDPOINT}/${ratingId}/`, updateData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 2.5 Supprimer une note de plat
 * DELETE /api/menu-item-ratings/{id}/
 * @param {number} ratingId - ID de la note
 * @returns {Promise<void>}
 */
export const deleteMenuItemRating = async (ratingId) => {
  try {
    await api.delete(`${MENU_ITEM_RATINGS_ENDPOINT}/${ratingId}/`);
    console.log(' Note de plat supprimée');
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 2.6 Noter plusieurs plats en une fois
 * POST /api/menu-item-ratings/rate_order_items/
 * @param {Object} ratingData - Données de notation
 * @param {number} ratingData.order_id - ID de la commande
 * @param {Array} ratingData.items - Liste des notes à créer
 * @returns {Promise<Object>} Notes créées avec résumé des erreurs
 */
export const rateOrderItems = async (ratingData) => {
  try {
    const response = await api.post(`${MENU_ITEM_RATINGS_ENDPOINT}/rate_order_items/`, ratingData);
    console.log(' Notes de plats créées:', response.data.created?.length, 'articles');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * 2.7 Obtenir les notes par plat
 * GET /api/menu-item-ratings/by_menu_item/?menu_item_id={id}
 * @param {number} menuItemId - ID du plat
 * @returns {Promise<Object>} Notes et statistiques du plat
 */
export const getMenuItemRatingsByItem = async (menuItemId) => {
  try {
    const response = await api.get(`${MENU_ITEM_RATINGS_ENDPOINT}/by_menu_item/`, {
      params: { menu_item_id: menuItemId }
    });
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
 * Obtenir les données de l'appareil pour les notes
 * @returns {Promise<number>} ID de l'appareil
 */
export const getDeviceId = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const deviceId = await AsyncStorage.getItem('device_id');
    return deviceId ? parseInt(deviceId) : null;
  } catch (error) {
    console.error('Erreur récupération device_id:', error);
    return null;
  }
};

/**
 * Échelle de notation
 */
export const RATING_SCALES = {
  EXCELLENT: 5,
  VERY_GOOD: 4,
  GOOD: 3,
  FAIR: 2,
  POOR: 1
};

/**
 * Labels pour les échelles de notation
 */
export const RATING_LABELS = {
  5: 'Excellent',
  4: 'Très bien',
  3: 'Bien',
  2: 'Passable',
  1: 'Mauvais'
};

/**
 * Critères de notation des livraisons
 */
export const DELIVERY_RATING_CRITERIA = {
  OVERALL: 'rating',
  SPEED: 'speed_rating',
  PROFESSIONALISM: 'professionalism_rating'
};

/**
 * Labels pour les critères de livraison
 */
export const DELIVERY_CRITERIA_LABELS = {
  rating: 'Évaluation générale',
  speed_rating: 'Rapidité de livraison',
  professionalism_rating: 'Professionnalisme'
};

/**
 * Critères de notation des plats
 */
export const MENU_ITEM_RATING_CRITERIA = {
  OVERALL: 'rating',
  TASTE: 'taste_rating',
  PRESENTATION: 'presentation_rating',
  PORTION: 'portion_rating'
};

/**
 * Labels pour les critères de plats
 */
export const MENU_ITEM_CRITERIA_LABELS = {
  rating: 'Évaluation générale',
  taste_rating: 'Goût',
  presentation_rating: 'Présentation',
  portion_rating: 'Portion'
};

export default {
  // Delivery Ratings
  getDeliveryRatings,
  createDeliveryRating,
  getDeliveryRatingDetails,
  updateDeliveryRating,
  deleteDeliveryRating,
  getDeliveryPersonRatings,
  // Menu Item Ratings
  getMenuItemRatings,
  createMenuItemRating,
  getMenuItemRatingDetails,
  updateMenuItemRating,
  deleteMenuItemRating,
  rateOrderItems,
  getMenuItemRatingsByItem,
  // Helpers
  getDeviceId,
  // Constants
  RATING_SCALES,
  RATING_LABELS,
  DELIVERY_RATING_CRITERIA,
  DELIVERY_CRITERIA_LABELS,
  MENU_ITEM_RATING_CRITERIA,
  MENU_ITEM_CRITERIA_LABELS,
};
