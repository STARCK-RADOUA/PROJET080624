import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

const DriverItem = ({ item, scaleAnim, fadeAnim, handlePressIn, handlePressOut, onPress }) => (
  <Animated.View style={[styles.driverItem, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
    <TouchableOpacity
      style={styles.driverInfo}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <View style={styles.driverTextContainer}>
        <Text style={styles.driverName}>👤 {item.firstName} {item.lastName}</Text>
        <Text style={styles.driverPhone}>📞 +33 {item.phone}</Text>
      </View>
      <View style={styles.driverRevenueContainer}>
        <Text style={styles.driverRevenue}>💵 Revenue: €{item.revenue.toFixed(2)}</Text>
        <Ionicons name="chevron-forward-outline" size={25} color="#156974" />
      </View>
      <View style={styles.driverDateContainer}>
        <Text style={styles.driverTimestamp}>⏰ {moment(item.created_at).format('DD MMM YYYY, h:mm a')}</Text>
      </View>
    </TouchableOpacity>
  </Animated.View>
);

const styles = StyleSheet.create({
  driverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#6472743e',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    shadowColor: '#6472743e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 3,
  },
  driverInfo: {
    width: '100%',
  },
  driverTextContainer: {
    flex: 1,
  },
  driverDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverRevenueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f695a',
  },
  driverPhone: {
    fontSize: 17,
    color: '#272711',
  },
  driverRevenue: {
    fontSize: 15,
    color: '#e27a3f',
  },
  driverTimestamp: {
    fontSize: 15,
    color: '#5c5b5b',
    marginRight: 10,
  },
});

export default DriverItem;
