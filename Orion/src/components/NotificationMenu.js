import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, Platform, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import io from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';
import * as Device from 'expo-device';
import { BASE_URLIO } from '@env';
import NotificationItem from './NotificationItem';
import NotificationModal from './NotificationModal';
import AdminNotificationScreen from '../screens/AdminNotificationScreen'; // Import your admin component

let socket;

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addNotificationVisible, setAddNotificationVisible] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isAscending, setIsAscending] = useState(true);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [menuVisible, setMenuVisible] = useState(false);

  const menuHeight = useRef(new Animated.Value(0)).current;

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
    
    return () => {
      socket.off('allNotifications');
      socket.off('newNotification');
    };
  }, [deviceId]);

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

  const filterByDateRange = () => {
    const endDateInclusive = new Date(endDate);
    endDateInclusive.setDate(endDateInclusive.getDate() + 1); // Inclure le dernier jour
  
    const filtered = notifications.filter(notification => {
      const notificationDate = new Date(notification.created_at);
      return notificationDate >= startDate && notificationDate < endDateInclusive;
    });
    setFilteredNotifications(filtered);
  };

  const toggleFilterMenu = () => {
    if (menuVisible) {
      Animated.timing(menuHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(menuHeight, {
        toValue: 200, // Adjust height as needed
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
      <Text style={styles.headerText}>{filteredNotifications.length}</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or message"
          value={searchText}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={handleSortByDate} style={styles.sortButton}>
          <Ionicons name="time-outline" size={24} color="#fff" />
          <Text style={styles.sortButtonText}>Trier</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFilterMenu} style={styles.filterToggleButton}>
          <Ionicons name={menuVisible ? "chevron-up" : "chevron-down"} size={24} color="#fff" />
          <Text style={styles.filterToggleText}>{menuVisible ? "Hide" : "Filters"}</Text>
        </TouchableOpacity>
      </View>

      {/* Animated Filter Menu */}
      {menuVisible && (
        <Animated.View style={[styles.filterMenu, { height: menuHeight }]}>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Start Date</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>End Date</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={filterByDateRange} style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Appliquer</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <FlatList
        data={filteredNotifications}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            openNotification={(notification) => {
              setSelectedNotification(notification);
              setModalVisible(true);
            }}
          />
        )}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Notification Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddNotificationVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Notification</Text>
      </TouchableOpacity>

      {/* Date Picker for Start Date */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || startDate;
            setShowStartDatePicker(Platform.OS === 'ios');
            setStartDate(currentDate);
          }}
        />
      )}

      {/* Date Picker for End Date */}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || endDate;
            setShowEndDatePicker(Platform.OS === 'ios');
            setEndDate(currentDate);
          }}
        />
      )}

      {/* Admin Modal */}
      <Modal
        transparent={true}
        visible={addNotificationVisible}
        onRequestClose={() => setAddNotificationVisible(false)}
        animationType="slide"
      >
        <AdminNotificationScreen />
      </Modal>

      {/* Notification Modal */}
      <NotificationModal
        visible={modalVisible}
        notification={selectedNotification}
        onClose={() => setModalVisible(false)}
      />
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
    flexWrap: 'wrap',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#030e0f',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    height: 40,
  },
  sortButton: {
    backgroundColor: '#156974',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  sortButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  filterToggleButton: {
    backgroundColor: '#e27a3f',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  filterToggleText: {
    color: '#fff',
    marginLeft: 5,
  },
  filterMenu: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dateButton: {
    backgroundColor: '#1f695a',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  dateButtonText: {
    color: '#fff',
  },
  filterButton: {
    backgroundColor: '#e27a3f',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
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
});

export default NotificationMenu;
