import { BASE_URL, BASE_URLIO } from '@env';
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Modal, BackHandler } from 'react-native';
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
  const [hasUsedPoints, setHasUsedPoints] = useState(false); // New state to track if points were used
  const { isNotificationMenuVisible, slideAnim, toggleNotificationMenu } = useNotificationMenu();
  
  const [isSystemPointModalVisible, setIsSystemPointModalVisible] = useState(false); // Modal visibility

  useEffect(() => {
    const fetchUserData = async () => {
      console.log(sharedData, "dsfsfsgs");
      const user = await getUserDetails();
      setUserPointsEarned(user.points_earned); // Initialize points earned
    };
    fetchUserData();

    const deviceId = Device.osBuildId;
    console.log('Device ID:', deviceId);
  }, []);

  useEffect(() => {
    // Create the interval
    const interval = setInterval(() => {
    
    }, 3000); // Runs every 3 seconds
  
    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array to run only once on mount

  const fetchOrderItems = async () => {
    try {
      const clientId = await getClientId();
      const url = `${BASE_URL}/api/order-items/${clientId}/${serviceName}/order-items`;
      const response = await axios.get(url);
      const fetchedItems = response.data.map(item => ({ ...item, free: false })); // Add 'free' flag to each item
      setOrderItems(fetchedItems);
      calculateTotalPrice(fetchedItems);
      calculateItemsInTheCart(fetchedItems);

      // Update hasUsedPoints after fetching order items
      setHasUsedPoints(fetchedItems.some(item => item.free)); // Check if any item is free (points used)

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
            return { ...item, free: false, disableDelete: false }; // Enable delete button again
          } else {
            // Ensure that the user has enough points and free items < items in cart
            if (userPointsEarned >= pointsRequired && myFreeItem < itemsInTheCart - 1) {
              setUserPointsEarned(prevPoints => prevPoints - pointsRequired);
              setMyFreeItem(prev => prev + 1); // Increase free items count
              return { ...item, free: true, disableDelete: false }; // Keep delete button enabled
            } else {
              // Alert if points are not enough or max free items exceeded
              Alert.alert("Not enough points", "You don't have enough points to take this item for free or too many free items.");
              return { ...item, disableDelete: true }; // Disable delete button for this item
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
      const payableItemsCount = orderItems.filter(item => !item.free).length;
      const itemToDelete = orderItems.find(item => item._id === itemId);

      // If points were used and there's only 1 payable item left, prevent deletion
      if (hasUsedPoints && !itemToDelete.free && payableItemsCount === 1) {
        Alert.alert("Cannot delete", "You need to keep at least one payable item in the cart.");
        return;
      }

      // If the item is free, recover points when deleting
      if (itemToDelete.free) {
        setUserPointsEarned(prevPoints => prevPoints + itemToDelete.quantity);
        setMyFreeItem(prev => prev - 1); // Decrease free items count
      }

      // Proceed with deleting the item
      await axios.delete(`${BASE_URL}/api/order-items/${itemId}`);
      const updatedItems = orderItems.filter(item => item._id !== itemId);
      setOrderItems(updatedItems);
      calculateTotalPrice(updatedItems);
      calculateItemsInTheCart(updatedItems);
    } catch (error) {
      console.error('Failed to delete item:', error.message || error);
      setError('Failed to delete item. Please check the console for details.');
    }
  };

  useEffect(() => {
    setHasUsedPoints(orderItems.some(item => item.free)); // Update hasUsedPoints when orderItems change
  }, [orderItems]);

  useEffect(() => {
    socket.emit('watchServicePointsStatuss', { serviceID: sharedData.id });

    // Listen for order status updates
    socket.on('oserviceStatusUpdates', (data) => {
      console.log("service data is ", data);
      
      // Check if the system point is active and show the modal
      if (!data.service.isSystemPoint) {
        setIsSystemPointModalVisible(true);
        
      }else{
        use =  getUserDetails() ;
        setUserPointsEarned(use.points_earned)
      }
    });

    // Clean up socket on unmount
    return () => {
      socket.off('oserviceStatusUpdates');
    };
  }, []);

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

  const handleOkClick = () => {
    setUserPointsEarned(0); // Set userPointsEarned to 0 when OK is clicked
    setIsSystemPointModalVisible(false); // Close the modal
  };

  // Prevent back button when the modal is open
  useEffect(() => {
    const backAction = () => {
      if (isSystemPointModalVisible) {
        return true; // Block back button press when modal is open
      }
      return false; // Allow back button press otherwise
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove(); // Cleanup backHandler on unmount
  }, [isSystemPointModalVisible]);

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
                      <TouchableOpacity
                        onPress={() => deleteItem(item._id)}
                        style={styles.deleteButton}
                        disabled={!item.free && orderItems.filter(item => !item.free).length === 1 && hasUsedPoints} // Disable delete if points are used and only 1 payable item remains
                      >
                        <MaterialIcons 
                          name="delete" 
                          size={24} 
                          color={(!item.free && orderItems.filter(item => !item.free).length === 1 && hasUsedPoints) ? "grey" : "red"} // Change color if the button is disabled
                        />
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

      {/* System Point Modal */}
      <Modal
        transparent={true}
        visible={isSystemPointModalVisible}
        animationType="slide"
        onRequestClose={() => {}} // Disable the back button
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Important Notice</Text>
            <Text style={styles.modalText}>lAdmin Hayd No9at </Text>
            <TouchableOpacity style={styles.okButton} onPress={handleOkClick}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20, // Border radius for modern design
    padding: 20,
    alignItems: 'center',
    elevation: 10, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: 'orange',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10, // Button border radius
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ShoppingCartScreen;
