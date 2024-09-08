import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';
import { DataContext } from '../navigation/DataContext';

const ServicesScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const animations = useRef([]); // Store animation values
  const { setSharedData } = useContext(DataContext);

  useEffect(() => {
    const socket = io(BASE_URLIO);

    socket.on('servicesUpdated', ({ services }) => {
      setServices(services);

      // Initialize animations based on the number of services
      if (services.length > 0) {
        // Reset the animations array
        animations.current = services.map(() => new Animated.Value(0)); // Ensure animations are mapped to services
        triggerAnimations(); // Trigger animations
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Trigger animations
  const triggerAnimations = () => {
    animations.current.forEach((anim, index) => {
      if (anim) {
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          delay: index * 200, // Stagger the animations
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
    <View style={styles.container}>
      <Text style={styles.headerText}>Our Services</Text>
      <View style={styles.servicesContainer}>
        {services.map((service, index) => {
          // Ensure animations.current[index] exists before accessing it
          const scale = animations.current[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1], // Scale from 0.8 to 1
          });

          const rotate = animations.current[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'], // Rotate from 0 to 360 degrees
          });

          // If scale or rotate is not defined, don't apply any transform
          const animatedStyles = scale && rotate
            ? { transform: [{ scale }, { rotate }] }
            : {};

          return (
            <Animated.View
              key={index}
              style={[
                styles.serviceItem,
                service.test && styles.testService,
                animatedStyles, // Apply the animation styles only if they are defined
              ]}
            >
              <TouchableOpacity onPress={() => handleServicePress(service.name, service.test, service._id)}>
                <Image source={{ uri: service.image }} style={styles.serviceImage} />
                <Text style={styles.serviceText}>{service.name}</Text>
              </TouchableOpacity>
              {service.test && <Text style={styles.testLabel}>Test</Text>}
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9ab25', // Orange background color
    alignItems: 'center',
    paddingTop: 50,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  serviceItem: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  testService: {
    opacity: 0.6, // Make test services appear disabled
  },
  serviceImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  serviceText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  testLabel: {
    position: 'absolute',
    bottom: -20,
    textAlign: 'center',
    fontSize: 20,
    color: '#f8f8f8',
  },
});

export default ServicesScreen;
