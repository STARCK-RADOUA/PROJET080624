import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const DriverCard = ({ driver, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(driver)}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>🚚    {driver.firstName} {driver.lastName}</Text>
          <Text style={styles.cardSubtitle}> 📞     +33 {driver.phone}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, driver.isLogin ? styles.loggedIn : styles.loggedOut]}>
            {driver.isLogin ? '🔒  Logged In' : '🚫   Logged Out'}
          </Text>
          <Text style={[styles.statusText, driver.activated ? styles.activated : styles.deactivated]}>
            {driver.activated ? '✅   Activated' : '❌   Deactivated'}
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
    backgroundColor: '#b4b4b4',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#b4b4b4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 3,
  },
  statusContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f695a',
  },
  cardSubtitle: {
    fontSize: 17,
    color: '#272711',
    marginTop: 4,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  loggedIn: {
    color: '#199638',
  },
  loggedOut: {
    color: '#FF3B30',
  },
  activated: {
    color: '#199638',
  },
  deactivated: {
    color: '#FF3B30',
  },
});

export default DriverCard;
