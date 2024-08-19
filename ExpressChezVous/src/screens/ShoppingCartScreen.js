import { BASE_URL, BASE_URLIO } from '@env';

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { getClientId } from '../services/userService';
import Header from '../components/Header';
import io from 'socket.io-client';
import * as Device from 'expo-device';
import useNotificationMenu from '../services/useNotificationMenu'; // Import the custom hook
import NotificationMenu from '../components/NotificationMenu';

// Connect to the Socket.IO server
 // Use your backend server's IP address

const ShoppingCartScreen = ({ navigation }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0); 
  const [order_id, setOrder_id] = useState(0); 
  const [error, setError] = useState('');
  const socket = io(`${BASE_URLIO}`);

  const { isNotificationMenuVisible, slideAnim, toggleNotificationMenu } = useNotificationMenu();
  useEffect(() => {
    // Fetch device ID
    const deviceId = Device.osBuildId;
    console.log('Device ID:', deviceId);
  }, []);

  const fetchOrderItems = async () => {
    try {
      const clientId = await getClientId();
      const url = `${BASE_URL}/api/order-items/${clientId}/order-items`;
      const response = await axios.get(url);
      setOrderItems(response.data);
      calculateTotalPrice(response.data);
    } catch (error) {
      console.error('Failed to fetch order items:', error.message || error);
      setError('Failed to fetch order items. Please check the console for details.');
    }
  };

  const calculateTotalPrice = (items) => {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    setTotalPrice(total);
  };

  const deleteItem = async (itemId) => {
    try {
      await axios.delete(`${BASE_URL}/api/order-items/${itemId}`);
      const updatedItems = orderItems.filter(item => item._id !== itemId);
      setOrderItems(updatedItems);
      calculateTotalPrice(updatedItems);
    } catch (error) {
      console.error('Failed to delete item:', error.message || error);
      setError('Failed to delete item. Please check the console for details.');
    }
  };

  const updateQuantity = (itemId, change) => {
    const updatedItems = orderItems.map(item => 
      item._id === itemId 
        ? { 
            ...item, 
            quantity: Math.max(1, item.quantity + change), 
            price: item.product_id.price * Math.max(1, item.quantity + change) 
          } 
        : item
    );
    setOrderItems(updatedItems);
    calculateTotalPrice(updatedItems);
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrderItems();
    }, [])
  );

  const handleItemPress = (itemId) => {
    setExpandedItemId((prevId) => (prevId === itemId ? null : itemId));
  };
  const handleOrderNow = async () => {
    try {
      // Fetch device ID
      const deviceId = Device.osBuildId;
  
    
  
      const data = {
     
        totalPrice: totalPrice,
        orderItems: orderItems,
        deviceId: deviceId,
      };
      
  
      console.log('Order Now button pressed');
      console.log('Total price:', totalPrice);
      console.log('Order Items:', orderItems);
      console.log('Device ID:', deviceId);
      
      navigation.navigate('AdressForm',{ newOrder: data });
    } catch (error) {
      console.error('Failed to place the order:', error);
      setError('Failed to place the order. Please check the console for details.');
    }
  };
  

  return (
    <View style={styles.container}>

<Header navigation={navigation} toggleNotificationMenu={toggleNotificationMenu} />
      {isNotificationMenuVisible && (
        <NotificationMenu
          slideAnim={slideAnim}
          toggleNotificationMenu={toggleNotificationMenu}
          socket={socket} // Pass the socket instance
        />
      )}
     
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <ScrollView style={styles.menuList}>
            {orderItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handleItemPress(item._id)}>
                <View style={styles.itemContainer}>
                  <Image source={{ uri: item.product_id.image_url }} style={styles.menuItemImage} />
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemName}>{item.product_id.name}</Text>
                    <Text style={styles.menuItemDescription}>
                      {item.selected_options.map(option => option.name).join(', ')}
                    </Text>
                    {expandedItemId === item._id && (
                      <View style={styles.expandedSection}>
                        <Text style={styles.expandedText}>Price: €{item.price.toFixed(2)}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.rightContainer}>
                    <TouchableOpacity onPress={() => updateQuantity(item._id, 1)}>
                      <MaterialIcons name="keyboard-arrow-up" size={24} color="brown" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item._id, -1)}>
                      <MaterialIcons name="keyboard-arrow-down" size={24} color="brown" />
                    </TouchableOpacity>
                    {expandedItemId === item._id && (
                      <TouchableOpacity onPress={() => deleteItem(item._id)} style={styles.deleteButton}>
                        <MaterialIcons name="delete" size={24} color="red" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.orderButtonContainer}>
            <TouchableOpacity
              style={[styles.orderButton, orderItems.length === 0 && styles.disabledOrderButton]}
              onPress={handleOrderNow}
              disabled={orderItems.length === 0}
            >
              <Text style={styles.orderButtonText}>Order Now - €{totalPrice.toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
  },
  menuList: {
    paddingHorizontal: 20,
    marginBottom: 70,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  menuItemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  menuItemText: {
    flex: 1,
    marginLeft: 10,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  menuItemDescription: {
    color: '#777',
  },
  expandedSection: {
    marginTop: 5,
  },
  expandedText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  rightContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  deleteButton: {
    marginTop: 10,
  },
  orderButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  orderButton: {
    backgroundColor: 'orange',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  disabledOrderButton: {
    backgroundColor: 'grey',
  },
  orderButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ShoppingCartScreen;
