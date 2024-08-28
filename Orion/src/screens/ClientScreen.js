import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions, Animated, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Modern icons from expo
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
      const response = await axios.get('http://192.168.1.11:4000/api/users/clients', {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setClients(response.data);
      setFilteredClients(response.data);  // Initialize filteredClients with all clients
    } catch (error) {
      console.error('Error fetching clients:', error);
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
        placeholderTextColor="#9ca3af"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <ScrollView contentContainerStyle={styles.cardContainer}>
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
                  <View>
                    <Text style={styles.cardTitle}>{client.firstName} {client.lastName}</Text>
                    <Text style={styles.cardSubtitle}>{client.phone}</Text>
                  </View>
                  <View style={styles.iconContainer}>
                    {/* Switch for Activation */}
                    <Switch
                      value={client.activated}
                      onValueChange={() => handleActivateDeactivate(client._id, !client.activated)}
                      thumbColor={client.activated ? '#f3b13e' : '#d1d5db'}
                      trackColor={{ false: '#d1d5db', true: '#f3b13e' }}
                    />
                    {/* Power Icon */}
                    <TouchableOpacity onPress={() => handleToggleLoginStatus(client._id)}>
                      <MaterialCommunityIcons
                        name="power"
                        size={30}
                        color={client.isLogin ? 'green' : 'red'}  // Green if logged in, red if logged out
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
      </ScrollView>
      {renderClientModal()}
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
  searchInput: {
    height: 50,
    paddingLeft: 40,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    color: '#111827',
    marginBottom: 20,
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
