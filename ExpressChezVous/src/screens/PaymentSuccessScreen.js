import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, Image, SafeAreaView, TouchableOpacity, Animated, BackHandler, Alert, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import BottomSheet from './ChatSheetScreen'; 
import io from 'socket.io-client';
import { useNavigation } from '@react-navigation/native';
import { DataContext } from '../navigation/DataContext';
import { BASE_URLIO } from '@env'; 
import { updateOrderItems, updateUserPoints, getClientId } from '../services/orderService';
import styles from './styles/paymentSuccessStyles';

// Initialize Socket.IO connection
const socket = io(BASE_URLIO);

const PaymentSuccessScreen = ({ route }) => {
  const totalTimeInSeconds = 5 * 60;
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(5);
  const [orderStatus, setOrderStatus] = useState('pending');
  const [orderId, setOrderID] = useState(route.params.data.order_id ||route.params.order_id || '');
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

  const navigation = useNavigation();

  // Emit orderId when component mounts
  useEffect(() => {
    socket.emit('watchOrderStatuss', { order_id: orderId });

    socket.on('orderStatusUpdates', async (data) => {
      const status = data.order.status;
      const client_id = data.order.client_id;
      const driver_id = data.order.driver_id;

      setClientId(client_id);
      setDriverId(driver_id);
      setOrderStatus(status);

      if (status === 'delivered') {
        setIsChatDisabled(true);
        setRedirectMessage('Votre commande a été livrée. Chat pendant 2 minutes.');
        setShowExitButton(true);
        await updateUserPoints(nezPoint);
        await updateOrderItems(orders);
        navigation.replace('feedback', { orderId });
      }

      if (status === 'cancelled') {
        await updateUserPoints(firstpoints);
        Alert.alert('Order cancelled', 'Order has been cancelled.');
        navigation.replace('Services');
      }

      if (status === 'in_progress') {
        setIsChatDisabled(false);
        await updateUserPoints(nezPoint);
        await updateOrderItems(orders);
      }
    });

    return () => socket.off('orderStatusUpdates');
  }, []);

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

{orderStatus === 'in_progress' && (
<BottomSheet ref={bottomSheetRef} orderId={orderId} clientId={clientId} driverId={driverId} >
  <View>
    <Text style={{ padding: 20, fontSize: 16 }}>Chat with us</Text>
  </View>
</BottomSheet>
)}
  </SafeAreaView>
  );
};

export default PaymentSuccessScreen;
