import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import BottomSheet from './ChatSheetScreen'; // Import your BottomSheet component

const PaymentSuccessScreen = () => {
  const totalTimeInSeconds = 5 * 60;
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(5);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const bottomSheetRef = useRef(null); // Ref for BottomSheet

  useEffect(() => {
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
  }, []);

  const openBottomSheet = () => {
    if (bottomSheetRef.current) {
      const screenHeight = Dimensions.get('window').height; // Get height here
      bottomSheetRef.current.scrollTo(-screenHeight + 50); // Open the BottomSheet
    }
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-Dimensions.get('window').width, Dimensions.get('window').width], // Access width directly
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.menuIcon}></Text>
        <TouchableOpacity onPress={openBottomSheet}>
          <Image
            source={{
              uri: 'https://firebasestorage.googleapis.com/v0/b/deliver-90a33.appspot.com/o/2665038.png?alt=media&token=9d61891a-3fa0-4673-b035-e4d29126563a',
            }}
            style={styles.chatIcon}
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
          style={[styles.image, { width: Dimensions.get('window').width * 0.7, height: Dimensions.get('window').height * 0.25 }]} // Access height and width directly
          resizeMode="contain"
        />
      </View>

      <View style={styles.successContainer}>
        <Text style={styles.successText}>Votre paiement est réussi</Text>
        <Image
          style={[styles.checkIcon, { width: Dimensions.get('window').width * 0.1, height: Dimensions.get('window').height * 0.05 }]} // Access width and height directly
          source={{
            uri: 'https://firebasestorage.googleapis.com/v0/b/deliver-90a33.appspot.com/o/7595571.png?alt=media&token=1c4db9c1-d641-42bb-a355-d68c2e40381f',
          }}
        />
      </View>

      <Animated.View style={[styles.deliveryImageContainer, { transform: [{ translateX }] }]}>
        <Image
          source={{
            uri: 'https://firebasestorage.googleapis.com/v0/b/deliver-90a33.appspot.com/o/de%201.png?alt=media&token=868bb01f-a8bc-43e1-80e4-365aabb1b6a1',
          }}
          style={[styles.deliveryImage, { width: Dimensions.get('window').width * 1.2, height: Dimensions.get('window').height * 0.25 }]} // Access width and height directly
          resizeMode="contain"
        />
      </Animated.View>

      <View style={styles.bottomFixed}>
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
      </View>

      {/* Bottom Sheet */}
      <BottomSheet ref={bottomSheetRef}>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#804000',
    marginTop: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: Dimensions.get('window').height * 0.05, // Access height directly here
  },
  image: {
    width: Dimensions.get('window').width * 0.7, // Access width directly
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
    top: Dimensions.get('window').height * 0.55, // Access height directly
    marginBottom: 0,
  },
  deliveryImage: {
    width: Dimensions.get('window').width * 1.2, // Access width directly
    height: Dimensions.get('window').height * 0.25, // Access height directly
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
});

export default PaymentSuccessScreen;
