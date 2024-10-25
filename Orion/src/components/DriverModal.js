import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Switch, Alert, Linking, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '@env';
import io from 'socket.io-client';

const socket = io(BASE_URL);

const DriverModal = ({ visible, onClose, driver }) => {
  if (!driver) return null;

  const [editableDriver, setEditableDriver] = useState({ ...driver });
  const [location, setLocation] = useState(null); // Store real-time location data
  const [isConnected, setIsConnected] = useState(false); // Store connection status
  const [isDisponible, setDisponible] = useState(false); // Store connection status
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode

  const handleDeleteDriver = () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer ce conducteur ?',
      [
        {
          text: 'Annuler',
          onPress: () => console.log('Suppression annulée'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const response = await axios.delete(`${BASE_URL}/api/driver/delete/${editableDriver._id}`);
              if (response.status === 200) {
                Alert.alert('Succès', 'Conducteur supprimé avec succès.');
                onClose(); // Close the modal after successful deletion
              }
            } catch (error) {
              console.error('Erreur lors de la suppression du conducteur:', error);
              Alert.alert('Erreur', 'Échec de la suppression du conducteur. Veuillez réessayer.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    setEditableDriver({ ...driver });
    socket.emit('locationUpdateForAdminRequest', { deviceId: driver.deviceId });
    
    // Listen for real-time location updates and connection status
    socket.on('locationUpdateForAdmin', ({ deviceId, latitude, longitude, isConnected, isDisponible }) => {
      if (deviceId === driver.deviceId) {
        setLocation({ latitude, longitude });
        setIsConnected(isConnected); // Update connection status
        setDisponible(isDisponible); // Update connection status
      }
    });

    // Clean up on unmount
    return () => {
      socket.off('locationUpdateForAdmin');
    };
  }, [driver]);

  // Function to activate or deactivate a driver via Socket.IO
  const handleActivateDeactivate = (isActive) => {
    try {
      setEditableDriver((prevDriver) => ({
        ...prevDriver,
        activated: isActive,
      }));

      // Send activation/deactivation event to server via Socket.IO
      socket.emit('adminActivateDeactivateDriver', { driverId: editableDriver._id, isActive, deviceId: editableDriver.deviceId });

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

  // Function to toggle the login status of a driver via Socket.IO
  const handleToggleLoginStatus = () => {
    try {
      const newLoginStatus = !editableDriver.isLogin;
      setEditableDriver((prevDriver) => ({
        ...prevDriver,
        isLogin: newLoginStatus,
      }));

      // Send toggle login status event to server via Socket.IO
      socket.emit('adminToggleDriverLoginStatus', { driverId: editableDriver._id });

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

  // Open Google Maps with the driver's real-time location
  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    Linking.openURL(url).catch(err => console.error('Erreur lors de l\'ouverture de Google Maps', err));
  };

  // Open Waze with the driver's real-time location
  const openWaze = () => {
    const url = `waze://?ll=${location.latitude},${location.longitude}&navigate=yes`;
    Linking.openURL(url).catch(err => {
      Alert.alert("Impossible d'ouvrir Waze", "Assurez-vous que Waze est installé sur votre appareil.");
    });
  };

  const handleInputChange = (field, value) => {
    setEditableDriver((prevDriver) => ({
      ...prevDriver,
      [field]: value,
    }));
  };

  const handleUpdateDriver = async () => {
    try {
      const response = await axios.put(`${BASE_URL}/api/driver/update/${editableDriver._id}`, editableDriver);
      if (response.status === 200) {
        Alert.alert('Succès', 'Conducteur mis à jour avec succès.');
        setIsEditing(false); // Exit editing mode
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du conducteur:', error);
      Alert.alert('Erreur', 'Échec de la mise à jour du conducteur. Veuillez réessayer.');
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
            <Text style={styles.label}>Téléphone :</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={editableDriver.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
              />
            ) : (
              <Text style={styles.textValue}>{editableDriver.phone}</Text>
            )}
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>ID de l'appareil :</Text>
            <Text style={styles.textValue} numberOfLines={1} ellipsizeMode="tail">
              {editableDriver.deviceId}
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Points accumulés :</Text>
            <Text style={styles.textValue}>{editableDriver.points_earned}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Type d'utilisateur :</Text>
            <Text style={styles.textValue}>{editableDriver.userType}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Statut de connexion :</Text>
            <Text style={[styles.textValue, { color: isConnected ? 'green' : 'red' }]}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Disponibility Status:</Text>
            <Text style={[styles.textValue, { color: isDisponible ? 'green' : 'red' }]}>
              {isDisponible ? 'Disponible' : 'inDisponible'}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.fieldRow}>
            <TouchableOpacity style={styles.navigateButton} onPress={openGoogleMaps}>
              <Ionicons name="navigate-outline" size={24} color="white" />
              <Text style={styles.navigateText}>Google Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navigateButton} onPress={openWaze}>
              <Ionicons name="navigate-outline" size={24} color="white" />
              <Text style={styles.navigateText}>Waze</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Activé :</Text>
            <Switch
              value={editableDriver.activated}
              onValueChange={handleActivateDeactivate}
              thumbColor={editableDriver.activated ? "#5A67D8" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Statut de connexion :</Text>
            <Switch
              value={editableDriver.isLogin}
              onValueChange={handleToggleLoginStatus}
              thumbColor={editableDriver.isLogin ? "#5A67D8" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>

          {isEditing ? (
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateDriver}>
              <Text style={styles.saveText}>Sauvegarder</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={24} color="white" />
              <Text style={styles.editText}>Modifier</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteDriver}>
            <Ionicons name="trash" size={24} color="white" />
            <Text style={styles.deleteText}>Supprimer le conducteur</Text>
          </TouchableOpacity>
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

export default DriverModal;
