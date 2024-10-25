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
            <Text style={styles.textValue}>+33 {editableClient.phone}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>ID de l'appareil:</Text>
         
          </View>
   <Text style={styles.textValue} numberOfLines={1} ellipsizeMode="tail">
              {editableClient.deviceId}
            </Text>
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
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontWeight: 'bold',
  },
  textValue: {
    fontSize: 16,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A67D8',
    borderRadius: 10,
    padding: 10,
    margin: 5,
  },
  navigateText: {
    color: 'white',
    marginLeft: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#CED4DA',
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: '#5A67D8',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#5A67D8',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  editText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 5,
    padding: 5,
    flex: 1,
  },
});

export default ClientModal;
