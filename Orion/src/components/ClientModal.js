import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL,BASE_URLIO } from '@env';
import io from 'socket.io-client';
const ClientModal = ({ visible, onClose, client }) => {
  if (!client) return null;

  const [editableClient, setEditableClient] = useState({ ...client });

  useEffect(() => {
    setEditableClient({ ...client });
  }, [client]);

 // Assuming you have already connected the admin to Socket.IO
const socket = io(BASE_URLIO);

// Function to activate or deactivate a client via Socket.IO
const handleActivateDeactivate = (isActive) => {
  try {
    setEditableClient((prevClient) => ({
      ...prevClient,
      activated: isActive,
    }));

    // Send activation/deactivation event to server
    socket.emit('adminActivateDeactivateClient', { clientId: editableClient._id, isActive,deviceId:editableClient.deviceId });

    Alert.alert('Success', `Client ${isActive ? 'activated' : 'deactivated'} successfully.`);
  } catch (error) {
    console.error('Error activating/deactivating client:', error);
    Alert.alert('Error', 'Failed to update activation status. Please try again.');
    setEditableClient((prevClient) => ({
      ...prevClient,
      activated: !isActive,
    }));
  }
};

// Function to toggle the login status of a client via Socket.IO
const handleToggleLoginStatus = () => {
  try {
    const newLoginStatus = !editableClient.isLogin;
    setEditableClient((prevClient) => ({
      ...prevClient,
      isLogin: newLoginStatus,
    }));

    // Send toggle login status event to server
    socket.emit('adminToggleLoginStatus', { clientId: editableClient._id,deviceId:editableClient.deviceId });

    Alert.alert('Success', `Login status ${newLoginStatus ? 'enabled' : 'disabled'} successfully.`);
  } catch (error) {
    console.error('Error toggling login status:', error);
    Alert.alert('Error', 'Failed to update login status. Please try again.');
    setEditableClient((prevClient) => ({
      ...prevClient,
      isLogin: !prevClient.isLogin,
    }));
  }
};

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
            <Ionicons name="close-circle" size={30} color="black" />
          </TouchableOpacity>

          <Text style={styles.name}>{editableClient.firstName} {editableClient.lastName}</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Téléphone:</Text>
            <Text style={styles.textValue}>{editableClient.phone}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>ID de l'appareil:</Text>
            <Text style={styles.textValue} numberOfLines={1} ellipsizeMode="tail">
              {editableClient.deviceId}
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Points accumulés:</Text>
            <Text style={styles.textValue}>{editableClient.points_earned}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Type d'utilisateur:</Text>
            <Text style={styles.textValue}>{editableClient.userType}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Activé:</Text>
            <Switch
              value={editableClient.activated}
              onValueChange={handleActivateDeactivate}
              thumbColor={editableClient.activated ? "#34C759" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Statut de connexion:</Text>
            <Switch
              value={editableClient.isLogin}
              onValueChange={handleToggleLoginStatus}
              thumbColor={editableClient.isLogin ? "#34C759" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalView: {
    width: '85%',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1f695a',
    textAlign: 'center',
    marginVertical: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 16,
    color: '#ddd',
    flex: 1,
    flexWrap: 'wrap',
  },
  textValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: '#555',
    marginVertical: 15,
  },
});

export default ClientModal;
