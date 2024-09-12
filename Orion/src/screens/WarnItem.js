import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

const WarnItem = ({ item, scaleAnim, fadeAnim, handlePressIn, handlePressOut, onPress }) => (
  <Animated.View style={[styles.warnItem, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
    <TouchableOpacity
      style={styles.warnInfo}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <View style={styles.warnTextContainer}>
        <Text style={styles.warnName}> 👤 {item.firstName} {item.lastName}</Text>
        <Text style={styles.warnPhone}> 📞 +33 {item.phone}</Text>
      </View>
      <View style={styles.warnDateContainer}>
        <Text style={styles.warnTimestamp}> ⏰ {moment(item.created_at).format('DD MMM YYYY, h:mm a')}</Text>
        <Ionicons name="chevron-forward-outline" size={25} color="#156974" />
      </View>
    </TouchableOpacity>
  </Animated.View>
);

const styles = StyleSheet.create({
  warnItem: {
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
  warnInfo: {
    width: '100%',
  },
  warnTextContainer: {
    flex: 1,
  },
  warnDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warnName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f695a',
  },
  warnPhone: {
    fontSize: 17,
    color: '#272711',
  },
  warnTimestamp: {
    fontSize: 15,
    color: '#5c5b5b',
    marginRight: 10,
  },
});

export default WarnItem;
