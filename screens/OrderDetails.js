// ============================================
// screens/OrderDetails.js - Détails d'une commande
// ============================================
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    TextInput,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as orderService from '../services/orderService';
import * as ratingService from '../services/ratingService';
import * as deviceService from '../services/deviceService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as deviceUtils from '../utils/deviceUtils';

export default function OrderDetails({ route, navigation }) {
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [showPaymentMethods, setShowPaymentMethods] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [deviceId, setDeviceId] = useState(null);
    const [ratingType, setRatingType] = useState(null); // 'delivery' ou 'items'
    const [deliveryRating, setDeliveryRating] = useState({
        rating: 0,
        speed_rating: 0,
        professionalism_rating: 0,
        comment: '',
    });
    const [itemsRatings, setItemsRatings] = useState({});
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    useEffect(() => {
        loadOrderDetails();
        loadDeviceId();
    }, []);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            const result = await orderService.getOrderDetails(orderId);
            setOrder(result);
            console.log('✅ Détails commande chargés');

            // Initialiser les ratings pour les articles si la commande est livrée
            if (result.status === 'delivered' && result.items) {
                const initialRatings = {};
                result.items.forEach((item, idx) => {
                    initialRatings[idx] = {
                        rating: 0,
                        taste_rating: 0,
                        presentation_rating: 0,
                        portion_rating: 0,
                        comment: '',
                    };
                });
                setItemsRatings(initialRatings);
            }
        } catch (error) {
            console.error('❌ Erreur chargement détails:', error);
            Alert.alert('Erreur', 'Impossible de charger les détails de la commande');
        } finally {
            setLoading(false);
        }
    };

    const loadDeviceId = async () => {
      try {
        // 1. Obtenir l'ID numérique sauvegardé (depuis login)
        let numericId = await deviceService.getDeviceNumericId();
        
        if (numericId) {
          console.log('✅ Device numeric ID trouvé:', numericId);
          setDeviceId(numericId);
          return;
        }

        // 2. Générer UUID et enregistrer
        const uuid = await deviceUtils.getOrCreateDeviceId();
        console.log('📱 UUID généré:', uuid);
        
        // 3. Enregistrer le device et récupérer l'ID numérique
        const device = await deviceService.registerOrGetDevice(uuid);
        
        if (device && device.id) {
          console.log('✅ Device ID numérique obtenu:', device.id);
          setDeviceId(device.id);
        } else {
          console.warn('⚠️ Impossible d\'obtenir device ID numérique');
          // Fallback à 1
          setDeviceId(1);
        }
      } catch (error) {
        console.error('❌ Erreur loadDeviceId:', error);
        // Fallback: utiliser 1
        setDeviceId(1);
      }
    };

    const handleCancelOrder = () => {
        Alert.alert(
            'Annuler la commande',
            'Êtes-vous sûr de vouloir annuler cette commande?',
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Oui, annuler',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await orderService.cancelOrder(orderId, 'Annulation par le client');
                            Alert.alert('Succès', 'Commande annulée');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible d\'annuler la commande');
                        }
                    },
                },
            ]
        );
    };

    const initiatePayment = async (method) => {
        if (!order) return;

        try {
            const payment = await orderService.createPayment(
                order.id,
                order.total,
                method
            );

            if (payment.paydunya_invoice_url) {
                setPaymentUrl(payment.paydunya_invoice_url);
                // Ouvrir l'URL de paiement
                Linking.openURL(payment.paydunya_invoice_url);
            } else {
                Alert.alert('Succès', 'Paiement initié. Veuillez suivre les instructions.');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible d\'initier le paiement');
        }
    };

    const handleOpenRatingModal = (type) => {
        setRatingType(type);
        setShowRatingModal(true);
    };

    const handleCloseRatingModal = () => {
        setShowRatingModal(false);
        setRatingType(null);
        setDeliveryRating({
            rating: 0,
            speed_rating: 0,
            professionalism_rating: 0,
            comment: '',
        });
    };

    const handleSubmitDeliveryRating = async () => {
      if (!order) {
        Alert.alert('Erreur', 'Commande introuvable');
        return;
      }

      if (deliveryRating.rating === 0) {
        Alert.alert('Erreur', 'Veuillez donner une note globale');
        return;
      }

      // Vérifier le deviceId (devrait toujours être défini maintenant)
      if (!deviceId) {
        console.error('❌ Device ID undefined, tentative de rechargement');
        await loadDeviceId();
        if (!deviceId) {
          Alert.alert('Erreur', 'Impossible d\'identifier votre appareil.');
          return;
        }
      }

        setIsSubmittingRating(true);
        try {
            // Récupérer le device_id string (UUID)
            const deviceIdString = await AsyncStorage.getItem('device_id');
            const ratingData = {
                order: order.id,
                device: deviceIdString || deviceId.toString(),
                delivery_person: order.delivery_person?.id || order.delivery_person,
                rating: deliveryRating.rating,
                speed_rating: deliveryRating.speed_rating || deliveryRating.rating,
                professionalism_rating: deliveryRating.professionalism_rating || deliveryRating.rating,
                comment: deliveryRating.comment,
            };

            await ratingService.createDeliveryRating(ratingData);
            Alert.alert('Succès', 'Merci pour votre évaluation du livreur!');
            handleCloseRatingModal();
            loadOrderDetails();
        } catch (error) {
            console.error('❌ Erreur notation livraison:', error);
            Alert.alert('Erreur', error.message || 'Impossible de soumettre la notation');
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const handleSubmitItemsRatings = async () => {
      if (!order) {
        Alert.alert('Erreur', 'Commande introuvable');
        return;
      }

      // Vérifier qu'au moins un article a une note
      const hasAnyRating = Object.values(itemsRatings).some(r => r.rating > 0);
      if (!hasAnyRating) {
        Alert.alert('Erreur', 'Veuillez noter au moins un plat');
        return;
      }

      // Vérifier le deviceId (devrait toujours être défini maintenant)
      if (!deviceId) {
        console.error('❌ Device ID undefined, tentative de rechargement');
        await loadDeviceId();
        if (!deviceId) {
          Alert.alert('Erreur', 'Impossible d\'identifier votre appareil.');
          return;
        }
      }

        setIsSubmittingRating(true);
        try {
            const items = [];
            // Récupérer le device_id string (UUID)
            const deviceIdString = await AsyncStorage.getItem('device_id');
            order.items?.forEach((item, idx) => {
                if (itemsRatings[idx]?.rating > 0) {
                    items.push({
                        order_item: item.id,
                        device: deviceIdString || deviceId.toString(),
                        menu_item: item.menu_item?.id || item.menu_item,
                        rating: itemsRatings[idx].rating,
                        taste_rating: itemsRatings[idx].taste_rating || itemsRatings[idx].rating,
                        presentation_rating: itemsRatings[idx].presentation_rating || itemsRatings[idx].rating,
                        portion_rating: itemsRatings[idx].portion_rating || itemsRatings[idx].rating,
                        comment: itemsRatings[idx].comment,
                    });
                }
            });

            const result = await ratingService.rateOrderItems({
                order_id: order.id,
                items,
            });

            const createdCount = result.created?.length || 0;
            Alert.alert('Succès', `Merci! ${createdCount} plat(s) évalué(s).`);
            handleCloseRatingModal();
            loadOrderDetails();
        } catch (error) {
            console.error('❌ Erreur notation plats:', error);
            Alert.alert('Erreur', error.message || 'Impossible de soumettre les notations');
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#FF9800',
            accepted: '#2196F3',
            preparing: '#9C27B0',
            ready: '#4CAF50',
            assigned: '#03A9F4',
            in_delivery: '#FF5722',
            delivered: '#4CAF50',
            cancelled: '#F44336',
            refused: '#F44336',
        };
        return colors[status] || '#757575';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: 'time-outline',
            accepted: 'checkmark-circle-outline',
            preparing: 'flame-outline',
            ready: 'checkmark-done-outline',
            assigned: 'person-outline',
            in_delivery: 'bicycle-outline',
            delivered: 'home-outline',
            cancelled: 'close-circle-outline',
            refused: 'close-circle-outline',
        };
        return icons[status] || 'help-circle-outline';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#5D0EC0" />
                </View>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Commande non trouvée</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Détails de la commande</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Numéro et Statut */}
                <Card style={styles.card}>
                    <View style={styles.cardContent}>
                        <Text style={styles.orderNumber}>{order.order_number}</Text>
                        <View style={styles.statusRow}>
                            <Chip
                                icon={getStatusIcon(order.status)}
                                style={{
                                    backgroundColor: getStatusColor(order.status) + '20',
                                }}
                                textStyle={{ color: getStatusColor(order.status) }}
                            >
                                {order.status_display}
                            </Chip>
                            <Text style={styles.dateText}>{formatDate(order.created_at)}</Text>
                        </View>
                    </View>
                </Card>

                {/* Informations Client */}
                <Card style={styles.card}>
                    <View style={styles.sectionTitle}>
                        <Ionicons name="person-circle-outline" size={20} color="#5D0EC0" />
                        <Text style={styles.title}>Informations client</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Nom</Text>
                            <Text style={styles.value}>{order.customer_name}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Téléphone</Text>
                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${order.customer_phone}`)}>
                                <Text style={[styles.value, styles.link]}>{order.customer_phone}</Text>
                            </TouchableOpacity>
                        </View>
                        {order.customer_email && (
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Email</Text>
                                <Text style={styles.value}>{order.customer_email}</Text>
                            </View>
                        )}
                    </View>
                </Card>

                {/* Adresse de Livraison */}
                <Card style={styles.card}>
                    <View style={styles.sectionTitle}>
                        <Ionicons name="location-outline" size={20} color="#5D0EC0" />
                        <Text style={styles.title}>Adresse de livraison</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.addressText}>{order.delivery_address}</Text>
                        {order.delivery_description && (
                            <Text style={styles.descriptionText}>
                                📍 {order.delivery_description}
                            </Text>
                        )}
                    </View>
                </Card>

                {/* Articles */}
                <Card style={styles.card}>
                    <View style={styles.sectionTitle}>
                        <Ionicons name="bag-outline" size={20} color="#5D0EC0" />
                        <Text style={styles.title}>Articles</Text>
                    </View>
                    <View style={styles.cardContent}>
                        {order.items?.map((item, idx) => (
                            <View key={idx} style={styles.itemRow}>
                                {(item.menu_item_image || item.image || item.menu_item?.image) && (
                                    <Image
                                        source={{ uri: item.menu_item_image || item.image || item.menu_item?.image }}
                                        style={styles.itemImage}
                                    />
                                )}
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.item_name}</Text>
                                    <Text style={styles.itemSize}>{item.size_name}</Text>
                                    {item.special_instructions && (
                                        <Text style={styles.instructions}>
                                            Note: {item.special_instructions}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.itemPriceQty}>
                                    <Text style={styles.qty}>x{item.quantity}</Text>
                                    <Text style={styles.itemPrice}>{parseFloat(item.subtotal).toFixed(0)} FCFA</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </Card>

                {/* Résumé Paiement */}
                <Card style={styles.card}>
                    <View style={styles.sectionTitle}>
                        <Ionicons name="card-outline" size={20} color="#5D0EC0" />
                        <Text style={styles.title}>Résumé paiement</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Sous-total</Text>
                            <Text style={styles.priceValue}>
                                {parseFloat(order.subtotal).toFixed(0)} FCFA
                            </Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Frais de livraison</Text>
                            <Text style={styles.priceValue}>
                                {parseFloat(order.delivery_fee).toFixed(0)} FCFA
                            </Text>
                        </View>
                        <View style={[styles.priceRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Montant total</Text>
                            <Text style={styles.totalPrice}>
                                {parseFloat(order.total).toFixed(0)} FCFA
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Boutons d'action */}
                <View style={styles.actionsContainer}>
                    {orderService.canCancelOrder(order.status) && (
                        <Button
                            mode="outlined"
                            style={styles.cancelButton}
                            labelStyle={styles.buttonLabel}
                            onPress={handleCancelOrder}
                        >
                            Annuler la commande
                        </Button>
                    )}

                    {order.status === 'pending' && (
                        <Button
                            mode="contained"
                            style={styles.paymentButton}
                            labelStyle={styles.buttonLabel}
                            onPress={() => setShowPaymentMethods(!showPaymentMethods)}
                        >
                            💳 Passer au paiement
                        </Button>
                    )}

                    {order.status === 'delivered' && (
                        <>
                            <Button
                                mode="contained"
                                style={[styles.paymentButton, { backgroundColor: '#4CAF50' }]}
                                labelStyle={styles.buttonLabel}
                                disabled
                            >
                                ✅ Commande livrée
                            </Button>
                            <Button
                                mode="outlined"
                                style={styles.ratingButton}
                                labelStyle={styles.buttonLabel}
                                onPress={() => handleOpenRatingModal('delivery')}
                            >
                                ⭐ Noter le livreur
                            </Button>
                            <Button
                                mode="outlined"
                                style={styles.ratingButton}
                                labelStyle={styles.buttonLabel}
                                onPress={() => handleOpenRatingModal('items')}
                            >
                                ⭐ Noter les plats
                            </Button>
                        </>
                    )}
                </View>

                {/* Méthodes de Paiement */}
                {showPaymentMethods && (
                    <View style={styles.paymentMethodsContainer}>
                        <Text style={styles.paymentMethodsTitle}>Choisir le mode de paiement</Text>
                        {[
                            { key: 'orange_money', label: '🟠 Orange Money' },
                            { key: 'mtn_money', label: '🟡 MTN Mobile Money' },
                            { key: 'moov_money', label: '🔴 Moov Money' },
                            { key: 'card', label: '💳 Carte bancaire' },
                            { key: 'cash', label: '💵 Espèces' },
                        ].map(method => (
                            <TouchableOpacity
                                key={method.key}
                                style={styles.paymentMethodButton}
                                onPress={() => initiatePayment(method.key)}
                            >
                                <Text style={styles.paymentMethodText}>{method.label}</Text>
                                <Ionicons name="chevron-forward" size={20} color="#5D0EC0" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Modal de notation */}
            <Modal visible={showRatingModal} animationType="slide" transparent>
                <SafeAreaView style={styles.modalContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={handleCloseRatingModal}>
                                <Ionicons name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {ratingType === 'delivery' ? 'Noter le livreur' : 'Noter les plats'}
                            </Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {ratingType === 'delivery' && (
                            <View style={styles.modalContent}>
                                <Text style={styles.sectionLabel}>Évaluation globale</Text>
                                <View style={styles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <TouchableOpacity
                                            key={star}
                                            onPress={() =>
                                                setDeliveryRating({ ...deliveryRating, rating: star })
                                            }
                                            style={styles.starButton}
                                        >
                                            <Ionicons
                                                name={star <= deliveryRating.rating ? 'star' : 'star-outline'}
                                                size={40}
                                                color={star <= deliveryRating.rating ? '#FFB800' : '#ccc'}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.sectionLabel}>Rapidité de livraison</Text>
                                <View style={styles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <TouchableOpacity
                                            key={star}
                                            onPress={() =>
                                                setDeliveryRating({
                                                    ...deliveryRating,
                                                    speed_rating: star,
                                                })
                                            }
                                            style={styles.starButton}
                                        >
                                            <Ionicons
                                                name={star <= deliveryRating.speed_rating ? 'star' : 'star-outline'}
                                                size={40}
                                                color={star <= deliveryRating.speed_rating ? '#FFB800' : '#ccc'}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.sectionLabel}>Professionnalisme</Text>
                                <View style={styles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <TouchableOpacity
                                            key={star}
                                            onPress={() =>
                                                setDeliveryRating({
                                                    ...deliveryRating,
                                                    professionalism_rating: star,
                                                })
                                            }
                                            style={styles.starButton}
                                        >
                                            <Ionicons
                                                name={
                                                    star <= deliveryRating.professionalism_rating
                                                        ? 'star'
                                                        : 'star-outline'
                                                }
                                                size={40}
                                                color={
                                                    star <= deliveryRating.professionalism_rating
                                                        ? '#FFB800'
                                                        : '#ccc'
                                                }
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.sectionLabel}>Commentaire (optionnel)</Text>
                                <TextInput
                                    style={styles.commentInput}
                                    placeholder="Partagez votre expérience..."
                                    placeholderTextColor="#999"
                                    multiline
                                    numberOfLines={4}
                                    value={deliveryRating.comment}
                                    onChangeText={text =>
                                        setDeliveryRating({ ...deliveryRating, comment: text })
                                    }
                                />

                                <Button
                                    mode="contained"
                                    style={styles.submitButton}
                                    labelStyle={styles.buttonLabel}
                                    onPress={handleSubmitDeliveryRating}
                                    loading={isSubmittingRating}
                                    disabled={isSubmittingRating}
                                >
                                    Soumettre l'évaluation
                                </Button>
                            </View>
                        )}

                        {ratingType === 'items' && (
                            <View style={styles.modalContent}>
                                {order?.items?.map((item, idx) => (
                                    <Card key={idx} style={styles.itemRatingCard}>
                                        <View style={styles.itemRatingHeader}>
                                            <Text style={styles.itemRatingName}>{item.item_name}</Text>
                                            <Text style={styles.itemRatingSize}>{item.size_name}</Text>
                                        </View>

                                        <View style={styles.itemRatingBody}>
                                            <Text style={styles.criteriaLabel}>Note globale</Text>
                                            <View style={styles.starsContainer}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <TouchableOpacity
                                                        key={star}
                                                        onPress={() => {
                                                            const newRatings = { ...itemsRatings };
                                                            if (!newRatings[idx]) newRatings[idx] = {};
                                                            newRatings[idx].rating = star;
                                                            setItemsRatings(newRatings);
                                                        }}
                                                        style={styles.starButton}
                                                    >
                                                        <Ionicons
                                                            name={
                                                                star <= (itemsRatings[idx]?.rating || 0)
                                                                    ? 'star'
                                                                    : 'star-outline'
                                                            }
                                                            size={32}
                                                            color={
                                                                star <= (itemsRatings[idx]?.rating || 0)
                                                                    ? '#FFB800'
                                                                    : '#ccc'
                                                            }
                                                        />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>

                                            <Text style={styles.criteriaLabel}>Goût</Text>
                                            <View style={styles.starsContainer}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <TouchableOpacity
                                                        key={star}
                                                        onPress={() => {
                                                            const newRatings = { ...itemsRatings };
                                                            if (!newRatings[idx]) newRatings[idx] = {};
                                                            newRatings[idx].taste_rating = star;
                                                            setItemsRatings(newRatings);
                                                        }}
                                                        style={styles.starButton}
                                                    >
                                                        <Ionicons
                                                            name={
                                                                star <= (itemsRatings[idx]?.taste_rating || 0)
                                                                    ? 'star'
                                                                    : 'star-outline'
                                                            }
                                                            size={32}
                                                            color={
                                                                star <= (itemsRatings[idx]?.taste_rating || 0)
                                                                    ? '#FFB800'
                                                                    : '#ccc'
                                                            }
                                                        />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>

                                            <Text style={styles.criteriaLabel}>Présentation</Text>
                                            <View style={styles.starsContainer}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <TouchableOpacity
                                                        key={star}
                                                        onPress={() => {
                                                            const newRatings = { ...itemsRatings };
                                                            if (!newRatings[idx]) newRatings[idx] = {};
                                                            newRatings[idx].presentation_rating = star;
                                                            setItemsRatings(newRatings);
                                                        }}
                                                        style={styles.starButton}
                                                    >
                                                        <Ionicons
                                                            name={
                                                                star <= (itemsRatings[idx]?.presentation_rating || 0)
                                                                    ? 'star'
                                                                    : 'star-outline'
                                                            }
                                                            size={32}
                                                            color={
                                                                star <= (itemsRatings[idx]?.presentation_rating || 0)
                                                                    ? '#FFB800'
                                                                    : '#ccc'
                                                            }
                                                        />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>

                                            <Text style={styles.criteriaLabel}>Portion</Text>
                                            <View style={styles.starsContainer}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <TouchableOpacity
                                                        key={star}
                                                        onPress={() => {
                                                            const newRatings = { ...itemsRatings };
                                                            if (!newRatings[idx]) newRatings[idx] = {};
                                                            newRatings[idx].portion_rating = star;
                                                            setItemsRatings(newRatings);
                                                        }}
                                                        style={styles.starButton}
                                                    >
                                                        <Ionicons
                                                            name={
                                                                star <= (itemsRatings[idx]?.portion_rating || 0)
                                                                    ? 'star'
                                                                    : 'star-outline'
                                                            }
                                                            size={32}
                                                            color={
                                                                star <= (itemsRatings[idx]?.portion_rating || 0)
                                                                    ? '#FFB800'
                                                                    : '#ccc'
                                                            }
                                                        />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>

                                            <Text style={styles.criteriaLabel}>Commentaire (optionnel)</Text>
                                            <TextInput
                                                style={styles.commentInput}
                                                placeholder="Vos remarques..."
                                                placeholderTextColor="#999"
                                                multiline
                                                numberOfLines={3}
                                                value={itemsRatings[idx]?.comment || ''}
                                                onChangeText={text => {
                                                    const newRatings = { ...itemsRatings };
                                                    if (!newRatings[idx]) newRatings[idx] = {};
                                                    newRatings[idx].comment = text;
                                                    setItemsRatings(newRatings);
                                                }}
                                            />
                                        </View>
                                    </Card>
                                ))}

                                <Button
                                    mode="contained"
                                    style={styles.submitButton}
                                    labelStyle={styles.buttonLabel}
                                    onPress={handleSubmitItemsRatings}
                                    loading={isSubmittingRating}
                                    disabled={isSubmittingRating}
                                >
                                    Soumettre les évaluations
                                </Button>
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalContent: {
        padding: 16,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        marginBottom: 12,
    },
    criteriaLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
        marginTop: 12,
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 8,
    },
    starButton: {
        padding: 4,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#333',
        textAlignVertical: 'top',
        marginVertical: 8,
    },
    submitButton: {
        marginVertical: 24,
        backgroundColor: '#5D0EC0',
    },
    itemRatingCard: {
        marginVertical: 8,
        borderRadius: 12,
        elevation: 1,
    },
    itemRatingHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemRatingName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemRatingSize: {
        fontSize: 12,
        color: '#999',
    },
    itemRatingBody: {
        padding: 16,
    },
    ratingButton: {
        borderColor: '#FFB800',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#F44336',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    card: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        elevation: 1,
    },
    cardContent: {
        padding: 16,
    },
    sectionTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    orderNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        color: '#999',
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    link: {
        color: '#5D0EC0',
        textDecorationLine: 'underline',
    },
    addressText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 13,
        color: '#5D0EC0',
        marginTop: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 12,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'flex-start',
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    itemSize: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    instructions: {
        fontSize: 12,
        color: '#5D0EC0',
        fontStyle: 'italic',
    },
    itemPriceQty: {
        alignItems: 'flex-end',
    },
    qty: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#5D0EC0',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    priceLabel: {
        fontSize: 13,
        color: '#666',
    },
    priceValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
    },
    totalRow: {
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#5D0EC0',
    },
    actionsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 8,
    },
    cancelButton: {
        borderColor: '#F44336',
    },
    paymentButton: {
        backgroundColor: '#5D0EC0',
    },
    buttonLabel: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    paymentMethodsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 12,
    },
    paymentMethodsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    paymentMethodButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    paymentMethodText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
});


