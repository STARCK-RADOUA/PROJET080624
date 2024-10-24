import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, ImageBackground, ActivityIndicator, InteractionManager, Platform, Dimensions } from 'react-native';
import io from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons'; // Icons like profile or cart
import { BASE_URLIO } from '@env';
import { DataContext } from '../navigation/DataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../utils/navigationRef'; // Import navigate function

const { width, height } = Dimensions.get('window');

// Dynamic background colors based on service index
const getBackgroundColor = (index) => {
  const colors = ['#da8910b2', '#149b1b86', '#1a75c081', '#ba68c89d', '#ff89658b', '#ffd64f88'];
  return colors[index % colors.length];
};

const ServicesScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNavigated, setHasNavigated] = useState(false); // Track if we've already navigated
  const animations = useRef([]); 
  const { setSharedData } = useContext(DataContext);

  // Check order status and navigate to PaymentSuccessScreen if needed
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
      {/* Header Section with Icons */}
      <View style={styles.header}>
      <Image 
  source={require('../assets/images/8498789.png')} 
  style={styles.userIcon}
/>
  <Text style={styles.searchPlaceholder}>De quoi avez-vous besoin ?</Text>
  <Ionicons name="cart-outline" size={28} color="#fff" style={styles.cartIcon} />
</View>

{/* Section Localisation */}
<View style={styles.locationContainer}>
  <Text style={styles.headerText}>  Découvrez Nos {"\n"}   Services Premium</Text>

  <Ionicons name="shield-checkmark-outline" size={40} color="#fff" />
  
</View>

{isLoading ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#ffffff" />
    <Text style={styles.loadingText}>Chargement des services...</Text>
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
                  { backgroundColor: getBackgroundColor(index) },
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 20,
    paddingBottom: 10,
    paddingLeft: 20,
    margin: 10,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: height * (Platform.OS === 'ios' ? 0.06 : 0.05),
    alignItems: 'center',
    backgroundColor: '#e9ab25',
    borderRadius: 20,
    padding: 2,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  userIcon: {
    paddingRight: 10,
  },
  searchPlaceholder: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  cartIcon: {
    paddingLeft: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  locationText: {
    fontSize: 16,
    color: '#fff',
    paddingRight: 5,
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
  headerText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  userIcon: {
    width: 32,   // la largeur de l'image
    height: 42,  // la hauteur de l'image
    borderRadius: 16, // rend l'image circulaire si c'est un carré
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 15,
      shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 18,
  },
  serviceItem: {
    width: 130,
    height: 130,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27262618',
    margin: 15,
    borderWidth: 2,
    borderColor: '#fab828',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.9,
        shadowRadius: 10,
      },  android: {
    padding: 2,
    shadowColor: '#000',
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    
    elevation: 18,
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
    opacity: 0.9,
    shadowColor: '#000',
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    
    elevation: 18,
    
  },
  serviceImage: {
    width: 150,
    height: 110,
    resizeMode: 'contain',
    borderRadius: 15,
    marginVertical: 10,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
  },
  serviceText: {
    marginTop: 15,
    textAlign: 'center',
    fontSize: 17,
    color: '#f3ebebfd',
    fontWeight: '600',
  },
});

export default ServicesScreen;
