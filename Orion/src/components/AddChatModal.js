import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '@env';

const UserSearchModal = ({ visible, onClose, onUserSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [searchedUsers, setSearchedUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/all`);
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      setSearchedUsers(users.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(query.toLowerCase())
      ));
    } else {
      setSearchedUsers([]);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onShow={fetchUsers} // Fetch users when modal is shown
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add New Chat</Text>
          <TextInput
            style={styles.modalSearchInput}
            placeholder="Search users..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <ScrollView contentContainerStyle={styles.modalUserList}>
            {searchedUsers.length > 0 ? (
              searchedUsers.map((user, index) => (
                <TouchableOpacity key={index} style={styles.modalUserItem} onPress={() => onUserSelect(user)}>
                  <View style={[styles.avatar, { backgroundColor: user.avatarColor || '#4682B4' }]}>
                    <Text style={styles.avatarText}>{user.firstName.charAt(0)}</Text>
                  </View>
                  <Text style={styles.modalUserName}>
                    {user.firstName} {user.lastName}/{user.userType === 'Driver' ? 'D' : 'C'}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noUsersText}>No users found</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const screenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Dark background with higher opacity
  },
  modalView: {
    width: screenWidth - 40,
    backgroundColor: '#2c2c2c', // Dark background for the modal
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
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
    color: '#1f695a', // White text for better contrast
  },
  modalSearchInput: {
    width: '100%',
    height: 40,
    backgroundColor: '#4c4c4c', // Darker input background
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#fff', // White text inside the input
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
    color: '#aaa', // Lighter gray for "no users" text
    textAlign: 'center',
    paddingTop: 20,
  },
});

export default UserSearchModal;
