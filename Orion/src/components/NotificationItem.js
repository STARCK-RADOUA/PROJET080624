import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

const NotificationItem = ({ item, openNotification }) => {
    console.log('------------------------------------');
    console.log(new Date(item.created_at).toLocaleString());
    console.log('------------------------------------');
  return (
    <Animated.View style={styles.notificationItem}>
      <TouchableOpacity onPress={() => openNotification(item)} style={styles.notificationInfo}>
        <View style={styles.notificationTextContainer}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTimestamp}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#b4b4b4',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  notificationInfo: {
    flexDirection: 'row',
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 17,
  },
  notificationTimestamp: {
    fontSize: 15,
    color: '#5c5b5b',
  },
});

export default NotificationItem;
