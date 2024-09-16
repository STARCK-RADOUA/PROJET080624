import { BASE_URL ,BASE_URLIO} from '@env';
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker'; // Correct Picker import
import { io } from 'socket.io-client';

const DeliveredOrderModal = ({ visible, onClose, order }) => {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
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
    }).start(() => onClose());
  };

  // Fetch available drivers when the modal is shown
  useEffect(() => {
    if (visible) {
      axios.get(`${BASE_URL}/api/driver/diponible`) // Replace with your actual API endpoint
        .then(response => {
          setDrivers(response.data);
        })
        .catch(error => {
          console.error('Error fetching drivers:', error.message);
        });
    }
  }, [visible]);

  const handleAffectOrder = () => {
    if (selectedDriver) {
      axios.put(`${BASE_URL}/api/orders/affect-order`, { 
        orderId: order.order_number, 
        driverId: selectedDriver 
      })
      .then(response => {
        console.log('Order affected successfully:', response.data);
        socket.emit('watchOrderStatuss', { order_id: order.order_number });

        onClose(); // Close the modal after affecting the order
      })
      .catch(error => {
        console.error('Error affecting order:', error.message);
      });
    }
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
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={animateOut}>
            <Ionicons name="close-circle" size={37} color="#ff5c5c" />
          </TouchableOpacity>

          <ScrollView>
            {/* Order Info */}
            <View style={styles.orderInfo}>
              <Text style={styles.label}>Order #{order.order_number ?? 'N/A'}</Text>
              <Text style={styles.label}>Client: {order.client_name}</Text>
              <Text style={styles.label}>Address: {order.address_line}</Text>
              <Text style={styles.label}>Payment: {order.payment_method}</Text>
              <Text style={styles.label}>Total Price: €{order.total_price.toFixed(2)}</Text>
              <Text style={styles.label}>Exchange: €{order.exchange.toFixed(2)} </Text>
              <Text style={styles.label}>
                Delivery: {moment(order.delivery_time).format('YYYY-MM-DD HH:mm')}
              </Text>
            </View>

            {/* Products */}
            <Text style={styles.sectionHeader}>Products:</Text>
            <View style={styles.productsContainer}>
              {displayedProducts.map((item, index) => (
                <View key={index} style={styles.productContainer}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri: item.product?.image_url || 'https://via.placeholder.com/150',
                      }}
                      style={styles.productImage}
                    />
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.product?.name || 'Unavailable'}</Text>
                    <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
                    <Text style={styles.productPrice}>€{!item.isFree? item.price.toFixed(2): "Free"}</Text>
                  </View>
                </View>
              ))}

              {/* Show more products button */}
              {order.products.length > 3 && !showAllProducts && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllProducts(true)}
                >
                  <Text style={styles.showMoreText}>Show more products...</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Driver Selection */}
            <Text style={styles.sectionHeader}>Assign Driver:</Text>
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

            {/* Affect Order Button */}
            {selectedDriver && (
              <TouchableOpacity style={styles.affectButton} onPress={handleAffectOrder}>
                <Text style={styles.affectButtonText}>Affect the Order to {drivers.find(driver => driver.driver_id === selectedDriver)?.firstName}</Text>
              </TouchableOpacity>
            )}

            {/* Total Price */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total: €{order.total_price.toFixed(2)}</Text>
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
    top: 40,
    right: 10,
  },
  orderInfo: {
    marginBottom: 20,
    paddingTop: 20,
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

export default DeliveredOrderModal;
