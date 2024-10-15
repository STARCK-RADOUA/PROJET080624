import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Animated } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';

const TestOrderModal = ({ visible, onClose, order }) => {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [expanded, setExpanded] = useState(null);

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
          <TouchableOpacity style={styles.closeButton} onPress={animateOut}>
            <Ionicons name="close-circle" size={38} color="#ff5c5c" />
          </TouchableOpacity>

          <ScrollView>
            {/* Order Information */}
            <View style={styles.orderInfo}>
              <Text style={styles.label}><MaterialIcons name="receipt" size={16} color="#ffbf00" /> Order #{order.order_number ?? 'N/A'}</Text>
              <Text style={styles.label}><Ionicons name="person" size={16} color="#ffbf00" /> Client: {order.client_name}</Text>
              <Text style={styles.label}><Ionicons name="card" size={16} color="#ffbf00" /> Payment: {order.payment_method}</Text>
              <Text style={styles.label}><Ionicons name="cash" size={16} color="#ffbf00" /> Total Price: €{order.total_price.toFixed(2)}</Text>
              <Text style={styles.label}><Ionicons name="swap-horizontal" size={16} color="#ffbf00" /> Exchange: €{order.exchange.toFixed(2)}</Text>
              <Text style={styles.label}><Ionicons name="home" size={16} color="#ffbf00" /> Address: {order.address_line}</Text>
              <Text style={styles.label}><Ionicons name="time" size={16} color="#ffbf00" /> Delivery: {moment(order.delivery_time).format('YYYY-MM-DD HH:mm')}</Text>
            </View>

            {/* Products */}
            <Text style={styles.sectionHeader}>Products:</Text>
            <View style={styles.productsContainer}>
              {displayedProducts.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => toggleExpand(index)} style={styles.productContainer}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.product?.image_url || 'https://via.placeholder.com/150' }}
                      style={styles.productImage}
                    />
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.product?.name || 'Unavailable'}</Text>
                    {expanded === index && (
                      <View>
                        <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
                        <Text style={styles.productPrice}>€{!item.isFree ? item.price.toFixed(2) : "Free"}</Text>
                        <Text style={styles.productServiceType}>Service Type: {item.service_type}</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons name={expanded === index ? "chevron-up" : "chevron-down"} size={20} color="#ffbf00" />
                </TouchableOpacity>
              ))}

              {/* Button to show more products */}
              {order.products.length > 3 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllProducts(!showAllProducts)}
                >
                  <Text style={styles.showMoreText}>
                    {showAllProducts ? 'Show less' : 'Show more products...'}
                  </Text>
                </TouchableOpacity>
              )}
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
    color: '#ff5c5c',  
  fontWeight: 'bold',
  fontSize: 16,
  textAlign: 'center',
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
  productServiceType: {
    fontSize: 14,
    color: '#ccc',
  },
  showMoreButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  showMoreText: {
    color: '#007bff',
    fontSize: 16,
  },
});

export default TestOrderModal;
