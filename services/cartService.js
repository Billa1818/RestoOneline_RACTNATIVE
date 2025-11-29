// ============================================
// services/cartService.js
// Service de gestion du panier avec API
// ============================================
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cartService = {
  /**
   * Récupérer ou créer le panier de l'appareil
   * @param {string} deviceId - ID de l'appareil
   * @returns {Promise<Object>}
   */
  getOrCreateCart: async (deviceId) => {
    try {
      const response = await api.get('/orders/carts/my_cart/', {
        params: { device_id: deviceId },
      });
      
      console.log(' Panier récupéré:', response.data.total_items, 'articles');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Erreur panier:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  },

  /**
   * Ajouter un article au panier
   * @param {number} cartId - ID du panier
   * @param {number} menuItemId - ID du plat
   * @param {number} sizeId - ID du format
   * @param {number} quantity - Quantité
   * @param {string} specialInstructions - Instructions spéciales
   * @returns {Promise<Object>}
   */
  addItemToCart: async (cartId, menuItemId, sizeId, quantity, specialInstructions = '') => {
    try {
      const response = await api.post(`/orders/carts/${cartId}/add_item/`, {
        menu_item_id: menuItemId,
        size_id: sizeId,
        quantity: quantity,
        special_instructions: specialInstructions,
      });
      
      console.log(' Article ajouté au panier');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Erreur ajout article:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null,
      };
    }
  },

  /**
   * Mettre à jour la quantité d'un article
   * @param {number} cartId - ID du panier
   * @param {number} itemId - ID de l'article du panier
   * @param {number} quantity - Nouvelle quantité
   * @returns {Promise<Object>}
   */
  updateCartItemQuantity: async (cartId, itemId, quantity) => {
    try {
      const response = await api.post(`/orders/carts/${cartId}/update_item/`, {
        item_id: itemId,
        quantity: quantity,
      });
      
      console.log(' Article mis à jour');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Erreur mise à jour article:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  },

  /**
   * Retirer un article du panier
   * @param {number} cartId - ID du panier
   * @param {number} itemId - ID de l'article du panier
   * @returns {Promise<Object>}
   */
  removeItemFromCart: async (cartId, itemId) => {
    try {
      const response = await api.post(`/orders/carts/${cartId}/remove_item/`, {
        item_id: itemId,
      });
      
      console.log(' Article retiré du panier');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Erreur suppression article:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  },

  /**
   * Vider le panier
   * @param {number} cartId - ID du panier
   * @returns {Promise<Object>}
   */
  clearCart: async (cartId) => {
    try {
      const response = await api.post(`/orders/carts/${cartId}/clear/`);
      
      console.log(' Panier vidé');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Erreur vidage panier:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  },

  /**
   * Transformer le panier en commande (checkout)
   * @param {number} cartId - ID du panier
   * @param {Object} orderData - Données de la commande
   * @returns {Promise<Object>}
   */
  checkout: async (cartId, orderData) => {
    try {
      const response = await api.post(`/orders/carts/${cartId}/checkout/`, {
        delivery_address: orderData.delivery_address,
        delivery_latitude: orderData.delivery_latitude,
        delivery_longitude: orderData.delivery_longitude,
        delivery_description: orderData.delivery_description || '',
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email || '',
        delivery_fee: orderData.delivery_fee || '0.00',
        notes: orderData.notes || '',
      });
      
      console.log(' Commande créée:', response.data.order_number);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Erreur checkout:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null,
      };
    }
  },

  /**
   * Obtenir le device_id
   * @returns {Promise<string>}
   */
  getDeviceId: async () => {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}`;
        await AsyncStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error(' Erreur device_id:', error);
      return null;
    }
  },
};

export default cartService;
