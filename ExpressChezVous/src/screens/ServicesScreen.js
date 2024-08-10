import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import icon from '../assets/images/wave.png'; // Import your icon image

const ServicesScreen = ({ navigation }) => {
  const services = [
    { name: 'Service coursier', image: 'https://example.com/drinks.png', test: true },
    { name: 'J’ai faim', image: 'https://example.com/package.png', test: false },
    { name: 'Petits plaisirs ', image: 'https://example.com/food.png', test: true },
    { name: 'Boutique cadeaux', image: 'https://example.com/coca-cola.png', test: true },
    { name: 'Marché', image: 'https://example.com/supermarket.png', test: true },
  ];

  const handleServicePress = (serviceName) => {
    if (serviceName === 'J’ai faim') {
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Our Services</Text>
      <View style={styles.servicesContainer}>
        {services.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.serviceItem, service.test && styles.testService]}
            onPress={() => handleServicePress(service.name)}
            disabled={service.test}
          >
            <Image source={{ uri: service.image }} style={styles.serviceImage} />
            <Text style={styles.serviceText}>{service.name}</Text>
            {service.test && (
              <Text style={styles.testLabel}>This service is in test</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <Image
        source={icon}
        style={styles.bottomImage}
      />
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
