import { BASE_URL, BASE_URLIO } from '@env';

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions, Switch } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AddUserModal from './../components/AddDriverModal'; // Import the AddUserModal component for adding drivers

export default function DriverScreen() {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false); // Modal for adding new driver
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      console.log('Attempting to fetch clients...');
      const response = await axios.get(`${BASE_URL}/api/users/drivers`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setDrivers(response.data);
      setFilteredDrivers(response.data);  // Initialize filteredDrivers with all drivers
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchText(query);
    const filtered = drivers.filter(driver =>
      driver.firstName.toLowerCase().includes(query.toLowerCase()) ||
      driver.lastName.toLowerCase().includes(query.toLowerCase()) ||
      driver.phone.toString().includes(query)
    );
    setFilteredDrivers(filtered);
  };

  const handleActivateDeactivate = async (driverId, isActive) => {
    try {
      await axios.post(`${BASE_URL}/api/users/driver/${driverId}/activate`, { isActive });
      fetchDrivers();
    } catch (error) {
      console.error('Error activating/deactivating driver:', error);
    }
  };

  const handleToggleLoginStatus = async (driverId) => {
    try {
      await axios.post(`${BASE_URL}/api/users/driver/${driverId}/toggle-login`);
      fetchDrivers(); // Refresh driver list after toggling login status
    } catch (error) {
      console.error('Error toggling login status:', error);
    }
  };

  const handleCardPress = (driver) => {
    setSelectedDriver(driver);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedDriver(null);
  };

  const renderDriverModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedDriver && (
            <ScrollView>
              <Text style={styles.modalTitle}>Driver Information</Text>
              <Text style={styles.modalText}>First Name: {selectedDriver.firstName}</Text>
              <Text style={styles.modalText}>Last Name: {selectedDriver.lastName}</Text>
              <Text style={styles.modalText}>Points Earned: {selectedDriver.points_earned}</Text>
              <Text style={styles.modalText}>Phone: {selectedDriver.phone}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver List</Text>

      {/* Search Input and Add Button */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or service type..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={(text) => handleSearch(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.cardContainer}>
        {filteredDrivers.length > 0 ? (
          filteredDrivers.map(driver => (
            <TouchableOpacity key={driver._id} style={styles.card} onPress={() => handleCardPress(driver)}>
              <View style={styles.cardContent}>
                <View>
                  <Text style={styles.cardTitle}>{driver.firstName} {driver.lastName}</Text>
                  <Text style={styles.cardSubtitle}>{driver.phone}</Text>
                </View>
                <View style={styles.iconContainer}>
                  {/* Switch for Activation */}
                  <Switch
                    value={driver.activated}
                    onValueChange={() => handleActivateDeactivate(driver._id, !driver.activated)}
                    thumbColor={driver.activated ? '#f3b13e' : '#d1d5db'}
                    trackColor={{ false: '#d1d5db', true: '#f3b13e' }}
                  />
                  {/* Power Icon */}
                  <TouchableOpacity onPress={() => handleToggleLoginStatus(driver._id)}>
                    <MaterialCommunityIcons
                      name="power" // Modern rounded icon for login status
                      size={30}
                      color={driver.isLogin ? 'green' : 'red'}  // Green if logged in, red if logged out
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No drivers available</Text>
        )}
      </ScrollView>

      {renderDriverModal()}

      {/* AddUserModal to add new drivers */}
      <AddUserModal modalVisible={addModalVisible} setModalVisible={setAddModalVisible} />
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Changed to white background
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'left', // Align title to the left
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingLeft: 40,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    color: '#111827',
    marginRight: 10,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f3b13e',
    borderColor: '#f3b13e',
    borderWidth: 1,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '500',
  },
  cardContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: screenWidth - 40, // Make card width match the search form width
    backgroundColor: '#FFF6EA', // Updated background color for the card
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: screenWidth * 0.85,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
