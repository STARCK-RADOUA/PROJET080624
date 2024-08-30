import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const DriverCard = ({ driver, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(driver)}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{driver.firstName} {driver.lastName}</Text>
          <Text style={styles.cardSubtitle}>{driver.phone}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, driver.isLogin ? styles.loggedIn : styles.loggedOut]}>
            {driver.isLogin ? 'Logged In' : 'Logged Out'}
          </Text>
          <Text style={[styles.statusText, driver.activated ? styles.activated : styles.deactivated]}>
            {driver.activated ? 'Activated' : 'Deactivated'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  card: {
    width: screenWidth - 40,
    backgroundColor: '#FFF6EA',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 3, // Adjusts the width of the text container to take more space
  },
  statusContainer: {
    flex: 2, // Adjusts the width of the status container to take less space
    alignItems: 'flex-end', // Align status texts to the right
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  loggedIn: {
    color: 'green',
  },
  loggedOut: {
    color: 'red',
  },
  activated: {
    color: '#34C759',
  },
  deactivated: {
    color: '#FF3B30',
  },
});

export default DriverCard;
