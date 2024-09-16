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
          <Text style={styles.orderNumber}>Order #{item.order_number || 'N/A'}</Text>
          <Text style={styles.address_line}>{item.address_line || 'No Address Provided'}</Text>
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
              {moment(item.delivery_time).format('YYYY-MM-DD HH:mm') || 'No Delivery Time'}
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
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  orderIcon: {
    width: '15%',
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
    color: '#333',
    marginBottom: 5,
  },
  address_line: {
    fontSize: 16,
    color: '#666',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    flexWrap: 'wrap',
  },
  navigateButtonGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeb90b',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  navigateButtonWaze: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1ca5a5',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  navigateText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
});

export default OrderCard;
