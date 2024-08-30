import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ServiceCard = ({ service, onReadMore }) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onReadMore}>
      <Image source={{ uri: service.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{service.name}</Text>
        <Text style={styles.cardSubtitle}>{service.isSystemPoint ? 'System Service' : 'Regular Service'}</Text>
        <Text style={styles.cardTest}>{service.test ? 'Test Service' : 'Production Service'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardTest: {
    fontSize: 12,
    color: '#999',
  },
});

export default ServiceCard;
