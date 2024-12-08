import { BASE_URL, BASE_URLIO } from '@env';

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import io from 'socket.io-client';
import DeviceInfo from 'react-native-device-info';


const { width, height } = Dimensions.get('window');
const socket = io(`${BASE_URLIO}`);

const OrderScreen = ({ navigation }) => {

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnimOrder = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const deviceId = DeviceInfo.getUniqueId();

    socket.emit('requestOrders', deviceId);

    socket.on('allOrders', (data) => {
      console.log('------------////////////////////////------------------------');
      console.log('All Orders:', data);
      console.log('------------------------------------');
      setOrders(data);
    });

    socket.on('newOrder', (order) => {
      setOrders((prevOrders) => [order, ...prevOrders]);
    });

    return () => {
      socket.off('allOrders');
      socket.off('newOrder');
    };
  }, []);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);

    Animated.parallel([
      Animated.timing(slideAnimOrder, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeOrderDetails = () => {
    Animated.parallel([
      Animated.timing(slideAnimOrder, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedOrder(null);
    });
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'orange' }; // En orange
      case 'in_progress':
        return { color: 'blue' }; // En bleu
      case 'delivered':
        return { color: 'green' }; // En vert
      case 'cancelled':
        return { color: 'red' }; // En rouge
      default:
        return { color: 'black' }; // Couleur par défaut si le statut est inconnu
    }
  };
  
  const renderOrderItem = ({ item }) => (
    <TouchableOpacity style={styles.orderItem} onPress={() => openOrderDetails(item)}>
    <View style={styles.orderInfo}>
      <Text style={styles.productName}>Order ID: {item._id}</Text>
      <Text style={styles.productPrice}>
        Total Price: {item.total_price ? `$${item.total_price.toFixed(2)}` : 'N/A'}
      </Text>
      <Text style={styles.quantity}>Status: {item.status}</Text>
    </View>
    <View style={styles.statusWrapper}>
      <Text style={[styles.orderStatus, getStatusColor(item.status)]}>{item.status}</Text>
    </View>
  </TouchableOpacity>
  
  );
  

  const renderProductItem = ({ item }) => (
    <View style={styles.modalItem}>
      <Text style={styles.productName}>{item.product_id.name}</Text>
      <Text style={styles.productPrice}>Price: ${item.price.toFixed(2)}</Text>
      <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
      {item.selected_options && item.selected_options.length > 0 && (
        <View>
          <Text style={styles.modalItem}>Selected Options:</Text>
          {item.selected_options.map((option, index) => (
            <Text key={index} style={styles.optionItem}>
              {option.name} - ${option.price.toFixed(2)}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
    
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.orderList}
      />

      {modalVisible && selectedOrder && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeOrderDetails}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
            <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnimOrder.interpolate({
              inputRange: [0, 1],
              outputRange: [height, 0],
            }) }] }]}>
              <Text style={styles.modalTitle}>Order Details</Text>

              <FlatList
                data={selectedOrder.items}
                renderItem={renderProductItem}
                keyExtractor={(item) => item._id}
              />

              <Text style={styles.modalItem}>
                Payment Method: {selectedOrder.payment_method}
              </Text>
              <Text style={styles.modalItem}>
                Points Earned: {selectedOrder.points_earned || 0}
              </Text>
              <Text style={styles.modalItem}>
                Address: {selectedOrder.address_id ? `${selectedOrder.address_id.address_line}, ${selectedOrder.address_id.building}, ${selectedOrder.address_id.floor}, ${selectedOrder.address_id.door_number}` : 'N/A'}
              </Text>
              <Text style={styles.modalItem}>
                Digicode: {selectedOrder.address_id ? selectedOrder.address_id.digicode : 'N/A'}
              </Text>
              <Text style={styles.modalItem}>
                Comment: {selectedOrder.address_id ? selectedOrder.address_id.comment : 'N/A'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeOrderDetails}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  orderList: {
    paddingBottom: 20,
    paddingTop: 20,
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderLeftWidth: 5,
    borderColor: '#ffae00',
  },
  orderInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#888',
  },
  quantity: {
    fontSize: 14,
    color: '#888',
  },
  statusWrapper: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 5,
  },
  orderStatus: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalItem: {
    fontSize: 16,
    marginBottom: 10,
  },
  optionItem: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderScreen;
