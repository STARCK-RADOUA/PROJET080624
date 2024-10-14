import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ServiceCard = ({ service, onReadMore }) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onReadMore}>
      <View style={styles.cardContent}>
        <Image source={{ uri: service.image }} style={styles.cardImage} />
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{service.name}</Text>
          <Text style={styles.cardSubtitle}>{service.isSystemPoint ? 'Système du points activé' : 'Système du points désactivé'}</Text>
          <Text style={styles.cardTest}>{service.test ? 'Système de Test est activé' : 'Système de Test est désactivé'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFF', // White background for the card
    borderRadius: 12, // Rounded corners for a modern feel
    overflow: 'hidden',
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center', // Ensure content aligns centrally
  },
  cardImage: {
    width: 60, // Slightly larger image for better visual impact
    height: 60,
    borderRadius: 30, // Rounded image for a modern profile picture look
    marginRight: 15,
    backgroundColor: '#E5E7EB', // Subtle grey background for image placeholder
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748', // Dark grey for the title
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#718096', // Light grey for subtitle (inactive points system)
    marginBottom: 4,
  },
  cardTest: {
    fontSize: 12,
    color: '#4A5568', // Mid-grey for test system status
  },
});

export default ServiceCard;
