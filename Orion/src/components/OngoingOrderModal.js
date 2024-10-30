import { BASE_URL, BASE_URLIO } from '@env';
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import axios from 'axios';
import { io } from 'socket.io-client';
import { MaterialIcons } from '@expo/vector-icons';

const PendingOrderModal = ({ visible, onClose, order }) => {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [driverModalVisible, setDriverModalVisible] = useState(false); // Modal visibility state for driver selection
  const [expandAddress, setExpandAddress] = useState(false);


  const socket = io(BASE_URLIO);

  if (!order) return null;

  const displayedProducts = showAllProducts ? order.products : order.products.slice(0, 3);

  // Animation for modal entry
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
    }).start(() => onClose()); // Ensure that onClose is called
  };

  // Fetch available drivers when the modal is displayed
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
          onClose(); // Close the modal after assignment
        })
        .catch(error => console.error('Erreur lors de l\'affectation de la commande :', error.message));
    }
  };

  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  // Render a custom dropdown for driver selection
  // Render a custom dropdown for driver selection with a close button
  const renderDriverDropdown = () => (
    <Modal
      transparent={true}
      visible={driverModalVisible}
      animationType="fade"
      onRequestClose={() => setDriverModalVisible(false)}
    >
      <View style={styles.driverModalContainer}>
        <View style={styles.driverModalContent}>
          {/* Add a close button to manually close the modal */}
          <TouchableOpacity style={styles.closeButton} onPress={() => setDriverModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <ScrollView>
            {drivers.map(driver => (
              <TouchableOpacity
                key={driver.driver_id}
                style={styles.driverItem}
                onPress={() => {
                  setSelectedDriver(driver.driver_id);
                  setDriverModalVisible(false); // Close the modal when a driver is selected
                }}
              >
                <Text style={styles.driverName}>{`${driver.firstName} ${driver.lastName}`}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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
          <TouchableOpacity style={styles.closeButton} onPress={animateOut}>
            <Ionicons s name="close-circle" size={37} color="#ff5c5c" />
          </TouchableOpacity>

          <ScrollView>
            {/* Order Info */}
            <View style={styles.orderInfo}>
              <Text style={styles.label}><MaterialIcons name="receipt" size={16} color="#ffbf00" /> Commande #{order.order_number ?? 'N/A'}</Text>
              <Text style={styles.label}><Ionicons name="person" size={16} color="#ffbf00" /> Client : {order.client_name}</Text>
              <Text style={styles.label}><Ionicons name="card" size={16} color="#ffbf00" /> Paiement : {order.payment_method}</Text>
              <Text style={styles.label}><Ionicons name="cash" size={16} color="#ffbf00" /> Prix Total : €{order.total_price.toFixed(2)}</Text>
              <Text style={styles.label}><Ionicons name="swap-horizontal" size={16} color="#ffbf00" /> Échange : €{order.exchange.toFixed(2)}</Text>
              {/* Adresse expandable section */}

              <TouchableOpacity onPress={() => setExpandAddress(!expandAddress)} style={styles.expandableSection}>

                <Text style={styles.expandableLabel}><Ionicons name="location" size={16} color="#ffbf00" /> Adresse : {order.address_line}</Text>

                <Ionicons name={expandAddress ? "chevron-up" : "chevron-down"} size={20} color="#ffbf00" />

              </TouchableOpacity>

              {expandAddress && (
                <View style={styles.additionalAddressInfo}>
                  {order.building && (
                    <Text style={styles.additionalInfo}><Ionicons name="business" size={16} color="#ffbf00" /> Bâtiment : {order.building}</Text>
                  )}
                  {order.floor && (
                    <Text style={styles.additionalInfo}><Ionicons name="layers" size={16} color="#ffbf00" /> Étage : {order.floor}</Text>
                  )}
                  {order.digicode && (
                    <Text style={styles.additionalInfo}><Ionicons name="key" size={16} color="#ffbf00" /> Digicode : {order.digicode}</Text>
                  )}
                  {order.door_number && (
                    <Text style={styles.additionalInfo}><Ionicons name="home" size={16} color="#ffbf00" /> Numéro de porte : {order.door_number}</Text>
                  )}
                </View>
              )}
              <Text style={styles.label}><Ionicons name="time" size={16} color="#ffbf00" /> Date : {moment(order.delivery_time).format('YYYY-MM-DD HH:mm')}</Text>
            </View>

            {/* Products */}
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
                        <Text style={styles.productPrice}>€{!item.isFree ? item.priceDA.toFixed(2) * item.quantity: "Gratuit     €" + item.priceDA.toFixed(2) * item.quantity}</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons name={expanded === index ? "chevron-up" : "chevron-down"} size={20} color="#ffbf00" />
                </TouchableOpacity>
              ))}

              {/* Button to show more products */}
              {order.products.length > 3 && !showAllProducts && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllProducts(true)}
                >
                  <Text style={styles.showMoreText}>Afficher plus de produits...</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Custom Dropdown for Driver Selection */}
            <Text style={styles.sectionHeader}>Affecter un Livreur :</Text>
            <TouchableOpacity
              style={styles.driverSelectButton}
              onPress={() => setDriverModalVisible(true)}
            >
              <Text style={styles.driverSelectText}>
                {selectedDriver ? drivers.find(driver => driver.driver_id === selectedDriver)?.firstName : 'Sélectionner un livreur'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#ffbf00" />
            </TouchableOpacity>

            {/* Button to assign the order */}
            {selectedDriver && (
              <TouchableOpacity style={styles.affectButton} onPress={handleAffectOrder}>
                <Text style={styles.affectButtonText}>Affecter la commande à {drivers.find(driver => driver.driver_id === selectedDriver)?.firstName}</Text>
              </TouchableOpacity>
            )}

            {/* Total Price */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total : €{order.total_price.toFixed(2)}</Text>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Render Driver Dropdown */}
        {renderDriverDropdown()}
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
    color: '#ff5c5c',  // Customize the color as needed
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  expandableSection: {

    flexDirection: 'row',

    alignItems: 'center',

    marginVertical: 5,

  },

  expandableLabel: {

    fontSize: 16,

    color: '#ffbf00',

  },

  additionalAddressInfo: {

    paddingLeft: 20,

    marginVertical: 5,

  },

  additionalInfo: {

    fontSize: 14,

    color: '#ccc',

    marginBottom: 3,

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
  driverSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    justifyContent: 'space-between',
  },
  driverSelectText: {
    color: '#fff',
    fontSize: 16,
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
  driverModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  driverModalContent: {
    width: '80%',
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    padding: 20,
    maxHeight: '50%',
  },
  driverItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  driverName: {
    color: '#ffbf00',
    fontSize: 16,
  },
  closeButtonText: {
    color: '#ff5c5c',  // Customize the color as needed
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PendingOrderModal;
