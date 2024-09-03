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
      Alert.alert('Success', `Driver ${isActive ? 'activated' : 'deactivated'} successfully.`);
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
      Alert.alert('Success', `Login status ${newLoginStatus ? 'enabled' : 'disabled'} successfully.`);
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
};const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalView: {
    width: '85%',
    backgroundColor: '#333', // Fond sombre pour le modal
    borderRadius: 15,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 7,
    elevation: 10, 
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f695a', // Texte en blanc pour le nom
    textAlign: 'center',
    marginVertical: 15,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ddd', // Couleur gris clair pour les labels
    marginBottom: 5,
  },
  textValue: {
    fontSize: 16,
    color: '#fff', // Texte en blanc pour une meilleure lisibilité
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555', // Bordure plus sombre pour les inputs
    marginBottom: 10,
    backgroundColor: '#444', // Fond plus sombre pour les inputs
    color: '#fff', // Texte en blanc pour les inputs
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#f3b13e',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center',
  },
  submitButtonText: {
    color: '#000', // Texte sombre pour contraster avec la couleur du bouton
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#555', // Séparateur plus sombre
    marginVertical: 15,
  },
});

export default DriverModal;
