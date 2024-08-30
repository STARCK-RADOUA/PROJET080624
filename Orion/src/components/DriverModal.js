import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '@env';

const DriverModal = ({ visible, onClose, driver }) => {
  if (!driver) return null;

  const [editableDriver, setEditableDriver] = useState({ ...driver });

  useEffect(() => {
    setEditableDriver({ ...driver });
  }, [driver]);

  const handleActivateDeactivate = async (isActive) => {
    try {
      setEditableDriver((prevDriver) => ({
        ...prevDriver,
        activated: isActive,
      }));
      await axios.post(`${BASE_URL}/api/users/driver/${editableDriver._id}/activate`, { isActive });
    } catch (error) {
      console.error('Error activating/deactivating driver:', error);
      Alert.alert('Error', 'Failed to update activation status. Please try again.');
      setEditableDriver((prevDriver) => ({
        ...prevDriver,
        activated: !isActive,
      }));
    }
  };

  const handleToggleLoginStatus = async () => {
    try {
      const newLoginStatus = !editableDriver.isLogin;
      setEditableDriver((prevDriver) => ({
        ...prevDriver,
        isLogin: newLoginStatus,
      }));
      await axios.post(`${BASE_URL}/api/users/driver/${editableDriver._id}/toggle-login`);
    } catch (error) {
      console.error('Error toggling login status:', error);
      Alert.alert('Error', 'Failed to update login status. Please try again.');
      setEditableDriver((prevDriver) => ({
        ...prevDriver,
        isLogin: !prevDriver.isLogin,
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

          <Text style={styles.name}>{editableDriver.firstName} {editableDriver.lastName}</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.textValue}>{editableDriver.phone}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Device ID:</Text>
            <Text style={styles.textValue} numberOfLines={1} ellipsizeMode="tail">
              {editableDriver.deviceId}
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Points Earned:</Text>
            <Text style={styles.textValue}>{editableDriver.points_earned}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>User Type:</Text>
            <Text style={styles.textValue}>{editableDriver.userType}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Activated:</Text>
            <Switch
              value={editableDriver.activated}
              onValueChange={handleActivateDeactivate}
              thumbColor={editableDriver.activated ? "#34C759" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Login Status:</Text>
            <Switch
              value={editableDriver.isLogin}
              onValueChange={handleToggleLoginStatus}
              thumbColor={editableDriver.isLogin ? "#34C759" : "#f4f3f4"}
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
    flexWrap: 'wrap', // Ensures the text doesn't overflow out of the modal
  },
  label: {
    fontSize: 16,
    color: '#555',
    flex: 1,
    flexWrap: 'wrap', // Keeps text within bounds
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

export default DriverModal;
