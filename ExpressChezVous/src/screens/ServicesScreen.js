import { BASE_URL, BASE_URLIO } from '@env';

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions ,Animated } from 'react-native';
import icon from '../assets/images/wave.png'; // Import your icon image
import axios from 'axios';
import { getClientId } from '../services/userService';

const ServicesScreen = ({ navigation }) => {
  const services = [
    { name: 'Service coursier', image: 'https://example.com/drinks.png', test: true },
    { name: 'J’ai faim', image: 'https://example.com/package.png', test: false },
    { name: 'Petits plaisirs ', image: 'https://example.com/food.png', test: true },
    { name: 'Boutique cadeaux', image: 'https://example.com/coca-cola.png', test: true },
    { name: 'Marché', image: 'https://example.com/supermarket.png', test: true },
  ];
  const animations = useRef(services.map(() => new Animated.Value(0))).current;
  const handleServicePress = (serviceName) => {
    if (serviceName === 'J’ai faim') {
      navigation.navigate('Home');
    }
  };


  
  useEffect(() => {
    const createCart = async () => {
      try {
        // Fetch the client ID (or obtain it from user context)
        const client_id = await getClientId();
        
        if (!client_id) {
          throw new Error('Client ID is missing');
        }

        // Send a POST request to create the cart
        const response = await axios.post(`${BASE_URL}/api/carts/add`, { client_id });
        
        // Handle the response
        // Store the cart data
      } catch (err) {
      
        console.error('Error creating cart:', err);
      }
    };

    // Call the createCart function
    createCart();
 // This will run when the component mounts

    // Trigger animations with delay for each service item
    animations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        delay: index * 200, // Delay each service's animation
        useNativeDriver: true,
      }).start();
    });
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Our Services</Text>
      <View style={styles.servicesContainer}>
        {services.map((service, index) => {
          const scale = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1], // Scale from 0 to 1
          });
          const rotate = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'], // Rotate 360 degrees
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.serviceItem,
                service.test && styles.testService,
                { transform: [{ scale }, { rotate }] }, // Apply scale and rotation animations
              ]}
            >
              <TouchableOpacity
                onPress={() => handleServicePress(service.name)}
                disabled={service.test}
              >
                <Image source={{ uri: service.image }} style={styles.serviceImage} />
                <Text style={styles.serviceText}>{service.name}</Text>
                {service.test && <Text style={styles.testLabel}>This service is in test</Text>}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
      <Image source={icon} style={styles.bottomImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFA500', // Orange background color
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
    fontSize: 10,
    color: '#888',
  },
  bottomImage: {
    position: 'absolute',
    bottom: 0,
    width: Dimensions.get('window').width,
    height: '20%',
    aspectRatio: 1, // Adjust aspect ratio if needed
  },
});

export default ServicesScreen;