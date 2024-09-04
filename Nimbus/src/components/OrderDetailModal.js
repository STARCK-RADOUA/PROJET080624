import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

const OrderDetailModal = ({ visible, onClose, order }) => {
  if (!order) return null;

  const displayedProducts = order.products.slice(0, 3);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={30} color="#ff5c5c" />
          </TouchableOpacity>

          <ScrollView>
            {/* Order Info */}
            <View style={styles.orderInfo}>
              <Text style={styles.label}>Order #{order.order_number ?? 'N/A'}</Text>
              <Text style={styles.label}>Client: {order.client_name}</Text>
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
                  <Image
                    source={{ uri: item.product?.image_url || 'https://via.placeholder.com/150' }}
                    style={styles.productImage}
                  />
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.product?.name || 'Unavailable'}</Text>
                    <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
                    <Text style={styles.productPrice}>€{item.price.toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>

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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  orderInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 5,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffbf00',
    marginBottom: 10,
  },
  productsContainer: {
    marginBottom: 20,
  },
  productContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    color: '#fff',
  },
  productQuantity: {
    fontSize: 14,
    color: '#ccc',
  },
  productPrice: {
    fontSize: 14,
    color: '#ff5c5c',
  },
  totalContainer: {
    padding: 15,
    backgroundColor: '#444',
    borderRadius: 10,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    color: '#ffbf00',
  },
});

export default OrderDetailModal;
