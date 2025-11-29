// ============================================
// services/MenuService.js - Avec support pagination et gestion images
// ============================================
import api, { handleApiError, createFormDataRequest, fileUploadConfig, API_BASE_URL } from './api';

/**
 * Convertit un chemin d'image relatif en URL complète
 * @param {string} imagePath - Chemin de l'image (ex: "/media/menu_items/image.png")
 * @returns {string|null} URL complète ou null
 */
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

/**
 * Transforme un objet plat/catégorie pour ajouter l'URL complète de l'image
 * @param {Object} item - Item du menu ou catégorie
 * @returns {Object} Item avec URL d'image complète
 */
const transformItemWithImage = (item) => {
  if (!item) return item;
  return {
    ...item,
    image: getFullImageUrl(item.image),
  };
};

/**
 * Extrait les données d'une réponse paginée ou non
 * Django REST Framework retourne soit:
 * - Un tableau direct: [...]
 * - Un objet paginé: { count, next, previous, results: [...] }
 */
const extractData = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }
  if (responseData && responseData.results) {
    return responseData.results;
  }
  return responseData;
};

const MenuService = {
  // ==================== CATÉGORIES ====================
  
  /**
   * Récupère la liste de toutes les catégories
   * @returns {Promise} Liste des catégories
   */
  getCategories: async () => {
    try {
      console.log('📡 GET /menu/categories/');
      const response = await api.get('/menu/categories/');
      
      // Extraire les données (gérer la pagination)
      const data = extractData(response.data);
      
      // Transformer les URLs d'images
      const transformedData = Array.isArray(data) 
        ? data.map(transformItemWithImage)
        : data;
      
      console.log('✅ Catégories reçues:', transformedData?.length || 0);
      return { success: true, data: transformedData };
    } catch (error) {
      console.error('❌ Erreur getCategories:', error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Récupère les détails d'une catégorie
   * @param {string} slug - Slug de la catégorie
   * @returns {Promise} Détails de la catégorie
   */
  getCategoryBySlug: async (slug) => {
    try {
      console.log(` GET /menu/categories/${slug}/`);
      const response = await api.get(`/menu/categories/${slug}/`);
      return { 
        success: true, 
        data: transformItemWithImage(response.data) 
      };
    } catch (error) {
      console.error(` Erreur getCategoryBySlug(${slug}):`, error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Crée une nouvelle catégorie
   * @param {Object} categoryData - Données de la catégorie
   * @returns {Promise} Catégorie créée
   */
  createCategory: async (categoryData) => {
    try {
      console.log(' POST /menu/categories/');
      const formData = createFormDataRequest(categoryData);
      const response = await api.post('/menu/categories/', formData, fileUploadConfig);
      return { 
        success: true, 
        data: transformItemWithImage(response.data) 
      };
    } catch (error) {
      console.error(' Erreur createCategory:', error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Modifie une catégorie existante
   * @param {string} slug - Slug de la catégorie
   * @param {Object} categoryData - Données à modifier
   * @returns {Promise} Catégorie modifiée
   */
  updateCategory: async (slug, categoryData) => {
    try {
      console.log(` PATCH /menu/categories/${slug}/`);
      const formData = createFormDataRequest(categoryData);
      const response = await api.patch(`/menu/categories/${slug}/`, formData, fileUploadConfig);
      return { 
        success: true, 
        data: transformItemWithImage(response.data) 
      };
    } catch (error) {
      console.error(` Erreur updateCategory(${slug}):`, error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Supprime une catégorie
   * @param {string} slug - Slug de la catégorie
   * @returns {Promise} Résultat de la suppression
   */
  deleteCategory: async (slug) => {
    try {
      console.log(` DELETE /menu/categories/${slug}/`);
      await api.delete(`/menu/categories/${slug}/`);
      return { success: true };
    } catch (error) {
      console.error(` Erreur deleteCategory(${slug}):`, error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Récupère les plats d'une catégorie
   * @param {string} slug - Slug de la catégorie
   * @returns {Promise} Liste des plats de la catégorie
   */
  getCategoryItems: async (slug) => {
    try {
      console.log(` GET /menu/categories/${slug}/items/`);
      const response = await api.get(`/menu/categories/${slug}/items/`);
      const data = extractData(response.data);
      
      // Transformer les URLs d'images
      const transformedData = Array.isArray(data) 
        ? data.map(transformItemWithImage)
        : data;
      
      return { success: true, data: transformedData };
    } catch (error) {
      console.error(` Erreur getCategoryItems(${slug}):`, error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  // ==================== PLATS DU MENU ====================

  /**
   * Récupère la liste des plats avec filtres optionnels
   * @param {Object} filters - Filtres optionnels
   * @param {string} filters.category - Slug de la catégorie
   * @param {boolean} filters.is_available - Disponibilité
   * @param {string} filters.search - Terme de recherche
   * @returns {Promise} Liste des plats
   */
  getMenuItems: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.is_available !== undefined) params.append('is_available', filters.is_available);
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      console.log(` GET /menu/items/${queryString}`);
      
      const response = await api.get(`/menu/items/${queryString}`);
      const data = extractData(response.data);
      
      // Transformer les URLs d'images
      const transformedData = Array.isArray(data) 
        ? data.map(transformItemWithImage)
        : data;
      
      console.log(' Plats reçus:', transformedData?.length || 0);
      return { success: true, data: transformedData };
    } catch (error) {
      console.error(' Erreur getMenuItems:', error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Récupère les détails d'un plat
   * @param {string} slug - Slug du plat
   * @returns {Promise} Détails du plat
   */
  getMenuItemBySlug: async (slug) => {
    try {
      console.log(` GET /menu/items/${slug}/`);
      const response = await api.get(`/menu/items/${slug}/`);
      return { 
        success: true, 
        data: transformItemWithImage(response.data) 
      };
    } catch (error) {
      console.error(` Erreur getMenuItemBySlug(${slug}):`, error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Crée un nouveau plat avec ses formats
   * @param {Object} itemData - Données du plat
   * @returns {Promise} Plat créé
   */
  createMenuItem: async (itemData) => {
    try {
      console.log(' POST /menu/items/');
      const formData = createFormDataRequest(itemData);
      const response = await api.post('/menu/items/', formData, fileUploadConfig);
      return { 
        success: true, 
        data: transformItemWithImage(response.data) 
      };
    } catch (error) {
      console.error(' Erreur createMenuItem:', error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Modifie un plat existant
   * @param {string} slug - Slug du plat
   * @param {Object} itemData - Données à modifier
   * @returns {Promise} Plat modifié
   */
  updateMenuItem: async (slug, itemData) => {
    try {
      console.log(` PATCH /menu/items/${slug}/`);
      const formData = createFormDataRequest(itemData);
      const response = await api.patch(`/menu/items/${slug}/`, formData, fileUploadConfig);
      return { 
        success: true, 
        data: transformItemWithImage(response.data) 
      };
    } catch (error) {
      console.error(` Erreur updateMenuItem(${slug}):`, error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Supprime un plat
   * @param {string} slug - Slug du plat
   * @returns {Promise} Résultat de la suppression
   */
  deleteMenuItem: async (slug) => {
    try {
      console.log(` DELETE /menu/items/${slug}/`);
      await api.delete(`/menu/items/${slug}/`);
      return { success: true };
    } catch (error) {
      console.error(` Erreur deleteMenuItem(${slug}):`, error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Récupère les plats populaires (top 10)
   * @returns {Promise} Liste des plats populaires
   */
 getPopularItems: async () => {
  try {
    // Changez cette ligne
    const response = await api.get('/menu/items/?is_popular=true');
    
    const data = extractData(response.data);
    
    // Transformer les URLs d'images
    const transformedData = Array.isArray(data) 
      ? data.map(transformItemWithImage)
      : data;
    return { success: true, data: transformedData };
  } catch (error) {
    const errorInfo = handleApiError(error);
    return { success: false, error: errorInfo };
  }
},

  /**
   * Récupère les plats les mieux notés (top 10)
   * @returns {Promise} Liste des plats les mieux notés
   */
  getTopRatedItems: async () => {
    try {
      console.log(' GET /menu/items/top_rated/');
      const response = await api.get('/menu/items/top_rated/');
      const data = extractData(response.data);
      
      // Transformer les URLs d'images
      const transformedData = Array.isArray(data) 
        ? data.map(transformItemWithImage)
        : data;
      
      return { success: true, data: transformedData };
    } catch (error) {
      console.error(' Erreur getTopRatedItems:', error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Récupère les notes et avis d'un plat
   * @param {string} slug - Slug du plat
   * @returns {Promise} Notes et avis du plat
   */
  getMenuItemRatings: async (slug) => {
    try {
      console.log(` GET /menu/items/${slug}/ratings/`);
      const response = await api.get(`/menu/items/${slug}/ratings/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(` Erreur getMenuItemRatings(${slug}):`, error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Bascule la disponibilité d'un plat
   * @param {string} slug - Slug du plat
   * @returns {Promise} Nouveau statut de disponibilité
   */
  toggleMenuItemAvailability: async (slug) => {
    try {
      console.log(` POST /menu/items/${slug}/toggle_availability/`);
      const response = await api.post(`/menu/items/${slug}/toggle_availability/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(` Erreur toggleMenuItemAvailability(${slug}):`, error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  // ==================== FORMATS DE PLATS ====================

  /**
   * Récupère la liste des formats avec filtre optionnel
   * @param {number} menuItemId - ID du plat (optionnel)
   * @returns {Promise} Liste des formats
   */
  getMenuSizes: async (menuItemId = null) => {
    try {
      const params = menuItemId ? `?menu_item=${menuItemId}` : '';
      console.log(` GET /menu/sizes/${params}`);
      const response = await api.get(`/menu/sizes/${params}`);
      const data = extractData(response.data);
      return { success: true, data };
    } catch (error) {
      console.error(' Erreur getMenuSizes:', error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Récupère les détails d'un format
   * @param {number} id - ID du format
   * @returns {Promise} Détails du format
   */
  getMenuSizeById: async (id) => {
    try {
      console.log(` GET /menu/sizes/${id}/`);
      const response = await api.get(`/menu/sizes/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(` Erreur getMenuSizeById(${id}):`, error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Crée un nouveau format pour un plat
   * @param {Object} sizeData - Données du format
   * @returns {Promise} Format créé
   */
  createMenuSize: async (sizeData) => {
    try {
      console.log(' POST /menu/sizes/');
      const response = await api.post('/menu/sizes/', sizeData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(' Erreur createMenuSize:', error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Modifie un format existant
   * @param {number} id - ID du format
   * @param {Object} sizeData - Données à modifier
   * @returns {Promise} Format modifié
   */
  updateMenuSize: async (id, sizeData) => {
    try {
      console.log(` PATCH /menu/sizes/${id}/`);
      const response = await api.patch(`/menu/sizes/${id}/`, sizeData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(` Erreur updateMenuSize(${id}):`, error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Supprime un format
   * @param {number} id - ID du format
   * @returns {Promise} Résultat de la suppression
   */
  deleteMenuSize: async (id) => {
    try {
      console.log(` DELETE /menu/sizes/${id}/`);
      await api.delete(`/menu/sizes/${id}/`);
      return { success: true };
    } catch (error) {
      console.error(` Erreur deleteMenuSize(${id}):`, error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },

  /**
   * Bascule la disponibilité d'un format
   * @param {number} id - ID du format
   * @returns {Promise} Nouveau statut de disponibilité
   */
  toggleMenuSizeAvailability: async (id) => {
    try {
      console.log(` POST /menu/sizes/${id}/toggle_availability/`);
      const response = await api.post(`/menu/sizes/${id}/toggle_availability/`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(` Erreur toggleMenuSizeAvailability(${id}):`, error);
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo };
    }
  },
};

export default MenuService;