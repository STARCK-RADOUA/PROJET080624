import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, ImageBackground, ActivityIndicator, InteractionManager, Platform } from 'react-native';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';
import { DataContext } from '../navigation/DataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../utils/navigationRef'; // Import navigate function

const ServicesScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [hasNavigated, setHasNavigated] = useState(false); // Track if we've already navigated
  const animations = useRef([]); 
  const { setSharedData } = useContext(DataContext);

  // Check the order status and navigate to PaymentSuccessScreen if needed
  const checkOrderStatus = async () => {
    try {
      const storedOrder = await AsyncStorage.getItem('orderStatus');
      console.log('Stored order value:', storedOrder); 
  
      if (storedOrder && !hasNavigated) { // Only proceed if we haven't navigated already
        const parsedOrder = JSON.parse(storedOrder); 
        const { orderId, orderStatus } = parsedOrder;
  
        console.log('Parsed Order ID:', orderId);
        console.log('Parsed Order Status:', orderStatus);
  
        if (orderStatus === 'in_progress' || orderStatus === 'pending') {
          console.log('Navigating to PaymentSuccessScreen');
          setHasNavigated(true); // Prevent further navigation
          navigate('PaymentSuccessScreen');
        }
      } else {
        console.log('No stored order found or already navigated.');
      }
    } catch (error) {
      console.error('Error parsing stored order:', error);  
    }
  };

  useEffect(() => {
        checkOrderStatus();

  }, []); // Ensure this runs once when the component is mounted

  useEffect(() => {
    const socket = io(BASE_URLIO);

    socket.on('servicesUpdated', ({ services }) => {
      setServices(services);
      setIsLoading(false); 

      if (services.length > 0) {
        animations.current = services.map(() => new Animated.Value(0));
        InteractionManager.runAfterInteractions(() => {
          triggerAnimations(); 
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const triggerAnimations = () => {
    animations.current.forEach((anim, index) => {
      if (anim) {
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          delay: index * 200, 
          useNativeDriver: true, 
        }).start();
      }
    });
  };

  const handleServicePress = (serviceName, serviceTest, id) => {
    setSharedData({ serviceName, serviceTest, id });
    navigation.navigate('Home', { serviceName, serviceTest, id });
  };

  return (
    <ImageBackground
      source={require('../assets/8498789sd.png')} 
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.headerText}>Our Services</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : (
          <View style={styles.servicesContainer}>
            {services.map((service, index) => {
              const scale = animations.current[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1], 
              });

              const opacity = animations.current[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1], 
              });

              const animatedStyles = scale && opacity
                ? { transform: [{ scale }], opacity }
                : {};

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.serviceItem,
                    animatedStyles, 
                  ]}
                >
                  <TouchableOpacity onPress={() => handleServicePress(service.name, service.test, service._id)}>
                    {Platform.OS === 'android' && (
                      <View style={styles.shadowImageContainer}>
                        <Image source={{ uri: service.image }} style={styles.shadowImage} />
                      </View>
                    )}

                    <Image source={{ uri: service.image }} style={styles.serviceImage} />
                    <Text style={styles.serviceText}>{service.name}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    alignItems: 'center',
    paddingTop: 50,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
    letterSpacing: 1.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  serviceItem: {
    width: 130,
    height: 130,
    borderRadius: 90, 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27262618',
    borderRadius: 100, 
    margin: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.9, 
        shadowRadius: 10, 
      },
    }),
  },
  shadowImageContainer: {
    position: 'absolute',
    top: 5,
    left: 5,
    zIndex: 1, 
  },
  shadowImage: {
    width: 150,
    height: 110,
    resizeMode: 'contain',
    tintColor: '#000', 
    opacity: 0.5, 
  },
  serviceImage: {
    width: 150,
    height: 110,
    resizeMode: 'contain',
    alignItems: 'center',
    borderRadius: 15,
    marginVertical: 10,
    zIndex: 2, 
  },
  serviceText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 17,
    color: '#f3ebebb0',
    fontWeight: '600',
  },
});

export default ServicesScreen;
