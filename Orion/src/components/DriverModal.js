import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Switch, Alert, Linking } from 'react-native';
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

  useEffect(() => {
    setEditableDriver({ ...driver });
    socket.emit('locationUpdateForAdminRequest', { deviceId: driver.deviceId });
    console.log('------------------------------------');
    console.log('Mise à jour de la localisation reçue :', driver.deviceId);
    console.log('------------------------------------');

    // Listen for real-time location updates and connection status
    socket.on('locationUpdateForAdmin', ({ deviceId, latitude, longitude, isConnected, isDisponible }) => {
      console.log('------------------------------------');
      console.log('Received location update:', { deviceId, latitude, longitude, isConnected ,isDisponible});
      console.log('------------------------------------');
      if (deviceId === driver.deviceId) {
        setLocation({ latitude, longitude });
        setIsConnected(isConnected); // Update connection status
        setDisponible(isDisponible); // Update connection status
        console.log(`Driver's new location: Latitude ${latitude}, Longitude ${longitude}, Connected: ${isConnected}`);
      }
    });

    // Clean up on unmount
    return () => {
      socket.off('locationUpdateForAdmin');
    };
  }, [driver]);

 // Assuming you have already connected the admin to Socket.IO

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
            <Text style={styles.textValue}>{editableDriver.phone}</Text>
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

          {/* Connection Status */}
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

          {/* Buttons to open navigation apps */}
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Dark background for modal
    paddingVertical: "20%",
  },
  modalView: {
    width: '90%',
    backgroundColor: '#38435a88', // Dark background for modal view
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 7,
    elevation: 10, // For Android shadow
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5A67D8', // Primary theme color for title
    textAlign: 'center',
    marginVertical: 15,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E2E8F0', // Light grey for labels
  },
  textValue: {
    fontSize: 16,
    color: '#FFFFFF', // White for text
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A67D8', // Primary theme color for navigation buttons
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    flex: 1,
    justifyContent: 'center',
  },
  navigateText: {
    color: '#FFFFFF', // White text for navigation button
    marginLeft: 10,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#CBD5E0', // Light grey separator
    marginVertical: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
});


export default DriverModal;
