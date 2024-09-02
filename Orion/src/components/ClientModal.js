import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '@env';

const ClientModal = ({ visible, onClose, client }) => {
  if (!client) return null;

  const [editableClient, setEditableClient] = useState({ ...client });

  useEffect(() => {
    setEditableClient({ ...client });
  }, [client]);

  const handleActivateDeactivate = async (isActive) => {
    try {
      setEditableClient((prevClient) => ({
        ...prevClient,
        activated: isActive,
      }));
      await axios.post(`${BASE_URL}/api/users/clients/${editableClient._id}/activate`, { isActive });
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

  const handleToggleLoginStatus = async () => {
    try {
      const newLoginStatus = !editableClient.isLogin;
      setEditableClient((prevClient) => ({
        ...prevClient,
        isLogin: newLoginStatus,
      }));
      await axios.post(`${BASE_URL}/api/users/clients/${editableClient._id}/toggle-login`);
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
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.textValue}>{editableClient.phone}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Device ID:</Text>
            <Text style={styles.textValue} numberOfLines={1} ellipsizeMode="tail">
              {editableClient.deviceId}
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Points Earned:</Text>
            <Text style={styles.textValue}>{editableClient.points_earned}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>User Type:</Text>
            <Text style={styles.textValue}>{editableClient.userType}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Activated:</Text>
            <Switch
              value={editableClient.activated}
              onValueChange={handleActivateDeactivate}
              thumbColor={editableClient.activated ? "#34C759" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Login Status:</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
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
    color: '#555',
    flex: 1,
    flexWrap: 'wrap',
  },
  textValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
});

export default ClientModal;
