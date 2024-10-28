import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

const OrderCard = ({ item, openGoogleMaps, openWaze, handleCardPress }) => {
  return (
    <TouchableOpacity onPress={() => handleCardPress(item)}>
      <View style={styles.card}>
        <Image
          source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/order-history.png' }}
          style={styles.orderIcon}
        />
        <View style={styles.cardContent}>
          <Text style={styles.orderNumber}>Commande #{item.order_number || 'N/A'}</Text>
          <Text style={styles.addressLine}>{item.address_line || 'Aucune adresse fournie'}</Text>
          <View style={styles.fieldRow}>
            <TouchableOpacity style={styles.navigateButtonGoogle} onPress={() => openGoogleMaps(item.location)}>
              <Ionicons name="navigate-outline" size={24} color="white" />
              <Text style={styles.navigateText}>Google Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navigateButtonWaze} onPress={() => openWaze(item.location)}>
              <Ionicons name="navigate-outline" size={24} color="white" />
              <Text style={styles.navigateText}>Waze</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rightContainer}>
            <Text style={styles.date}>
              {moment(item.delivery_time).format('YYYY-MM-DD HH:mm') || 'Aucune heure de livraison'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32', // Vert sombre pour une bonne lisibilité
    marginBottom: 5,
  },
  addressLine: {
    fontSize: 16,
    color: '#4b4b4b', // Gris foncé
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    flexWrap: 'wrap',
  },
  navigateButtonGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#388e3c', // Vert foncé harmonieux
    padding: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  navigateButtonWaze: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32', // Vert légèrement plus sombre pour contraste
    padding: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  navigateText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 14,
    color: '#6d6d6d', // Gris modéré
  },
});

export default OrderCard;
