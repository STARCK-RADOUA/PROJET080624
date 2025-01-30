import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, Image, SafeAreaView, TouchableOpacity, Animated, BackHandler, Alert, Dimensions, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet from './ChatSheetScreen'; 
import io from 'socket.io-client';
import { useNavigation } from '@react-navigation/native';
import { DataContext } from '../navigation/DataContext';
import { BASE_URLIO , BASE_URL } from '@env'; 
import { updateOrderItems, updateUserPoints } from '../services/orderService';
import styles from './styles/paymentSuccessStyles';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
const deviceId = Device.osBuildId;
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo

const socket = io(BASE_URLIO, {
  query: { deviceId },
});
const PaymentSuccessScreen = ({ route }) => {
  const [progress, setProgress] = useState(0);
  const [orderStatus, setOrderStatus] = useState('pending');
  const [orderId, setOrderID] = useState(route?.params?.data?.order_id || '');
  const [clientId, setClientId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [isChatDisabled, setIsChatDisabled] = useState(true);
  const [redirectMessage, setRedirectMessage] = useState('');
  const [showExitButton, setShowExitButton] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const bottomSheetRef = useRef(null);
  const { sharedData } = useContext(DataContext);
  const [nezPoint, setNezPoint] = useState(sharedData?.dicrPoints);
  const [orders, setOrders] = useState([]);
  const navigation = useNavigation();
  const [duration, setDuration] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isConnected, setIsConnected] = useState(true); // State to track internet connection

  const [messages, setMessages] = useState([]); // State for messages
  const socketRef = React.useRef(null);
  useEffect(() => {
    retrieveStateFromStorage();
    setOrders(sharedData?.orders)
    // Monitor network connection status
    const unsubscribe = NetInfo.addEventListener(async(state) => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        await saveStateToStorage(orderId, orderStatus, orders, nezPoint);
     }
     if (!isConnected) {
      await saveStateToStorage(orderId, orderStatus, orders, nezPoint);
     }
    });
  
  

    return () => {
      unsubscribe(); // Unsubscribe from NetInfo listener when the component unmounts
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (orderId) {
        // Check if socket is already instantiated
        if (!socket.connected) {
          socket.connect();  // Connecter le socket seulement s'il n'est pas connecté
        }
        socket.emit('watchChatMessagesOCLient', orderId);
          
        socket.on('OrderchatMessagesClientUpdated', (data) => {
            console.log("cgf" , data)
            const filteredMessages = data.messages.filter(message => message.lastMessage);
            if (filteredMessages.length > 0) {
              setMessages(filteredMessages);
            }
          });
  
          console.log("Socket connected for orderId:", orderId);
        
  
        return () => {
          socket.disconnect();
        };
      }
    }, [orderId])
  );
  
  // Save screen state to AsyncStorage before closing the app
  const saveStateToStorage = async (orderId, orderStatus, orders, nezPoint) => {
    try {
      console.log('------------------------------------');
      console.log('Saving order status in paay:', { orders, nezPoint });
      console.log('------------------------------------');
      const orderData = JSON.stringify({ orderId, orderStatus, orders, nezPoint });
      await AsyncStorage.setItem('orderStatus', orderData);
      console.log('Stored order status in paay:', orderData);
    } catch (error) {
      console.error('Error saving order status:', error);
    }
  };

  useEffect(() => {
    if (orderStatus === 'delivered') {
      // Active le chat pendant 2 minutes lorsque la commande est livrée
      setIsChatDisabled(false);
  
      const timer = setTimeout(() => {
        setIsChatDisabled(true);
      }, 2 * 60 * 1000); // 2 minutes
  
      return () => clearTimeout(timer); // Nettoie le timer si le composant est démonté
    }
  }, [orderStatus]);
  
 
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backAction = () => {
        if (orderStatus === 'pending' || orderStatus === 'in_progress') {
          Alert.alert('Attendez !', 'Vous ne pouvez pas quitter tant que la commande n\'est pas livrée.');
          return true;
        }
        return false;
      };
  
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }
  }, [orderStatus]);
  
  // Clear data from AsyncStorage except for `orderId`
  const clearDataExceptOrderId = async (orderId) => {
    try {
      const orderData = JSON.stringify({ orderId });
      await AsyncStorage.setItem('orderStatus', orderData);
      console.log('Cleared data except orderId:', orderData);
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };

  // Clear all data including `orderId` after completion
  const clearAllData = async () => {
    try {
      await AsyncStorage.removeItem('orderStatus');
      console.log('All order data removed.');
    } catch (error) {
      console.error('Error removing order data:', error);
    }
  };

  // Retrieve state from AsyncStorage
  const retrieveStateFromStorage = async () => {
    try {
      const savedOrderStatus = await AsyncStorage.getItem('orderStatus');
      if (savedOrderStatus) {
        const parsedStatus = JSON.parse(savedOrderStatus);
        console.log('Retrieved state:', parsedStatus);

        const { orderId, orderStatus, orders, nezPoint } = parsedStatus;
        if (orderId && (orderStatus === 'in_progress' || orderStatus === 'pending')) {
          setOrderID(orderId);
          setOrderStatus(orderStatus);
          setOrders(orders);
          console.log('------------------------------------');
          console.log('Retrieved state:', parsedStatus);
          console.log('------------------------------------');
          setNezPoint(nezPoint);
          socket.emit('watchOrderStatuss', { order_id: orderId });

        }
      }
    } catch (error) {
      console.error('Error retrieving state:', error);
    }
  };

  // Emit orderId when component mounts
  useEffect(() => {
    retrieveStateFromStorage();
    if (!socket.connected) {
      socket.connect();  // Connecter le socket seulement s'il n'est pas connecté
    }

    socket.emit('watchOrderStatuss', { order_id: orderId });

    socket.on('orderStatusUpdates', async (data) => {
      const status = data.order.status;
      const client_id = data.order.client_id;
      const driver_id = data.order.driver_id;

      setClientId(client_id);
      setDriverId(driver_id);
      setOrderStatus(status);

      // Save current state

      if (status === 'delivered') {
        socket.emit('disconnectRoute');
        setIsChatDisabled(false);

        setShowExitButton(true);
        if ((nezPoint || nezPoint === 0) && orders.length > 0) {
          await updateUserPoints(nezPoint);
          await updateOrderItems(orders);
        }
        await clearAllData(); // Clear all data once cancelled  

      }

      if (status === 'cancelled') {
        socket.emit('disconnectRoute');

        setIsChatDisabled(true);
        setRedirectMessage('Order cancelled', 'Order has been cancelled.');
        setShowExitButton(true);
    // Clear all data once cancelled  
             await clearAllData(); // Clear all data once cancelled  
             navigation.reset({
              index: 0,
              routes: [{ name: 'Services' }],
            });              }
            if (status === 'pending') {

        setIsChatDisabled(true);
        if (Array.isArray(orders)) {
          const items = orders.map(order => ({
            _id: order._id,
            free: order.free,
            quantity: order.quantity
          }));
        await updateOrderItems(items);
        }
        
    
            }

      if (status === 'in_progress') {
        setIsChatDisabled(false);
        if (Array.isArray(orders)) {
          const items = orders.map(order => ({
            _id: order._id,
            free: order.free,
            quantity: order.quantity
          }));
        await updateOrderItems(items);


           // Joindre le suivi de l'itinéraire
      socket.emit('joinRouteTracking', orderId);
console.log('------------------------------------');
console.log(orderId,"eeeee");
console.log('------------------------------------');
      // Écouter les mises à jour en temps réel
      socket.on('routeUpdate', (data) => {
        console.log('----------daaataaa--------------------------');
        console.log(data);
        console.log('------------------------------------');
          setDuration(data.resultDuration*60);
          setDistance(data.distance);
      });
          console.log('Items:', items);
        } else {
          console.error('Orders is not defined or not an array');
        }
      }
    });
  
    return () => {
      socket.off('orderStatusUpdates');  
      };
    
  }, [nezPoint]);
  

  // Handle back button press logic
  useEffect(() => {
    const backAction = () => {
      if (orderStatus === 'pending' || orderStatus === 'in_progress') {
        Alert.alert('Attendez !', 'Vous ne pouvez pas quitter tant que la commande n\'est pas livrée.');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [orderStatus]);

  // Save state when app goes to background or when screen is closed
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        await saveStateToStorage(orderId, orderStatus, orders, nezPoint);
      }
    });

    return () => {
      appStateListener.remove();
    };
  }, [orderId, orderStatus, orders, nezPoint]);

  // Animation for delivery image
  useEffect(() => {
    
    if (orderStatus !== 'pending') {

      const animateDeliveryImage = () => {
        animatedValue.setValue(0);
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 6000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateDeliveryImage();
      let totalTimeRemaining = duration*60;

      const interval = setInterval(() => {
        totalTimeRemaining -= 1;
  
        // Ensure totalTimeRemaining never becomes negative
        if (totalTimeRemaining < 0) {
          totalTimeRemaining = 0;
        }
  
        // Update the progress
        const newProgress = ((duration - totalTimeRemaining) / duration) * 100;
        setProgress(newProgress);
  
        // Clear interval when time runs out
        if (totalTimeRemaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);
  
      return () => clearInterval(interval);
    }
  }, [orderStatus, duration]);

  const openBottomSheet = () => {
    if (!isChatDisabled && bottomSheetRef.current) {
      const screenHeight = Dimensions.get('window').height;
      bottomSheetRef.current.scrollTo(-screenHeight + 50);
      markMessagesAsSeen() ;

    }
  };


  const markMessagesAsSeen = async () => {
    try {
      if (orderId) {
        await axios.post(`${BASE_URL}/api/chat/mark-seenFCC`, { orderId });
        console.log("Messages marked as seen");
        if (orderId) {
          // Check if socket is already instantiated
        
            socketRef.current = io(BASE_URLIO, { query: { orderId } });
            socketRef.current.emit('watchChatMessagesOCLient', orderId);
            
            socketRef.current.on('OrderchatMessagesClientUpdated', (data) => {
              console.log("cgf" , data)
              const filteredMessages = data.messages.filter(message => message.lastMessage);
              if (filteredMessages.length > 0) {
                setMessages(filteredMessages);
              }
            });
    
            console.log("Socket connected for orderId:", orderId);
          
    
        
        }
      }
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-Dimensions.get('window').width, Dimensions.get('window').width],
  });

  const handleExitPress = async() => {
    await clearAllData(); // Clear all data once cancelled  
    navigation.replace('feedback', { orderId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.menuIcon}></Text>
        <TouchableOpacity onPress={openBottomSheet} disabled={isChatDisabled}>
        {messages.map((message, index) => {
                              const hasUnread =  !message.lastMessage.seen && message.lastMessage.sender !== "client";
                              console.log(message.sender, "hgfg")
                              return (
                                hasUnread && (
                                  <View key={index} style={styles.unreadIndicator}>
                                    <View style={styles.redButton} />
                                  </View>
                                )
                              );
                            })}
          <Image
            source={{
              uri: 'https://firebasestorage.googleapis.com/v0/b/deliver-90a33.appspot.com/o/2665038.png?alt=media&token=9d61891a-3fa0-4673-b035-e4d29126563a',
            }}
            style={[styles.chatIcon, isChatDisabled ? styles.disabledChatIcon : null]}
            resizeMode="contain"
          />

        </TouchableOpacity>
      </View>

      <Text style={styles.title}></Text>

      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: 'https://firebasestorage.googleapis.com/v0/b/deliver-90a33.appspot.com/o/Untitled%20design.png?alt=media&token=e85d207b-b6d8-4a22-86b8-c51a06dabdaa',
          }}
          style={[styles.image, { width: Dimensions.get('window').width * 0.7, height: Dimensions.get('window').height * 0.25 }]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.successContainer}>
      <View style={styles.bottomFixed2}>

        <Text style={styles.successText}>
          {orderStatus === 'pending' ? 'VOTRE COMMANDE EN COURS DE TRAITEMENT' : orderStatus === 'in_progress' ? 'Votre Comande est comfirmée':  orderStatus === 'delivered' ? 'Votre commande a été livrée. Chat pendant 2 minutes.': orderStatus}

        </Text>
        <Text style={styles.redirectMessage2}> 
  {orderStatus === 'in_progress' 
    ? (duration !== null 
        ? (Math.floor(duration/60) <1 ? "Le livreur est là, prêt à vous faire sourire avec votre commande ! 😊":`Il reste ${Math.floor(duration / 60)} min ` 
        ): 'Calcul en cours...') 
    : " "}
</Text>

        </View>


        {orderStatus !== 'pending' && (
          <Image
            style={[styles.checkIcon, { width: Dimensions.get('window').width * 0.1, height: Dimensions.get('window').height * 0.05 }]}
            source={{
              uri: 'https://firebasestorage.googleapis.com/v0/b/deliver-90a33.appspot.com/o/7595571.png?alt=media&token=1c4db9c1-d641-42bb-a355-d68c2e40381f',
            }}
          />
        )}
      </View>

      {orderStatus !== 'pending' && (
        <Animated.View style={[styles.deliveryImageContainer, { transform: [{ translateX }] }]}>
          <Image
            source={{
              uri: 'https://firebasestorage.googleapis.com/v0/b/deliver-90a33.appspot.com/o/de%201.png?alt=media&token=868bb01f-a8bc-43e1-80e4-365aabb1b6a1',
            }}
            style={[styles.deliveryImage, { width: Dimensions.get('window').width * 1.2, height: Dimensions.get('window').height * 0.25 }]}
            resizeMode="contain"
          />
        </Animated.View>
      )}
   
      <View style={styles.bottomFixed}>
        {orderStatus == 'in_progress' && (
          <>

            <View style={styles.circularContainer}>
             
              <Text style={styles.deliveryTimetext}>{duration !== null ? `Il reste ${Math.floor(duration / 60)}min` : 'Calcul en cours...'}</Text>

              
               </View>
        {2 > (Math.floor(duration / 60)) && (
          <>
            <Text style={styles.deliveryText}>ATTENTION ! LA COMMANDE EST SUR LE POINT D’ARRIVER.</Text>

            
          </>
        )}
          </>
        )}
      </View>
  

      {redirectMessage ? (
        <View style={styles.redirectMessageContainer}>
          <Text style={styles.redirectMessage2}>{redirectMessage}</Text>

        </View>
      ) : null}

      {showExitButton && (
        <View style={styles.exitButtonContainer}>
          <TouchableOpacity style={styles.exitButton} onPress={handleExitPress}>
            <Text style={styles.exitButtonText}>  La touche finale  </Text>
          </TouchableOpacity>
        </View>
      )}

      {(orderStatus === 'in_progress' || !isChatDisabled ) && (
  <BottomSheet ref={bottomSheetRef} orderId={orderId} clientId={clientId} driverId={driverId}>
    <View>
      <Text style={{ padding: 20, fontSize: 16 }}>Chat with us</Text>
    </View>
  </BottomSheet>
)}

     
    </SafeAreaView>
  );
};

export default PaymentSuccessScreen;
