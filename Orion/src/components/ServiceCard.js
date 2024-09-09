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
    backgroundColor: '#b4b4b4',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 5,
    flexDirection: 'row',
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#eeebeb',
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
    color: '#1f695a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#dddddd',
    marginBottom: 4,
  },
  cardTest: {
    fontSize: 12,
    color: '#888888',
  },
});

export default ServiceCard;
