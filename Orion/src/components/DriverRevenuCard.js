import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons

const DriverCard = ({ driver, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(driver)}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>🚚    {driver.firstName} {driver.lastName}</Text>
          
          <View style={styles.infoRow}>
            <FontAwesome5 name="shopping-cart" size={20} color="#1a535c" style={styles.icon} />
            <Text style={styles.cardSubtitle}>Total des commandes : {driver.deliveredOrders}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="attach-money" size={24} color="#1a535c" style={styles.icon} />
            <Text style={styles.cardSubtitle}>Revenu total : {driver.totalRevenue.toFixed(2)} €</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  card: {
    width: screenWidth - 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a535c',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  cardSubtitle: {
    fontSize: 18,
    color: '#333',
    marginLeft: 10,
  },
  icon: {
    marginRight: 5,
  },
});

export default DriverCard;
