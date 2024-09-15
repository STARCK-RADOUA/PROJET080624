import { BASE_URL, BASE_URLIO } from '@env';
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { io } from 'socket.io-client';
import { MaterialIcons } from '@expo/vector-icons';

const InProgressOrderModal = ({ visible, onClose, order }) => {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const socket = io(BASE_URLIO);

  if (!order) return null;

  const displayedProducts = showAllProducts ? order.products : order.products.slice(0, 3);

  // Animation pour l'entrée du modal
  const scaleAnim = new Animated.Value(0);

  const animateIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 0,
      friction: 7,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  // Récupérer les chauffeurs disponibles lorsque le modal est affiché
  useEffect(() => {
    if (visible) {
      axios.get(`${BASE_URL}/api/driver/diponible`)
        .then(response => setDrivers(response.data))
        .catch(error => console.error('Erreur de récupération des chauffeurs :', error.message));
    }
  }, [visible]);

  const handleAffectOrder = () => {
    if (selectedDriver) {
      axios.put(`${BASE_URL}/api/orders/affect-order`, { 
        orderId: order.order_number, 
        driverId: selectedDriver 
      })
      .then(response => {
        console.log('Commande affectée avec succès :', response.data);
        socket.emit('watchOrderStatuss', { order_id: order.order_number });
        onClose(); // Fermer le modal après l'affectation
      })
      .catch(error => console.error('Erreur lors de l\'affectation de la commande :', error.message));
    }
  };

  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onShow={animateIn}
      onRequestClose={animateOut}
    >
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.modalView, { transform: [{ scale: scaleAnim }] }]}>
          {/* Bouton de fermeture */}
          <TouchableOpacity style={styles.closeButton} onPress={animateOut}>
            <Ionicons name="close-circle" size={37} color="#ff5c5c" />
          </TouchableOpacity>

          <ScrollView>
            {/* Infos sur la commande */}
            <View style={styles.orderInfo}>
              <Text style={styles.label}><MaterialIcons name="receipt" size={16} color="#ffbf00" /> Commande #{order.order_number ?? 'N/A'}</Text>
              <Text style={styles.label}><Ionicons name="person" size={16} color="#ffbf00" /> Client : {order.client_name}</Text>
              <Text style={styles.label}><Ionicons name="car" size={16} color="#ffbf00" /> Chauffeur : {order.driver_name}</Text>
              <Text style={styles.label}><Ionicons name="card" size={16} color="#ffbf00" /> Paiement : {order.payment_method}</Text>
              <Text style={styles.label}><Ionicons name="cash" size={16} color="#ffbf00" /> Prix Total : €{order.total_price.toFixed(2)}</Text>
              <Text style={styles.label}><Ionicons name="swap-horizontal" size={16} color="#ffbf00" /> Échange : €{order.exchange.toFixed(2)}</Text>
              <Text style={styles.label}><Ionicons name="home" size={16} color="#ffbf00" /> Adresse : {order.address_line}</Text>
              <Text style={styles.label}><Ionicons name="time" size={16} color="#ffbf00" /> Livraison : {moment(order.delivery_time).format('YYYY-MM-DD HH:mm')}</Text>
            </View>

            {/* Produits */}
            <Text style={styles.sectionHeader}>Produits :</Text>
            <View style={styles.productsContainer}>
              {displayedProducts.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => toggleExpand(index)} style={styles.productContainer}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri: item.product?.image_url || 'https://via.placeholder.com/150',
                      }}
                      style={styles.productImage}
                    />
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.product?.name || 'Indisponible'}</Text>
                    {expanded === index && (
                      <View>
                        <Text style={styles.productQuantity}>Quantité : {item.quantity}</Text>
                        <Text style={styles.productPrice}>€{!item.isFree ? item.price.toFixed(2) : "Gratuit"}</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons name={expanded === index ? "chevron-up" : "chevron-down"} size={20} color="#ffbf00" />
                </TouchableOpacity>
              ))}

              {/* Bouton pour afficher plus de produits */}
              {order.products.length > 3 && !showAllProducts && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllProducts(true)}
                >
                  <Text style={styles.showMoreText}>Afficher plus de produits...</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sélection du chauffeur */}
            <Text style={styles.sectionHeader}>Affecter un chauffeur :</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedDriver}
                onValueChange={(itemValue) => setSelectedDriver(itemValue)}
                style={styles.picker}
              >
                {drivers.map(driver => (
                  <Picker.Item 
                    key={driver.driver_id} 
                    label={`${driver.firstName} ${driver.lastName}`} 
                    value={driver.driver_id} 
                  />
                ))}
              </Picker>
            </View>

            {/* Bouton Affecter */}
            {selectedDriver && (
              <TouchableOpacity style={styles.affectButton} onPress={handleAffectOrder}>
                <Text style={styles.affectButtonText}>Affecter la commande à {drivers.find(driver => driver.driver_id === selectedDriver)?.firstName}</Text>
              </TouchableOpacity>
            )}

            {/* Prix Total */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total : €{order.total_price.toFixed(2)}</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#1f1f1f',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    right: 10,
  },
  orderInfo: {
    paddingTop: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#ccc',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#ffbf00',
  },
  productsContainer: {
    marginTop: 10,
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 15,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffbf00',
  },
  productQuantity: {
    fontSize: 14,
    color: '#ccc',
  },
  productPrice: {
    fontSize: 14,
    color: '#ff5c5c',
  },
  showMoreButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  showMoreText: {
    color: '#007bff',
    fontSize: 16,
  },
  pickerContainer: {
    marginTop: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
  },
  picker: {
    height: 50,
    color: '#fff',
  },
  affectButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ff5c5c',
    borderRadius: 10,
    alignItems: 'center',
  },
  affectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 10,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffbf00',
  },
});

export default InProgressOrderModal;
