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
  const serviceTest = sharedData.serviceTest;
  const serviceId = sharedData.id;


  const [hasUsedPoints, setHasUsedPoints] = useState(false); // New state to track if points were used
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSystemPointModalVisible, setIsSystemPointModalVisible] = useState(false); // Modal visibility
  const { setSharedData } = useContext(DataContext);
  const [isOrderButtonVisible, setIsOrderButtonVisible] = useState(true);
  const [userPoints, setUserPoints] = useState(0); // Track user's points
  const [isDataFetched, setIsDataFetched] = useState(false); // New state to track if data fetching is done
  const [isSystemPoint, setIsSystemPoint] = useState(false); // New state to track if data fetching is done

  

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getUserDetails();
      setUserPointsEarned(user.points_earned);
      setUserPoints(user.points_earned);
    };
  
    const fetchOrderItems = async () => {
      try {
        const clientId = await getClientId();
        const url = `${BASE_URL}/api/order-items/${clientId}/${serviceName}/order-items`;
        const response = await axios.get(url);
        const fetchedItems = response.data.map(item => ({ ...item, free: false })); // Add 'free' flag to each item
        setOrderItems(fetchedItems);
        calculateTotalPrice(fetchedItems);
        calculateItemsInTheCart(fetchedItems);
        setHasUsedPoints(fetchedItems.some(item => item.free)); // Check if any item is free (points used)
      } catch (error) {
        console.error('Failed to fetch order items:', error.message || error);
        setError('Failed to fetch order items. Please check the console for details.');
      }
    };
  
    const fetchData = async () => {
      await fetchUserData();
      await fetchOrderItems();
      setIsDataFetched(true); // Mark data fetching as completed
    };
  
    fetchData();
  
    const deviceId = Device.identifierForVendor;
    console.log('Device ID:', deviceId);
  }, []);
  
  useEffect(() => {
    socket.on('servicesUpdated', async ({ services }) => {
      const filteredServices = services.filter(service => service._id === sharedData.id);
      console.log("Service data is", filteredServices);
  
      if (!filteredServices[0]?.isSystemPoint && isDataFetched) { // Ensure data fetching is done
        setIsSystemPointModalVisible(true);
        setIsSystemPoint(true);

      } else {
        // Reset all values if system point is active
        setExpandedItemId(null);
        setTotalPrice(0);
        setUserPointsEarned(0);
        setMyFreeItem(0);
        setItemsInTheCart(0);
        setError('');
        setHasUsedPoints(false);
  
        const user = await getUserDetails();
        setUserPointsEarned(user.points_earned); // Reset points
        await fetchOrderItems(); // Re-fetch order items if necessary
      }
    });
  
    return () => {
      socket.off('servicesUpdated');
    };
  }, [isDataFetched]);
 
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
    setOrderItems((prevItems) => {
      // Sort items by their original price
      const sortedItems = [...prevItems].sort((a, b) => a.product_id.price - b.product_id.price);
  
      // Log sorted items for debugging
      console.log("Sorted Items by Price:", sortedItems.map((item) => item.product_id.price));
  
      // Find the cheapest free item
      const cheapestFreeItem = sortedItems.find((item) => item.free);
      const updatedItems = prevItems.map((item) => {
        // If this is the item being toggled
        if (item._id === itemId) {
          const pointsRequired = item.quantity;
  
          // **Toggling OFF a free item**
          if (item.free) {
            // Check if it's the cheapest free item and other more expensive items are still free
            if (cheapestFreeItem === item && sortedItems.some((i) => i.free && i.product_id.price > item.product_id.price)) {
              Alert.alert(
                "Cannot switch off the cheapest item",
                "You must toggle off more expensive free items before switching off the cheapest free item."
              );
              return item; // Prevent toggling off
            }
  
            // Otherwise, allow toggling off
            setUserPointsEarned((prevPoints) => prevPoints + pointsRequired); // Return points
            setMyFreeItem((prev) => prev - 1); // Decrease the count of free items
            return { ...item, free: false }; // Mark item as not free
          }
  
          // **Toggling ON an item to make it free**
          if (!item.free) {
            // Ensure only the cheapest item can be made free
            const cheapestItem = sortedItems.find((i) => !i.free);
            if (item !== cheapestItem) {
              Alert.alert(
                "Choose the cheapest item",
                "You must apply points to the cheapest item first."
              );
              return item; // Prevent making a non-cheapest item free
            }
  
            // Check if the user has enough points to make this item free
            if (userPointsEarned >= pointsRequired) {
              setUserPointsEarned((prevPoints) => prevPoints - pointsRequired); // Deduct points
              setMyFreeItem((prev) => prev + 1); // Increase the count of free items
              return { ...item, free: true }; // Mark item as free
            } else {
              Alert.alert(
                "Not enough points",
                "You do not have enough points to make this item free."
              );
              return item; // Prevent toggling if not enough points
            }
          }
        }
        return item; // Leave all other items unchanged
      });
  
      calculateTotalPrice(updatedItems); // Recalculate the total price
      return updatedItems; // Update the state with the new items
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

  const getServiceById = async () => {
    try {
      // Construct the URL for the GET request
      const url = `${BASE_URL}/api/services/${sharedData.id}`;
  
      // Make the GET request to the server
      const response = await axios.get(url);
  
      // Check if isSystemPoint is true, then initiate certain values to 0
      if (!response.data.isSystemPoint) {
        setUserPointsEarned(0);
        setUserPoints(0);
    
        setMyFreeItem(0);
        setItemsInTheCart(0);
        setHasUsedPoints(false);
        console.log('isSystemPoint is true. Values set to 0.');
      }
  
      // Return the service data (in case you need it elsewhere)
      return response.data.isSystemPoint;
    } catch (error) {
      // Log the error to the console
      console.error('Error fetching service:', error.response ? error.response.data : error.message);
  
      // Throw the error for further handling
      throw error;
    }
  };

  

  useFocusEffect(




    
    useCallback(() => {
      // Reset states to their initial values when navigating back
      setExpandedItemId(null);
      setMyFreeItem(0);
      setHasUsedPoints(false);
  
      const fetchData = async () => {
        try {
          const user = await getUserDetails();
          setUserPointsEarned(user.points_earned); // Reset points to the user's initial value
          await fetchOrderItems(); // Re-fetch the order items if necessary
  
          // Fetch service data to check isSystemPoint and reset values if needed
          await getServiceById();
        } catch (error) {
          console.error('Error in useFocusEffect:', error);
        }
      };
  
      fetchData();
  
      return () => {
        // Optional cleanup logic
      };
    }, []) // Empty dependency array means this effect will run every time the screen comes into focus
  );
  
  

  

  const handleItemPress = (itemId) => {
    setExpandedItemId((prevId) => (prevId === itemId ? null : itemId));
  };

  const handleOrderNow = async () => {
    try {
      if((myFreeItem > 0 && userPoints > 0) || userPoints === 0){
        const deviceId = Device.identifierForVendor;
        const data = {
          totalPrice: totalPrice,
          orderItems: orderItems,
          deviceId: deviceId,
        };
        setSharedData({ dicrPoints : userPointsEarned , firstPoints : userPoints , orders :orderItems ,  serviceName: serviceName, serviceTest: serviceTest, id: serviceId });
        navigation.navigate('AdressForm', { newOrder: data });
      }else{
alert("vous devez avoir au moins un item gratuit")
      }
     
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
      setExpandedItemId(null);
      setTotalPrice(0);
      setUserPointsEarned(0);
      setMyFreeItem(0);
      setItemsInTheCart(0);
      setError('');
      setHasUsedPoints(false);
       // Fetch data again if necessary
       const fetchData = async () => {
        try {
          
          await fetchOrderItems();  // Re-fetch the order items if necessary
        } catch (error) {
          console.error('Error in useFocusEffect:', error);
        }
      };
  
      fetchData();
    setIsSystemPointModalVisible(false); // Close the modal
  };

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY > lastScrollY) {
      // Scrolling down
      setIsOrderButtonVisible(false);
    } else if (currentScrollY < lastScrollY) {
      // Scrolling up
      setIsOrderButtonVisible(true);
    }
    setLastScrollY(currentScrollY);
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
      <Header navigation={navigation} />
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
        {isSystemPointModalVisible && (
              <View style={styles.pointsCounter1}>
                <Text style={styles.systemtest}>Les points sont désactivés pour l'instant.Merci!</Text>
              </View>
             
          )}
          <ScrollView 
            style={styles.menuList}
            onScroll={handleScroll}  // Attach the scroll event
            scrollEventThrottle={16} // Control how often the scroll event is fired (16ms for smooth tracking)
          >
            {orderItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handleItemPress(item._id)}>
                <View style={styles.itemContainer}>
                  <Image source={{ uri: item.product_id.image_url }} style={styles.menuItemImage} />
                  <View style={styles.menuItemDetails}>
                    <Text style={styles.menuItemName}>{item.product_id.name}</Text>

                    <View style={styles.priceSwitchContainer}>
                      <Text style={styles.priceText}>€{item.free ? 0 : item.price.toFixed(2)}</Text>
                      {shouldShowSwitch() && (
                        <Switch
                          style={styles.switchButton}
                          value={item.free}
                          onValueChange={() => toggleFreeItem(item._id)}
                          disabled={shouldDisableSwitch(item)}
                        />
                      )}
                    </View>
                    
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
                        disabled={!item.free && orderItems.filter(item => !item.free).length === 1 && hasUsedPoints} 
                      >
                        <MaterialIcons 
                          name="delete" 
                          size={24} 
                          color={(!item.free && orderItems.filter(item => !item.free).length === 1 && hasUsedPoints) ? "grey" : "red"} 
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Show/hide the order button based on scroll */}
          {isOrderButtonVisible && (
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
          )}
        </>
      )}

     
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  menuList: {
    marginTop: 10,

  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 5,
    marginVertical: 5,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 6,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  menuItemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  menuItemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  menuItemName: {
    fontSize: 19,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    fontWeight: '600',
    textShadowColor: '#ffa726',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  menuItemDescription: {
    color: '#8e8e93',
    marginBottom: 6,
    fontSize: 14,
  },
  priceSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
     fontSize: 17,
    fontWeight: 'bold',
    color: '#ffa726',
    fontWeight: '600',
    textShadowColor: '#b46f07',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  switchButton: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  rightContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 5,
  },
  deleteButton: {
    marginTop: 10,
  },
  orderButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffffa0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 6,
    elevation: 5,
  },
  pointsCounter: {
    backgroundColor: '#edededf80',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },  pointsCounter1: {
    borderRadius: 20,
    alignItems: 'center',

    paddingHorizontal: 18,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontWeight: '600',
    textShadowColor: '#ffa726',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  orderButton: {
    backgroundColor: '#e9ab25',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 12,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontWeight: '600',
    textShadowColor: '#30271b',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  }, systemtest: {
    fontSize: 15,
    fontWeight: 'bold',
    fontWeight: 'bold',
    color: '#e95d25',
    fontWeight: '600',
    textShadowColor: '#ce9a0ad3',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  disabledOrderButton: {
    backgroundColor: '#cccccc',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: '#e9ab25',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});


export default ShoppingCartScreen;