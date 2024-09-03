import { BASE_URLIO } from '@env';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import io from 'socket.io-client';
import AddUserModal from './../components/AddDriverModal';
import DriverCard from './../components/DriverCard';
import DriverModal from './../components/DriverModal';

export default function DriverScreen() {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterActivated, setFilterActivated] = useState('all'); 
  const [filterIsLogin, setFilterIsLogin] = useState('all');    

  useEffect(() => {
    const socket = io(BASE_URLIO);

    socket.emit('watchDrivers');
    socket.on('driversUpdated', ({ drivers }) => {
      console.log('driversUpdated event received:', drivers);
      setDrivers(drivers);
      applyFilters(drivers); 
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from the socket server');
    });

    return () => {
      console.log('Disconnecting from socket server...');
      socket.disconnect();
    };
  }, []);

  const handleSearch = (query) => {
    setSearchText(query);
    applyFilters(drivers, query, filterActivated, filterIsLogin);
  };

  const handleFilterActivated = (value) => {
    setFilterActivated(value);
    applyFilters(drivers, searchText, value, filterIsLogin);
  };

  const handleFilterIsLogin = (value) => {
    setFilterIsLogin(value);
    applyFilters(drivers, searchText, filterActivated, value);
  };

  const applyFilters = (drivers, searchQuery = searchText, activatedFilter = filterActivated, isLoginFilter = filterIsLogin) => {
    let filtered = drivers;

    if (searchQuery) {
      filtered = filtered.filter(driver =>
        driver.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.phone.toString().includes(searchQuery)
      );
    }

    if (activatedFilter !== 'all') {
      filtered = filtered.filter(driver =>
        activatedFilter === 'activated' ? driver.activated : !driver.activated
      );
    }

    if (isLoginFilter !== 'all') {
      filtered = filtered.filter(driver =>
        isLoginFilter === 'loggedIn' ? driver.isLogin : !driver.isLogin
      );
    }

    setFilteredDrivers(filtered);
  };

  const handleCardPress = (driver) => {
    setSelectedDriver(driver);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedDriver(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver List</Text>

      {/* Search Input and Filter Dropdowns */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={(text) => handleSearch(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={filterActivated}
            style={styles.filterPicker}
            onValueChange={(itemValue) => handleFilterActivated(itemValue)}
          >
            <Picker.Item label="All" value="all" />
            <Picker.Item label="Activated" value="activated" />
            <Picker.Item label="Deactivated" value="deactivated" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={filterIsLogin}
            style={styles.filterPicker}
            onValueChange={(itemValue) => handleFilterIsLogin(itemValue)}
          >
            <Picker.Item label="All" value="all" />
            <Picker.Item label="Logged In" value="loggedIn" />
            <Picker.Item label="Logged Out" value="loggedOut" />
          </Picker>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.cardContainer}>
        {filteredDrivers.length > 0 ? (
          filteredDrivers.map(driver => (
            <DriverCard key={driver._id} driver={driver} onPress={handleCardPress} />

            
          ))
        ) : (
          <Text style={styles.noDriversText}>No drivers available</Text>
        )}
      </ScrollView>

      <DriverModal
        visible={isModalVisible}
        onClose={closeModal}
        driver={selectedDriver}
      />

      <AddUserModal modalVisible={addModalVisible} setModalVisible={setAddModalVisible} />
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f4f4c3',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#030e0f',
    marginBottom: 20,
    textAlign: 'left',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterPicker: {
    height: 50,
    width: '100%',
  },
  cardContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverItem: {
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
  driverInfo: {
    width: '100%',
    flexDirection: 'column',
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
  driverStatus: {
    fontSize: 15,
    color: '#5c5b5b',
  },
  noDriversText: {
    fontSize: 16,
    color: '#5c5b5b',
  },
});


