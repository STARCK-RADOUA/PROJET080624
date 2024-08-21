import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env';

const ServicesScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [areAnimationsReady, setAnimationsReady] = useState(false); // Add a flag for animation readiness
  const animations = useRef([]); // Store animation values

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/services`);
      const fetchedServices = response.data;
      console.log('------------------------------------');
      console.log('Fetched Services:', fetchedServices);
      console.log('------------------------------------');

      setServices(fetchedServices);

      // Initialize animations based on the number of services
      if (fetchedServices.length > 0) {
        animations.current = fetchedServices.map(() => new Animated.Value(0)); // Create animations
        setAnimationsReady(true); // Set the flag once animations are ready
        triggerAnimations();
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Trigger animations
  const triggerAnimations = () => {
    if (animations.current.length > 0) {
      animations.current.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          delay: index * 200, // Add delay for staggered animation
          useNativeDriver: true,
        }).start();
      });
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleServicePress = (serviceName,serviceTest) => {

    dataTosend = {
        
      serviceName: serviceName,
      serviceTest: serviceTest,
     
    }


console.log('------------------------------------');
console.log('-------------------dataTosend-------------------');
console.log(dataTosend);
console.log('------------------------------------');

    if (serviceName === 'J’ai faim' && !serviceTest) {
   
      navigation.navigate('Home',dataTosend);
    }if (serviceName === 'Service coursier'&& !serviceTest) {
      navigation.navigate('Home',dataTosend);
    }if (serviceName === 'Petits plaisirs' && !serviceTest) {
      navigation.navigate('Home',dataTosend);
    }if (serviceName === 'Boutique cadeaux' && !serviceTest) {
      navigation.navigate('Home',dataTosend);
    }if (serviceName === 'Marché' && !serviceTest) {
      navigation.navigate('Home',dataTosend);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Our Services</Text>
      <View style={styles.servicesContainer}>
        {areAnimationsReady && services.map((service, index) => {
          // Safe access to animations only when animations are ready
          const scale = animations.current[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          const rotate = animations.current[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
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
              <TouchableOpacity onPress={() => handleServicePress(service.name,service.test)} disabled={service.test}>
                <Image source={{ uri: service.image }} style={styles.serviceImage} />
                <Text style={styles.serviceText}>{service.name}</Text>
                {service.test && <Text style={styles.testLabel}>This service is in test</Text>}
              </TouchableOpacity>
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
});

export default ServicesScreen;
