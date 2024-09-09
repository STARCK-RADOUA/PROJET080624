import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, FlatList, Modal, TextInput } from 'react-native';
import io from 'socket.io-client';
import * as Device from 'expo-device';
import { Ionicons } from '@expo/vector-icons';
import AdminNotificationScreen from '../screens/AdminNotificationScreen'; // Importe ton composant
import { BASE_URLIO } from '@env';

let socket;

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addNotificationVisible, setAddNotificationVisible] = useState(false); // Pour le modal d'ajout de notification
  const [deviceId, setDeviceId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isAscending, setIsAscending] = useState(true);

  const slideAnim = useState(new Animated.Value(300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const getDeviceId = async () => {
      const id = Device.osBuildId;
      setDeviceId(id);

      if (!socket) {
        socket = io(`${BASE_URLIO}`);
      }

      socket.emit('requestNotifications', id);

      socket.on('allNotifications', (data) => {
        setNotifications(data);
        setFilteredNotifications(data);
      });

      socket.on('newNotification', (notification) => {
        setNotifications((prevNotifications) => [notification, ...prevNotifications]);
        setFilteredNotifications((prevNotifications) => [notification, ...prevNotifications]);
      });
    };

    getDeviceId();

    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    return () => {
      socket.off('allNotifications');
      socket.off('newNotification');
    };
  }, [deviceId]);

  const openNotification = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    socket.emit('markAsRead', notification._id);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = notifications.filter(notification =>
      notification.title.toLowerCase().includes(text.toLowerCase()) ||
      notification.message.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredNotifications(filtered);
  };

  const handleSortByDate = () => {
    const sorted = [...filteredNotifications].sort((a, b) => {
      if (isAscending) {
        return new Date(a.created_at) - new Date(b.created_at);
      } else {
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });
    setFilteredNotifications(sorted);
    setIsAscending(!isAscending);
  };

  const renderNotificationItem = ({ item }) => (
    <Animated.View style={[styles.notificationItem, { opacity: fadeAnim }]}>
      <TouchableOpacity
        onPress={() => openNotification(item)}
        style={styles.notificationInfo}
      >
        <View style={styles.notificationTextContainer}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
       
      
          <Text style={styles.notificationTimestamp}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Total: {filteredNotifications.length}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or message"
          value={searchText}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={handleSortByDate} style={styles.sortButton}>
          <Ionicons name="time-outline" size={24} color="#fff" />
          <Text style={styles.sortButtonText}>Sort by Date</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={30}
        windowSize={7}
      />

      {/* Add Notification Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddNotificationVisible(true)} // Ouvre le modal pour ajouter une notification
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Notification</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={addNotificationVisible}
        onRequestClose={() => setAddNotificationVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          
            <AdminNotificationScreen />
            <TouchableOpacity 
              onPress={() => setAddNotificationVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
        </View>
      </Modal>

      {selectedNotification && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          animationType="fade"
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f4f4c3',
    paddingTop: 10,
  },
  header: {
    padding: 10,
    backgroundColor: '#6472743e',
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#030e0f',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    height: 40,
    color: '#000',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#156974',
    padding: 10,
    borderRadius: 5,
  },
  sortButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#b4b4b4',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    shadowColor: '#b4b4b4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 3,
  },
  notificationInfo: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f695a',
  },
  notificationMessage: {
    fontSize: 17,
    color: '#272711',
  },
  notificationDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTimestamp: {
    fontSize: 15,
    color: '#5c5b5b',
    marginRight: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#2d2d2d',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00ffcc',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#dddddd',
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
    top: "5%",
    right: "5%",
    padding: 0,
    
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#1f695a',
    padding: 15,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  closeButtonText: {
    fontSize: 39,
    color: '#105245',
  },
});

export default NotificationMenu;
