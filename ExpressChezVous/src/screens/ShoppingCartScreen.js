import { BASE_URL, BASE_URLIO } from '@env';
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { getClientId } from '../services/userService';
import Header from '../components/Header';
import io from 'socket.io-client';
import * as Device from 'expo-device';
import useNotificationMenu from '../services/useNotificationMenu'; 
import NotificationMenu from '../components/NotificationMenu';
import { DataContext } from '../navigation/DataContext';
import { getUserDetails } from '../services/userService';

const ShoppingCartScreen = ({ navigation }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [userPointsEarned, setUserPointsEarned] = useState(0); // Track user's points
  const [myFreeItem, setMyFreeItem] = useState(0); // Track number of free items
  const [itemsInTheCart, setItemsInTheCart] = useState(0); // Track the number of items in the cart
  const [error, setError] = useState('');
  const socket = io(`${BASE_URLIO}`);
  const { sharedData } = useContext(DataContext);
  const serviceName = sharedData.serviceName;

  const { isNotificationMenuVisible, slideAnim, toggleNotificationMenu } = useNotificationMenu();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getUserDetails();
      setUserPointsEarned(user.points_earned); // Initialize points earned
    };
    fetchUserData();

    const deviceId = Device.osBuildId;
    console.log('Device ID:', deviceId);
  }, []);

  const fetchOrderItems = async () => {
    try {
      const clientId = await getClientId();
      const url = `${BASE_URL}/api/order-items/${clientId}/${serviceName}/order-items` ;
      const response = await axios.get(url);
      const fetchedItems = response.data.map(item => ({ ...item, free: false })); // Add 'free' flag to each item
      setOrderItems(fetchedItems);
      calculateTotalPrice(fetchedItems);
      calculateItemsInTheCart(fetchedItems);
    } catch (error) {
      console.error('Failed to fetch order items:', error.message || error);
      setError('Failed to fetch order items. Please check the console for details.');
    }
  };



  const calculateTotalPrice = (items) => {
    const total = items.reduce((sum, item) => {
      // Check if the item is free; if it's not free, multiply its price by its quantity
      return sum + (item.free ? 0 : item.product_id.price * item.quantity);
    }, 0); 
    setTotalPrice(total);
  };
  

  const calculateItemsInTheCart = (items) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0); // Count total items based on quantity
    setItemsInTheCart(totalItems);
  };

  const toggleFreeItem = (itemId) => {
    setOrderItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item._id === itemId) {
          const pointsRequired = item.quantity; // Points needed for the quantity of this item

          // If the item is already free toggle it off and return points
          if (item.free) {
            setUserPointsEarned(prevPoints => prevPoints + pointsRequired);
            setMyFreeItem(prev => prev - 1); // Decrease free items count
            return { ...item, free: false };
          } else {
            // Ensure that the user has enough points and free items < items in cart
            if (userPointsEarned >= pointsRequired && myFreeItem < itemsInTheCart - 1) {
              setUserPointsEarned(prevPoints => prevPoints - pointsRequired);
              setMyFreeItem(prev => prev + 1); // Increase free items count
              return { ...item, free: true };
            } else {
              // Alert if points are not enough or max free items exceeded
              Alert.alert("Not enough points", "You don't have enough points to take this item for free or too many free items.");
              return item;
            }
          }
        }
        return item;
      });

      calculateTotalPrice(updatedItems);
      return updatedItems;
    });
  };

  const deleteItem = async (itemId) => {
    try {
      const itemToDelete = orderItems.find(item => item._id === itemId);
      if (itemToDelete.free) {
        // Recover points when deleting a free item
        setUserPointsEarned(prevPoints => prevPoints + itemToDelete.quantity);
        setMyFreeItem(prev => prev - 1); // Decrease free items count
      }

      await axios.delete(`${BASE_URL}/api/order-items/${itemId}`);
      const updatedItems = orderItems.filter(item => item._id !== itemId);
      setOrderItems(updatedItems);
      calculateTotalPrice(updatedItems);
      calculateItemsInTheCart(updatedItems); // Update item counter after deletion
    } catch (error) {
      console.error('Failed to delete item:', error.message || error);
      setError('Failed to delete item. Please check the console for details.');
    }
  };

  const updateQuantity = (itemId, change) => {
    setOrderItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item._id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change); // Ensure quantity is at least 1
          const pointsNeeded = newQuantity - item.quantity; // Calculate points difference
  
          // Handle the case where the item is marked as free
          if (item.free) {
            if (pointsNeeded > 0 && userPointsEarned >= pointsNeeded) {
              setUserPointsEarned(prevPoints => prevPoints - pointsNeeded);
            } else if (pointsNeeded > 0 && userPointsEarned < pointsNeeded) {
              Alert.alert("Not enough points", "You don't have enough points to increase the quantity for free.");
              return item; // Return without changing quantity
            } else if (pointsNeeded < 0) {
              setUserPointsEarned(prevPoints => prevPoints - pointsNeeded);
            }
          }
  
          return {
            ...item,
            quantity: newQuantity,
            price: item.product_id.price * newQuantity // Correctly multiply the price by the quantity
          };
        }
        return item;
      });
  
      calculateTotalPrice(updatedItems);
      calculateItemsInTheCart(updatedItems); // Update item counter after quantity change
      return updatedItems;
    });
  };
  

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const user = await getUserDetails();
          setUserPointsEarned(user.points_earned);
          await fetchOrderItems();
        } catch (error) {
          console.error('Error in useFocusEffect:', error);
        }
      };

      fetchData();
    }, [])
  );

  const handleItemPress = (itemId) => {
    setExpandedItemId((prevId) => (prevId === itemId ? null : itemId));
  };

  const handleOrderNow = async () => {
    try {
      const deviceId = Device.osBuildId;
      const data = {
        totalPrice: totalPrice,
        orderItems: orderItems,
        deviceId: deviceId,
      };
      navigation.replace('AdressForm', { newOrder: data });
    } catch (error) {
      console.error('Failed to place the order:', error);
      setError('Failed to place the order. Please check the console for details.');
    }
  };

  const shouldShowSwitch = () => {
    // Show the switch only if the user has points and itemsInTheCart > 1
    return itemsInTheCart > 1 || (userPointsEarned === 0 && itemsInTheCart > 1);
  };

  const shouldDisableSwitch = (item) => {
    return userPointsEarned === 0 && !item.free;
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} toggleNotificationMenu={toggleNotificationMenu} />
      {isNotificationMenuVisible && (
        <NotificationMenu
          slideAnim={slideAnim}
          toggleNotificationMenu={toggleNotificationMenu}
          socket={socket}
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
                  <View style={styles.menuItemDetails}>
                    <Text style={styles.priceText}>€{item.free ? 0 : item.price.toFixed(2)}</Text>
                    <Text style={styles.menuItemName}>{item.product_id.name}</Text>
                    {shouldShowSwitch() && (
                      <Switch
                        style={styles.switchButton}
                        value={item.free}
                        onValueChange={() => toggleFreeItem(item._id)}
                        disabled={shouldDisableSwitch(item)}
                      />
                    )}
                    <Text style={styles.menuItemDescription}>
                      {item.selected_options.map(option => option.name).join(', ')}
                    </Text>
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
            <View style={styles.pointsCounter}>
              <Text style={styles.pointsText}>{userPointsEarned} Points</Text>
            </View>
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
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  menuItemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    alignSelf: 'flex-start',
    textAlign: 'center',
  },
  menuItemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginTop: 5,
  },
  switchButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  menuItemDescription: {
    color: '#777',
    marginTop: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsCounter: {
    width: 80,
    height: 40,
    backgroundColor: '#e6e6e6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderButton: {
    backgroundColor: 'orange',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
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
