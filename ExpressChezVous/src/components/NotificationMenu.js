import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

const { width } = Dimensions.get('window');

const NotificationMenu = ({ slideAnim, toggleNotificationMenu }) => {
  return (
    <TouchableOpacity style={styles.overlay} onPress={toggleNotificationMenu} activeOpacity={1}>
      <TouchableWithoutFeedback>
        <Animated.View style={[styles.notificationMenu, { transform: [{ translateX: slideAnim }] }]}>
          <Text style={styles.notificationTitle}>Notifications</Text>
          {/* Affichez ici vos notifications */}
          <Text style={styles.notificationItem}>Vous avez aucune notification!</Text>
          {/* Ajoutez plus d'éléments de notification ici */}
        </Animated.View>
      </TouchableWithoutFeedback>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  notificationMenu: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
    zIndex: 2,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  notificationItem: {
    fontSize: 16,
    marginVertical: 10,
  },
});

export default NotificationMenu;
