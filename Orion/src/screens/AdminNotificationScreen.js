import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import io from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons'; // Icon library
import { BASE_URLIO } from '@env';

// Connexion au serveur via Socket.IO
const socket = io(BASE_URLIO);

export default function AdminNotificationScreen({ navigation,onRequestClose}) { // Accepting navigation as prop
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.emit('requestUsersAndDrivers');
    socket.on('responseUsersAndDrivers', (data) => {
      setClients(data.clients || []);
      setDrivers(data.drivers || []);
      setFilteredUsers([...data.clients, ...data.drivers]);
    });

    socket.on('error', (error) => {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    });

    return () => {
      socket.off('responseUsersAndDrivers');
      socket.off('error');
    };
  }, []);

  useEffect(() => {
    filterUsers();
  }, [userTypeFilter, clients, drivers]);

  const filterUsers = () => {
    if (userTypeFilter === 'all') {
      setFilteredUsers([...clients, ...drivers]);
    } else if (userTypeFilter === 'client') {
      setFilteredUsers(clients);
    } else if (userTypeFilter === 'driver') {
      setFilteredUsers(drivers);
    }
  };

  const toggleUserSelection = (user) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter(item => item !== user));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const sendNotification = () => {
    if (!selectedUsers.length || !title || !message) {
      alert('Veuillez remplir tous les champs et sélectionner au moins un utilisateur');
      return;
    }

    const data = {
      users: selectedUsers,
      title,
      message,
    };

    socket.emit('sendNotification', data);
    setSelectedUsers([]);
    setTitle('');
    setMessage('');
  };

  const handleClose = () => {
    navigation.goBack(); // Go back to the previous screen
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onRequestClose}>
            <Ionicons name="close-circle" size={35} color="#e21818" />
          </TouchableOpacity>

          <Text style={styles.title}>Envoyer une Notification</Text>

          <TextInput
            style={styles.input}
            placeholder="Titre"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Message"
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#999"
            multiline
          />

          {/* Filtre pour sélectionner le type d'utilisateur */}
          <View style={styles.filterContainer}>
            <Text style={styles.subLabel}>Filtrer par type d'utilisateur :</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, userTypeFilter === 'all' && styles.filterButtonSelected]}
                onPress={() => setUserTypeFilter('all')}
              >
                <Text style={styles.filterButtonText}>Tous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, userTypeFilter === 'client' && styles.filterButtonSelected]}
                onPress={() => setUserTypeFilter('client')}
              >
                <Text style={styles.filterButtonText}>Clients</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, userTypeFilter === 'driver' && styles.filterButtonSelected]}
                onPress={() => setUserTypeFilter('driver')}
              >
                <Text style={styles.filterButtonText}>Livreurs</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Liste des utilisateurs filtrés */}
          <ScrollView style={styles.userList}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.userItem,
                    selectedUsers.includes(user) && styles.selectedUserItem,
                  ]}
                  onPress={() => toggleUserSelection(user)}
                >
                  <Text style={styles.userText}>{user.name}</Text>
                  <Ionicons
                    name={selectedUsers.includes(user) ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={selectedUsers.includes(user) ? '#1f695a' : '#ddd'}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noUserText}>Aucun utilisateur disponible</Text>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={sendNotification}>
            <Text style={styles.buttonText}>Envoyer Notification</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  inner: {
    flex: 1,
    justifyContent: 'space-between',
    padding: '10%',
  },
  title: {
    fontSize: 26,
    paddingTop: 20,
    fontWeight: 'bold',
    color: '#f5f5f5',
    marginBottom: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  input: {
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#1f1f1f',
    fontSize: 16,
    color: '#fff',
  },
  filterContainer: {
    marginBottom: 20,
  },
  subLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f5f5f5',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    borderRadius: 5,
  },
  filterButtonSelected: {
    backgroundColor: '#1f695a',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  userList: {
    marginBottom: 20,
    height: '70%',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#1f1f1f',
  },
  selectedUserItem: {
    borderColor: '#1f695a',
    backgroundColor: '#2e7d6b',
  },
  userText: {
    fontSize: 18,
    color: '#fff',
  },
  noUserText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  button: {
    backgroundColor: '#1f695a',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
