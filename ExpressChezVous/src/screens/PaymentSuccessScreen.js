import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, SafeAreaView, TouchableOpacity, Animated, BackHandler, Alert } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import io from 'socket.io-client';
import BottomSheet from './ChatSheetScreen'; // Assuming this is a valid component
import { BASE_URLIO } from '@env'; // Assuming you have environment variables
import  { useContext } from 'react';
import { DataContext } from '../navigation/DataContext';
import { BASE_URL } from '@env'; // Import the base URL from the .env file
import { getClient } from '../services/userService'
import axios from 'axios';
// Initialize Socket.IO connection
const socket = io(BASE_URLIO);

const PaymentSuccessScreen = ({ navigation, route }) => {
  const totalTimeInSeconds = 5 * 60;
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(5);
  const [orderStatus, setOrderStatus] = useState('pending'); 
  const [orderId, setOrderID] = useState(route.params.data.order_id || '');
  const [clientId, setClientId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [isChatDisabled, setIsChatDisabled] = useState(true); 
  const [redirectMessage, setRedirectMessage] = useState('');
  const [showExitButton, setShowExitButton] = useState(false); 

  const animatedValue = useRef(new Animated.Value(0)).current;
  const bottomSheetRef = useRef(null);
  const { sharedData } = useContext(DataContext);
  const nezPoint = sharedData.dicrPoints;
  const firstpoints = sharedData.firstPoints;
  const orders = sharedData.orders;

  const updateOrderItems = async () => {
    try {
        // API endpoint using the base URL from .env
        const apiUrl = `${BASE_URL}/api/order-items/update-order-items`;

        // Prepare the request body
        const requestBody = {
            
            items: orders
        };

        // Make the POST request
        const response = await axios.post(apiUrl, requestBody);

        // Check response status
        if (response.status === 200) {
            console.log('Success', 'Order items updated successfully');
        } else {
            console.log('Error', 'Failed to update order items');
        }
    } catch (error) {
        console.error('Error updating order items:', error);
        console.log('Error', 'Failed to update order items');
    }
};


  const updateUserPoints = async (points) => {
    try {
      const userId = await getClient();
        const apiUrl = `${BASE_URL}/api/users/update-points`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,        // Pass the user ID
                newPoints: points   // Pass the new points value
            }),
        });

        const result = await response.json();

        if (response.status === 200) {
            console.log('Success', `Points updated: ${result.user.points}`);
        } else {
            console.log('Error', result.message || 'Failed to update points');
        }
    } catch (error) {
        console.log('Error', 'Failed to update points');
        console.error(error);
    }
};


  // Emit orderId when component mounts to start watching order status
  useEffect(() => {
    
    
    // Listen for order status updates
    socket.on('orderStatusUpdates', (data) => {
      const status = data.order.status;
      const client_id = data.order.client_id;
      const driver_id = data.order.driver_id;

      console.log(status) ;
      console.log(clientId) ;
      console.log(driverId ,"d") ;
      setClientId(client_id);
      setDriverId(driver_id);
      setOrderStatus(status);

      // Handle order status logic based on received data
      if (status === 'delivered') {
        setIsChatDisabled(true);
        setRedirectMessage('Votre commande a été livrée. Tu as 2 minutes dans le chat avec le livreur');
        setShowExitButton(true);
          updateUserPoints(nezPoint);
        updateOrderItems();

    
          setRedirectMessage('Order chat session completed. Redirecting to feedback...');
         
            navigation.replace('feedback', { orderId });
        
      
      }

      if (status === 'cancelled') {
        updateUserPoints(firstpoints);

        Alert.alert('Order cancelled', 'Order  cancelled.');

        
          navigation.replace('Services');
       
      }

      if (status === 'in_progress') {
        setIsChatDisabled(false);
        updateUserPoints(nezPoint);
        updateOrderItems();
        console.log(orders);

      }
    });

    // Clean up socket on unmount
    return () => {
      socket.off('orderStatusUpdates');
    };
  }, []);

  // Handle back button press logic
  useEffect(() => {
    const backAction = () => {
      if (orderStatus === 'pending' || orderStatus === 'in_progress') {
        Alert.alert('Attendez !', 'Vous ne pouvez pas quitter cette page tant que la commande n\'est pas livrée.');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [orderStatus]);

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

      let totalTimeRemaining = totalTimeInSeconds;

      const interval = setInterval(() => {
        totalTimeRemaining -= 1;
        const newProgress = ((totalTimeInSeconds - totalTimeRemaining) / totalTimeInSeconds) * 100;
        setProgress(newProgress);

        if (totalTimeRemaining % 60 === 0) {
          setRemainingTime(totalTimeRemaining / 60);
        }

        if (totalTimeRemaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [orderStatus]);

  const openBottomSheet = () => {
    if (!isChatDisabled && bottomSheetRef.current) { 
      const screenHeight = Dimensions.get('window').height;
      bottomSheetRef.current.scrollTo(-screenHeight + 50);
    }
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-Dimensions.get('window').width, Dimensions.get('window').width],
  });

  const handleExitPress = () => {
    navigation.replace('feedback', { orderId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.menuIcon}></Text>
        <TouchableOpacity onPress={openBottomSheet} disabled={isChatDisabled}>
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
        <Text style={styles.successText}>
          {orderStatus === 'pending' ? 'VOTRE COMMANDE EN COURS DE TRAITEMENT' : 'Votre Comande est comfirmée'}
        </Text>
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
        {orderStatus !== 'pending' && (
          <>
            <Text style={styles.deliveryText}>ATTENTION ! LA COMMANDE EST SUR LE POINT D’ARRIVER.</Text>

            <View style={styles.circularContainer}>
              <Svg height="60" width="60" viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r="45" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="5" fill="none" />
                <Circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#fff"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (progress * 283) / 100}
                />
              </Svg>
              <Text style={styles.deliveryTime}>{`Il reste ${remainingTime} minutes`}</Text>
            </View>
          </>
        )}
      </View>

      {redirectMessage ? (
        <View style={styles.redirectMessageContainer}>
          <Text style={styles.redirectMessage}>{redirectMessage}</Text>
        </View>
      ) : null}

      {showExitButton && (
        <View style={styles.exitButtonContainer}>
          <TouchableOpacity style={styles.exitButton} onPress={handleExitPress}>
            <Text style={styles.exitButtonText}>Exit to Feedback</Text>
          </TouchableOpacity>
        </View>
      )}

      <BottomSheet ref={bottomSheetRef} orderId={orderId} clientId={clientId}>
        <View>
          <Text style={{ padding: 20, fontSize: 16 }}>Chat with us</Text>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    marginTop: 3,
  },
  menuIcon: {
    fontSize: 28,
    color: '#804000',
  },
  chatIcon: {
    width: 40,
    height: 40,
  },
  disabledChatIcon: {
    opacity: 0.3, 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#804000',
    marginTop: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: Dimensions.get('window').height * 0.05,
  },
  image: {
    width: Dimensions.get('window').width * 0.7,
    height: 250,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#804000',
  },
  checkIcon: {
    marginLeft: 10,
  },
  deliveryImageContainer: {
    position: 'absolute',
    top: Dimensions.get('window').height * 0.55,
    marginBottom: 0,
  },
  deliveryImage: {
    width: Dimensions.get('window').width * 1.2,
    height: Dimensions.get('window').height * 0.25,
  },
  bottomFixed: {
    width: '100%',
    backgroundColor: '#FFA500',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 9,
  },
  deliveryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  circularContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 5,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  redirectMessageContainer: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#FFF3CD',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  redirectMessage: {
    fontSize: 16,
    color: '#804000',
    textAlign: 'center',
  },
  exitButtonContainer: {
    position: 'absolute',
    bottom: 80,
    backgroundColor: '#FFA500',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  exitButton: {
    backgroundColor: '#804000',
    padding: 10,
    borderRadius: 5,
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentSuccessScreen;
