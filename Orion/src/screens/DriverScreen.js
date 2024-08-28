import { BASE_URL, BASE_URLIO } from '@env';

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

export default function DriverScreen() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      console.log('Attempting to fetch clients...');
      const response = await axios.get(`${BASE_URL}/api/users/drivers`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      setClients(response.data);
      setFilteredClients(response.data);  // Initialize filteredClients with all clients
    } catch (error) {
      if (error.response) {
        console.error('Error fetching clients (Server responded with an error):', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error fetching clients (No response received):', error.request);
      } else {
        console.error('Error setting up the request:', error.message);
      }
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    // Filter clients based on the search query (search by name or phone number)
    const filtered = clients.filter(client =>
      client.firstName.toLowerCase().includes(query.toLowerCase()) ||
      client.lastName.toLowerCase().includes(query.toLowerCase()) ||
      client.phone.toString().includes(query)
    );

    setFilteredClients(filtered);
  };

  const handleActivateDeactivate = async (clientId, isActive) => {
    try {
      await axios.post(`http://192.168.1.11:4000/api/users/driver/${clientId}/activate`, { isActive });
      fetchClients();
    } catch (error) {
      console.error('Error activating/deactivating client:', error);
    }
  };

  const handleToggleLoginStatus = async (clientId) => {
    try {
      await axios.post(`http://192.168.1.11:4000/api/users/driver/${clientId}/toggle-login`);
      fetchClients(); // Refresh client list after toggling login status
    } catch (error) {
      console.error('Error toggling login status:', error);
    }
  };


  const handleCardPress = (client) => {
    setSelectedClient(client);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedClient(null);
  };

  const renderClientModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedClient && (
            <ScrollView>
              <Text style={styles.modalTitle}>Client Information</Text>
              <Text style={styles.modalText}>First Name: {selectedClient.firstName}</Text>
              <Text style={styles.modalText}>Last Name: {selectedClient.lastName}</Text>
              <Text style={styles.modalText}>points: {selectedClient.points_earned}</Text>
              <Text style={styles.modalText}>Phone: {selectedClient.phone}</Text>
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
      <Text style={styles.title}>Drivervs List</Text>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or phone"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <ScrollView>
        <View style={styles.cardContainer}>
          {filteredClients.length > 0 ? (
            filteredClients.map(client => (
              <TouchableOpacity key={client._id} style={styles.card} onPress={() => handleCardPress(client)}>
                <View style={styles.cardContent}>
                  <View>
                    <Text style={styles.cardTitle}>{client.firstName} {client.lastName}</Text>
                    <Text style={styles.cardSubtitle}>{client.phone}</Text>
                  </View>
                  <View style={styles.iconContainer}>
                    <TouchableOpacity onPress={() => handleActivateDeactivate(client._id, !client.activated)}>
                      <MaterialIcons
                        name={client.activated ? 'toggle-on' : 'toggle-off'}
                        size={40}
                        color={client.activated ? 'green' : 'gray'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleToggleLoginStatus(client._id)}>
                      <FontAwesome
                        name={client.isLogin ? 'power-off' : 'power-off'}  // Change icon based on login status
                        size={30}
                        color={client.isLogin ? 'green' :'red' }  // Red if logged in, green if logged out
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No clients available</Text>
          )}
        </View>
      </ScrollView>
      {renderClientModal()}
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
    textAlign: 'center',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: screenWidth * 0.9,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
