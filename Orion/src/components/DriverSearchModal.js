import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '@env';

const DriverSearchModal = ({ visible, onClose, onUserSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [searchedUsers, setSearchedUsers] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchUsers();
    }
  }, [visible]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/all`);
      if (response.data && Array.isArray(response.data)) {
        const drivers = response.data.filter(user => user.userType === 'Driver'); // Only include drivers
        setUsers(drivers);
        setSearchedUsers(drivers); // Initially show all drivers
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      setSearchedUsers(
        users.filter(user =>
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      setSearchedUsers(users); // Show all drivers if no search query
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity style={styles.modalUserItem} onPress={() => onUserSelect(item)}>
      <View style={[styles.avatar, { backgroundColor: item.avatarColor || '#4682B4' }]}>
        <Text style={styles.avatarText}>{item.firstName.charAt(0)}</Text>
      </View>
      <Text style={styles.modalUserName}>
        {item.firstName} {item.lastName}/L
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Ajouter un nouveau chauffeur</Text>
          <TextInput
            style={styles.modalSearchInput}
            placeholder="Rechercher des chauffeurs..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <FlatList
            data={searchedUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item._id.toString()}
            ListEmptyComponent={<Text style={styles.noUsersText}>Aucun chauffeur trouvé</Text>}
            contentContainerStyle={styles.modalUserList}
          />
        </View>
      </View>
    </Modal>
  );
};

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Dark background with higher opacity
  },
  modalView: {
    width: screenWidth - 40,
    maxHeight: screenHeight * 0.8, // Restrict modal height to 80% of screen
    backgroundColor: '#2c2c2c', // Dark background for the modal
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginVertical: 20, // Top and bottom margins
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f695a', // Greenish title color for contrast
  },
  modalSearchInput: {
    width: '100%',
    height: 40,
    backgroundColor: '#4c4c4c', // Darker input background
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#fff', // White text for the input
  },
  modalUserList: {
    width: '100%',
  },
  modalUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#555', // Darker border color
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#3b3b3b', // Dark background for the avatar
  },
  avatarText: {
    color: '#fff', // White text for avatar initials
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalUserName: {
    fontSize: 16,
    color: '#fff', // White text for the username
  },
  noUsersText: {
    color: '#aaa', // Light gray text for "no users"
    textAlign: 'center',
    paddingTop: 20,
  },
});

export default DriverSearchModal;
