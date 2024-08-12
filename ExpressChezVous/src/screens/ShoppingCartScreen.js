import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { getUser } from '../services/userService';

const ShoppingCartScreen = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        const userId = await getUser();
        console.log('User ID:', userId); // Debugging

        const url = `http://192.168.1.35:4000/api/order-items/${userId}/order-items`;
        console.log('Fetching order items from URL:', url); // Debugging

        const response = await axios.get(url);
        console.log('Order items received:', response.data); // Debugging

        setOrderItems(response.data);
      } catch (error) {
        console.error('Failed to fetch order items:', error.message || error);
        setError('Failed to fetch order items. Please check the console for details.');
      }
    };

    fetchOrderItems();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://example.com/logo.png' }} style={styles.logo} />
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView style={styles.menuList}>
          {orderItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <Image source={{ uri: item.product_id.image_url }} style={styles.menuItemImage} />
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemName}>{item.product_id.name}</Text>
                <Text style={styles.menuItemDescription}>
                  {item.selected_options.map(option => option.name).join(', ')}
                </Text>
                <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="orange" />
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
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
  },
  menuItemDescription: {
    color: '#777',
  },
  menuItemPrice: {
    color: 'orange',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ShoppingCartScreen;
