import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions, Animated } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons'; // Modern icons from expo
import axios from 'axios';

export default function ClientScreen() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scaleAnim = useState(new Animated.Value(1))[0];  // For scaling animation on press

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      console.log('Attempting to fetch clients...');
      const response = await axios.get('http://192.168.1.11:4000/api/users/clients', {
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
      await axios.post(`http://192.168.1.11:4000/api/users/clients/${clientId}/activate`, { isActive });
      fetchClients();
    } catch (error) {
      console.error('Error activating/deactivating client:', error);
    }
  };

  const handleToggleLoginStatus = async (clientId) => {
    try {
      await axios.post(`http://192.168.1.11:4000/api/users/clients/${clientId}/toggle-login`);
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
              <Text style={styles.modalText}>Points: {selectedClient.points_earned}</Text>
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

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Client List</Text>

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
              <Animated.View key={client._id} style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                <TouchableOpacity
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  style={styles.cardPressArea}
                  onPress={() => handleCardPress(client)}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>{client.firstName} {client.lastName}</Text>
                      <Text style={styles.cardSubtitle}>{client.phone}</Text>
                    </View>
                    <View style={styles.iconContainer}>
                      {/* Activate/Deactivate Icon */}
                      <TouchableOpacity onPress={() => handleActivateDeactivate(client._id, !client.activated)}>
                        <Feather
                          name={client.activated ? 'toggle-right' : 'toggle-left'}
                          size={40}
                          color={client.activated ? 'green' : 'gray'}
                        />
                      </TouchableOpacity>
                      {/* Login Status Icon */}
                      <TouchableOpacity onPress={() => handleToggleLoginStatus(client._id)}>
                        <Ionicons
                          name={client.isLogin ? 'log-out-outline' : 'log-in-outline'}
                          size={30}
                          color={client.isLogin ? 'green' : 'red'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
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
    borderRadius: 15,
    paddingHorizontal: 15,
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
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  cardPressArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  cardText: {
    flex: 1,
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexShrink: 0,
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
    borderRadius: 20,
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
