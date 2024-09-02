import React, { useState, useEffect } from 'react';

import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

const DeliveredOrderModal = ({ visible, onClose, order }) => {
  const [showAllProducts, setShowAllProducts] = useState(false);

  if (!order) return null;

  const displayedProducts = showAllProducts ? order.products : order.products.slice(0, 3);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={30} color="#ff5c5c" />
          </TouchableOpacity>

          <ScrollView>
            {/* Order Info */}
            <View style={styles.orderInfo}>
              <Text style={styles.label}>Order #{order.order_number ?? 'N/A'}</Text>
              <Text style={styles.label}>Client: {order.client_name}</Text>
              <Text style={styles.label}>Driver: {order.driver_name}</Text>
              <Text style={styles.label}>Address: {order.address_line}</Text>
              <Text style={styles.label}>Payment: {order.payment_method}</Text>
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
                        uri: item.product && item.product.image_url ? item.product.image_url : 'https://via.placeholder.com/150',
                      }}
                      style={styles.productImage}
                    />
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.product ? item.product.name : 'Unavailable'}</Text>
                    <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
                    <Text style={styles.productPrice}>€{item.price.toFixed(2)}</Text>
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

            {/* Total Price */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total: €{order.total_price.toFixed(2)}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  orderInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  productsContainer: {
    marginTop: 10,
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    color: '#333',
  },
  productQuantity: {
    fontSize: 14,
    color: '#555',
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
  totalContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DeliveredOrderModal;
