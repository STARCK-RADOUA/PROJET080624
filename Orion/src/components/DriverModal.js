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

  useEffect(() => {
    setEditableDriver({ ...driver });
    socket.emit('locationUpdateForAdminRequest', { deviceId: driver.deviceId });

    // Listen for real-time location updates and connection status
    socket.on('locationUpdateForAdmin', ({ deviceId, latitude, longitude, isConnected }) => {
      if (deviceId === driver.deviceId) {
        setLocation({ latitude, longitude });
        setIsConnected(isConnected); // Update connection status
        console.log(`Driver's new location: Latitude ${latitude}, Longitude ${longitude}, Connected: ${isConnected}`);
      }
    });

    // Clean up on unmount
    return () => {
      socket.off('locationUpdateForAdmin');
    };
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

  // Open Google Maps with the driver's real-time location
  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    Linking.openURL(url).catch(err => console.error('Error opening Google Maps', err));
  };

  // Open Waze with the driver's real-time location
  const openWaze = () => {
    const url = `waze://?ll=${location.latitude},${location.longitude}&navigate=yes`;
    Linking.openURL(url).catch(err => {
      Alert.alert("Can't open Waze", "Make sure Waze is installed on your device.");
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

          {/* Connection Status */}
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Connection Status:</Text>
            <Text style={[styles.textValue, { color: isConnected ? 'green' : 'red' }]}>
              {isConnected ? 'Connected' : 'Disconnected'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalView: {
    width: '85%',
    backgroundColor: '#333', 
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
    color: '#1f695a', 
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
    color: '#ddd', 
    marginBottom: 5,
  },
  textValue: {
    fontSize: 16,
    color: '#fff', 
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#afb997',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    flex: 1,
    justifyContent: 'center',
  },
  navigateText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#555',
    marginVertical: 15,
  },
});

export default DriverModal;
