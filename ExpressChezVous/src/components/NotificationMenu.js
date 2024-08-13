import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, TouchableWithoutFeedback, FlatList, Modal } from 'react-native';
import io from 'socket.io-client';
import * as Device from 'expo-device';

let socket;

const NotificationMenu = ({ slideAnim, toggleNotificationMenu }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    const getDeviceId = async () => {
      const id = Device.osBuildId;
      setDeviceId(id);

      if (!socket) {
        socket = io('http://192.168.8.129:4000'); // Évitez de réinitialiser le socket à chaque fois
      }

      socket.emit('requestNotifications', id);

      socket.on('allNotifications', (data) => {
        console.log('Received notifications:', data); 
        setNotifications(data);
      });

      socket.on('newNotification', (notification) => {
        setNotifications((prevNotifications) => [notification, ...prevNotifications]);
      });
    };

    getDeviceId();

    return () => {
      socket.off('allNotifications');
      socket.off('newNotification');
    };
  }, []);

  const openNotification = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);

    // Marquer la notification comme lue
    socket.emit('markAsRead', notification._id);
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity onPress={() => openNotification(item)} style={styles.notificationItem}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableOpacity style={styles.overlay} onPress={toggleNotificationMenu} activeOpacity={1}>
      <TouchableWithoutFeedback>
        <Animated.View style={[styles.notificationMenu, { transform: [{ translateX: slideAnim }] }]}>
          <Text style={styles.notificationMenuTitle}>Notifications</Text>
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item._id}
            style={styles.notificationList}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      {selectedNotification && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
              <Text style={styles.modalMessage}>{selectedNotification.message}</Text>
              <Text style={styles.modalTime}>{new Date(selectedNotification.created_at).toLocaleString()}</Text>
              {selectedNotification.read_at && (
                <Text style={styles.modalReadTime}>Read at: {new Date(selectedNotification.read_at).toLocaleString()}</Text>
              )}
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
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
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  notificationMenuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  notificationList: {
    marginBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },
  modalReadTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#888',
  },
});

export default NotificationMenu;
