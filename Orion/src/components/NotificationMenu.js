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
      {showStartDatePicker && Platform.OS === 'ios' && (
  <Modal transparent={true} animationType="slide" visible={showStartDatePicker}>
    <View style={styles.iosPickerContainer}>
      <View style={styles.pickerWrapper}>
        <DateTimePicker
          value={startDate}
          mode="date"
          display="spinner" // or "inline" for different styles
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || startDate;
            setStartDate(currentDate);
          }}
          style={styles.dateTimePicker} // Apply custom styles
        />
        <TouchableOpacity onPress={() => setShowStartDatePicker(false)} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}

      {/* Date Picker for End Date */}
    
      {showEndDatePicker && Platform.OS === 'ios' && (
  <Modal transparent={true} animationType="slide" visible={showEndDatePicker}>
    <View style={styles.iosPickerContainer}>
      <View style={styles.pickerWrapper}>
        <DateTimePicker
          value={endDate}
          mode="date"
          display="spinner" // or "inline" for different styles
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || endDate;
            setEndDate(currentDate);
          }}
          style={styles.dateTimePicker} // Apply custom styles
        />
        <TouchableOpacity onPress={() => setShowEndDatePicker(false)} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}
      {/* Admin Modal */}
      <Modal
        transparent={true}
        visible={addNotificationVisible}
        onRequestClose={() => setAddNotificationVisible(false)}
        animationType="slide"
      >
        <AdminNotificationScreen
                onRequestClose={() => setAddNotificationVisible(false)}

             />
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
    backgroundColor: '#f5f4f4c3', // Couleur de fond légèrement transparente pour un effet subtil
    paddingTop: 10,
  },
  header: {
    padding: 10,
    backgroundColor: '#ecf5f7fd',
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    shadowColor: '#000',  // Ombre pour donner un effet de profondeur
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,  // Ombre pour Android
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
    shadowColor: '#000',  // Ajout d'une légère ombre pour plus de profondeur
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sortButton: {
    backgroundColor: '#156974',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 10,  // Bordure arrondie pour une finition plus propre
  },
  dateButton: {
    backgroundColor: '#1f695a',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  iosPickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond obscurci pour l'arrière-plan
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  dateTimePicker: {
    width: '100%',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#1f695a',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});


export default NotificationMenu;
