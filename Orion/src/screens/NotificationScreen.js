import { BASE_URL, BASE_URLIO } from '@env';

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function ClientScreen() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Static client data
  const clients = [
    {
      _id: '1',
      firstName: 'Mehdi',
      lastName: 'Saadi',
      email: 'mehdi.saadi@example.com',
      phone: '775293222',
      activated: true,
    },
    {
      _id: '2',
      firstName: 'Tariq',
      lastName: 'Radoua',
      email: 'tariq.radoua@example.com',
      phone: '648362079',
      activated: false,
    },
  ];

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
              <Text style={styles.modalText}>Email: {selectedClient.email}</Text>
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
      <Text style={styles.title}>Client List</Text>
      <ScrollView>
        <View style={styles.cardContainer}>
          {clients.map(client => (
            <TouchableOpacity key={client._id} style={styles.card} onPress={() => handleCardPress(client)}>
              <View style={styles.cardContent}>
                <View>
                  <Text style={styles.cardTitle}>{client.firstName} {client.lastName}</Text>
                  <Text style={styles.cardSubtitle}>{client.email}</Text>
                </View>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name={client.activated ? 'toggle-on' : 'toggle-off'}
                    size={40}
                    color={client.activated ? 'green' : 'gray'}
                  />
                  <FontAwesome name="power-off" size={30} color="red" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
