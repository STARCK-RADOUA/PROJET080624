import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, ImageBackground, ActivityIndicator, InteractionManager, Platform } from 'react-native';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';
import { DataContext } from '../navigation/DataContext';

const ServicesScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const animations = useRef([]); // Store animation values
  const { setSharedData } = useContext(DataContext);

  useEffect(() => {
    const socket = io(BASE_URLIO);

    socket.on('servicesUpdated', ({ services }) => {
      setServices(services);
      setIsLoading(false); // Hide loading animation once services are fetched

      if (services.length > 0) {
        animations.current = services.map(() => new Animated.Value(0));
        InteractionManager.runAfterInteractions(() => {
          triggerAnimations(); // Trigger animations when the screen is ready
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
          delay: index * 200, // Stagger animations for each service
          useNativeDriver: true, // Ensure animations run on the native thread
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
      source={require('../assets/8498789sd.png')} // Replace with your actual background image URL
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.headerText}>Our Services</Text>

        {isLoading ? (
          // Show loading animation while data is being fetched
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : (
          // Show services once data is fetched
          <View style={styles.servicesContainer}>
            {services.map((service, index) => {
              const scale = animations.current[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1], // Start small and scale to normal size
              });

              const opacity = animations.current[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1], // Fade in from 0 to 1
              });

              const animatedStyles = scale && opacity
                ? { transform: [{ scale }], opacity }
                : {};

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.serviceItem,
                    animatedStyles, // Apply animation styles here
                  ]}
                >
                  <TouchableOpacity onPress={() => handleServicePress(service.name, service.test, service._id)}>
                    {/* Shadow image for Android */}
                    {Platform.OS === 'android' && (
                      <View style={styles.shadowImageContainer}>
                        <Image source={{ uri: service.image }} style={styles.shadowImage} />
                      </View>
                    )}

                    {/* Original image */}
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay to make text and circles stand out
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
    borderRadius: 90, // Circular shape
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27262618',
    borderRadius: 100, // Circular shape
    margin: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 4 }, // iOS shadow
        shadowOpacity: 0.9, // iOS shadow
        shadowRadius: 10, // iOS shadow
      },
    
    }),
  },
  shadowImageContainer: {
    position: 'absolute',
    top: 5,
    left: 5,


    zIndex: 1, // Place shadow behind the original image
  },
  shadowImage: {
    width: 150,
    height: 110,
    resizeMode: 'contain',
    tintColor: '#000', // Make the shadow image appear dark
    opacity: 0.5, // Adjust opacity to simulate shadow
  },
  serviceImage: {
    width: 150,
    height: 110,
    resizeMode: 'contain',
    alignItems: 'center',
    borderRadius: 15,
    marginVertical: 10,
    zIndex: 2, // Make sure the original image is in front
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
