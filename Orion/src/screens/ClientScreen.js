import { BASE_URLIO } from '@env';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import io from 'socket.io-client';
import AddUserModal from './../components/AddDriverModal';  // If you have a specific component for adding clients, replace this import.
import ClientCard from './../components/ClientCard';  // Create a separate ClientCard component similar to DriverCard.
import ClientModal from './../components/ClientModal';  // Create a separate ClientModal component similar to DriverModal.

export default function ClientScreen() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterActivated, setFilterActivated] = useState('all'); // New state for activated filter
  const [filterIsLogin, setFilterIsLogin] = useState('all');     // New state for isLogin filter

  useEffect(() => {
    const socket = io(BASE_URLIO);

    socket.emit('watchClients');
    socket.on('clientsUpdated', ({ clients }) => {
      console.log('clientsUpdated event received:', clients);
      setClients(clients);
      applyFilters(clients); // Apply filters to the initial data
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
    applyFilters(clients, query, filterActivated, filterIsLogin);
  };

  const handleFilterActivated = (value) => {
    setFilterActivated(value);
    applyFilters(clients, searchText, value, filterIsLogin);
  };

  const handleFilterIsLogin = (value) => {
    setFilterIsLogin(value);
    applyFilters(clients, searchText, filterActivated, value);
  };

  const applyFilters = (clients, searchQuery = searchText, activatedFilter = filterActivated, isLoginFilter = filterIsLogin) => {
    let filtered = clients;

    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.toString().includes(searchQuery)
      );
    }

    if (activatedFilter !== 'all') {
      filtered = filtered.filter(client =>
        activatedFilter === 'activated' ? client.activated : !client.activated
      );
    }

    if (isLoginFilter !== 'all') {
      filtered = filtered.filter(client =>
        isLoginFilter === 'loggedIn' ? client.isLogin : !client.isLogin
      );
    }

    setFilteredClients(filtered);
  };

  const handleCardPress = (client) => {
    setSelectedClient(client);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedClient(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Client List</Text>

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
        {filteredClients.length > 0 ? (
          filteredClients.map(client => (
            <ClientCard key={client._id} client={client} onPress={handleCardPress} />
          ))
        ) : (
          <Text>No clients available</Text>
        )}
      </ScrollView>

      <ClientModal
        visible={isModalVisible}
        onClose={closeModal}
        client={selectedClient}
      />

      <AddUserModal modalVisible={addModalVisible} setModalVisible={setAddModalVisible} />
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#1f2937',
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
});

