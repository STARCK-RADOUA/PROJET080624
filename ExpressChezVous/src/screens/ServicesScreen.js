import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, ImageBackground, ActivityIndicator, InteractionManager, Platform, Dimensions } from 'react-native';
import io from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons'; // Icons like profile or cart
import { BASE_URLIO } from '@env';
import { DataContext } from '../navigation/DataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../utils/navigationRef'; // Import navigate function
import { Image as ExpoImage } from 'expo-image'; // Import expo-image

const { width, height } = Dimensions.get('window');

// Dynamic background colors based on service index


const ServicesScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNavigated, setHasNavigated] = useState(false); // Track if we've already navigated
  const animations = useRef([]);
  const { setSharedData } = useContext(DataContext);
  const [isContentReady, setIsContentReady] = useState(false);

  // Précharger les images avant affichage
  const prefetchImages = async (services) => {
    const imagePrefetches = services.map(service => ExpoImage.prefetch(service.image));
    await Promise.all(imagePrefetches);
  };

  // Check order status and navigate to PaymentSuccessScreen if needed
  const checkOrderStatus = async () => {
    try {
      const storedOrder = await AsyncStorage.getItem('orderStatus');
      if (storedOrder && !hasNavigated) { // Only proceed if we haven't navigated already
        const parsedOrder = JSON.parse(storedOrder);
        const { orderStatus } = parsedOrder;
        if (orderStatus === 'in_progress' || orderStatus === 'pending') {
          setHasNavigated(true); // Prevent further navigation
          navigate('PaymentSuccessScreen');
        }
      }
    } catch (error) {
      console.error('Error parsing stored order:', error);
    }
  };

  useEffect(() => {
    checkOrderStatus();
  }, []);

  useEffect(() => {
    const socket = io(BASE_URLIO);

    socket.on('servicesUpdated', async ({ services }) => {
      setServices(services);
      setIsLoading(false);

      if (services.length > 0) {
        animations.current = services.map(() => new Animated.Value(0));
        await prefetchImages(services);

        InteractionManager.runAfterInteractions(() => {
          triggerAnimations();
          setIsContentReady(true);
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const triggerAnimations = () => {
    animations.current.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        delay: index * 200,
        useNativeDriver: true,
      }).start();
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
        <Text style={styles.headerText}>Découvrez Nos {"\n"} Services Premium</Text>
        <Ionicons name="shield-checkmark-outline" size={50} color="#09881e" />
      </View>

      {isLoading || !isContentReady ? (
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
                  { backgroundColor: Platform.OS === 'android' ? '#271a061f' : '#1b110239' },
                  animatedStyles,
                ]}
              >
                <TouchableOpacity onPress={() => handleServicePress(service.name, service.test, service._id)}>
                  <ExpoImage source={{ uri: service.image }} style={styles.serviceImage} contentFit="contain" />
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
    backgroundColor: '#1a1a1a', // Un fond sombre pour un contraste fort avec les éléments
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
    backgroundColor: Platform.OS === 'ios' ? '#e9ab25' : '#e2a600',

    borderRadius: 20,
    padding: 2,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.5, // Ombre plus profonde
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 8,
  },
  userIcon: {
    width: 40,   // Légère augmentation de taille pour plus de présence
    height: 50,
    borderRadius: 25, // Toujours circulaire pour plus de modernité
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    backgroundColor: '#fff',
  },
  searchPlaceholder: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 5,
    letterSpacing: 1, // Espacement pour un effet plus propre
  },
  cartIcon: {
    margin: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#644304be', // Ajout d'un fond sombre avec un léger effet de transparence
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
   

    marginVertical: width * 0.02,
    marginHorizontal: width * 0.02,
    ...Platform.select({
      ios: {    borderRadius: 25,

      // Ombre plus grande pour plus de profondeur
        shadowRadius: 12,
      },  android: {
      borderWidth: 1.5,
      backgroundColor: '#644304be', // Ajout d'un fond sombre avec un léger effet de transparence
      borderColor: '#ffffff50',

      shadowColor: '#3f3b3b',
      shadowOpacity: 0.5,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 20,
      elevation: 9, 
           borderTopLeftRadius: 50,
    borderTopRightRadius:50,

      },})
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
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerText: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#b4ddb3',
    marginBottom: 20,
    letterSpacing: 2, // Plus d'espacement pour un effet moderne
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 5 },
    textShadowRadius: 15,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  

    ...Platform.select({
      ios: {
        width: '100%',
        paddingHorizontal: 15,
        shadowOpacity: 0.9,
        shadowOffset: { width: 0, height: 5 }, // Ombre plus grande pour plus de profondeur
        shadowRadius: 12,
        elevation: 18,
      },  android: {
        borderWidth: 1.5,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        
        borderColor: '#ffffff32',
        backgroundColor: '#6e6e6e13',
        marginVertical: width * 0.01,
        marginHorizontal: width * 0.02,
           shadowColor: '#3f3b3b',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 9,

      },
    }),
  },
  serviceItem: {
    width: width * 0.33,
    height: width * 0.33,
    borderRadius: width * 0.175, // Plus arrondi pour un effet de bulle 3D
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333', // Couleur sombre pour contraster avec les images
    margin: width * 0.06,
    marginBottom: width * 0.05,
    borderColor: '#7c570614', // Une couleur dorée pour un effet luxueux
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 10,
    elevation: 12,
    transform: [{ perspective: 1000 }],
  },
  shadowImageContainer: {
    position: 'absolute',
    top: 5,
    left: 5,
    zIndex: 1,
  },
  shadowImage: {
    width: width * 0.3,
    height: width * 0.3,
    resizeMode: 'contain',
    opacity: 0.8,
    shadowColor: '#000',
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 18,
  },
  serviceImage: {
    width: width * 0.34,
    height: width * 0.32,
    resizeMode: 'contain',
    borderRadius: 75,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.9,
    shadowRadius: 30, // Plus de rayon pour un effet 3D
    elevation: 20,
    backgroundColor: Platform.OS === 'ios' ? '#55545324' : '#3f3d3d92',
    borderWidth: 2,
    borderColor: '#f7ab08dd',
  },
  serviceText: {
    textAlign: 'center',
    width: width*0.4,
    fontSize: 18, // Augmentation légère pour une meilleure lisibilité
    color: '#f3ebebfd',
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
});


export default ServicesScreen;
