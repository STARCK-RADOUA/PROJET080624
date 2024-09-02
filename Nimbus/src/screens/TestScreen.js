import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Switch } from 'react-native';
import axios from 'axios';
import * as Device from 'expo-device';
import io from 'socket.io-client';

const TestScreen = () => {
  const [driverId, setDriverId] = useState(null); // State to store driver ID
  const [deviceId, setDeviceId] = useState(null); // State to store device ID
  const [isEnabled, setIsEnabled] = useState(false); // State for the switch button (disponible)
  const [isSwitchDisabled, setIsSwitchDisabled] = useState(false); // State to disable switch
  const [activeStatusMessage, setActiveStatusMessage] = useState('Fetching status...'); // Active status message

  // Function to get device ID
  const getDeviceId = async () => {
    if (Device.isDevice) {
      setDeviceId(Device.osBuildId); // Set deviceId using expo-device's osBuildId
    } else {
      Alert.alert('Error', 'Must use a physical device for Device ID.');
    }
  };

  // Function to fetch driver ID from backend
  const fetchDriverId = async () => {
    try {
      if (deviceId) {
        const response = await axios.post('http://192.168.1.29:4000/api/driver/device', {
          deviceId: deviceId, // Pass deviceId here
        });

        if (response.status === 200 && response.data.driverId) {
          setDriverId(response.data.driverId); // Store the driver ID in the state
          setIsEnabled(response.data.driverInfo.isDisponible); // Set the initial value of isDisponible
          setActiveStatusMessage(response.data.driverInfo.isDisponible ? 'True' : 'False'); // Set initial status message
          console.log('Driver ID fetched successfully:', response.data.driverId); // Debugging
        } else {
          console.log('Driver not found');
        }
      }
    } catch (error) {
      console.error('Error fetching driver ID:', error);
    }
  };

  // UseEffect to get device ID and then fetch driver ID
  useEffect(() => {
    const fetchAndSetDeviceId = async () => {
      await getDeviceId(); // Get deviceId first
    };

    fetchAndSetDeviceId(); // Fetch deviceId on mount
  }, []);

  // Fetch driver ID once deviceId is set
  useEffect(() => {
    if (deviceId) {
      fetchDriverId(); // Fetch driver ID after deviceId is set
    }
  }, [deviceId]);

  // Setup Socket.IO for real-time updates on order active status
  useEffect(() => {
    if (!driverId) return;

    // Connect to the Socket.IO server
    const socket = io('http://192.168.1.29:4000'); // Replace with your server address

    // Emit the driver's ID to the server once the connection is established
    socket.emit('driverConnected', driverId);

    // Debugging: Log when the socket connects successfully
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    // Listen for real-time updates to order active status
    socket.on('orderActiveChanged', (data) => {
      console.log('Received orderActiveChanged event:', data);

      // If the order is active, set the switch ON and disable it
      if (data.active) {
        setIsSwitchDisabled(true); // Disable the switch button
        setIsEnabled(true); // Switch is ON when the order is active
        setActiveStatusMessage('Order is active');
      } else {
        setIsSwitchDisabled(false); // Enable the switch button
        setIsEnabled(false); // Switch is OFF when the order is inactive
        setActiveStatusMessage('Order is inactive');
      }
    });

    // Handle order details received from the backend
    socket.on('orderDetails', (orderData) => {
      console.log('Order details received:', orderData);

      // Same logic as in orderActiveChanged
      if (orderData.active) {
        setIsSwitchDisabled(true);
        setIsEnabled(true); // Switch is ON when order is active
        setActiveStatusMessage('Order is active');
      } else {
        setIsSwitchDisabled(false);
        setIsEnabled(false); // Switch is OFF when order is inactive
        setActiveStatusMessage('Order is inactive');
      }
    });

    // Cleanup on component unmount
    return () => {
      console.log('Disconnecting from Socket.IO server');
      socket.disconnect();
    };
  }, [driverId]); // Dependency on driverId

  // Function to update driver availability (isDisponible)
  const updateDriverAvailability = async (newIsEnabled) => {
    try {
      if (driverId) {
        await axios.post('http://192.168.1.29:4000/api/driver/updateAvailability', {
          driverId: driverId, // Send driverId to the backend
          isDisponible: newIsEnabled, // Send the new availability status
        });
        console.log('Driver availability updated successfully'); // Debugging
      }
    } catch (error) {
      console.error('Error updating driver availability:', error);
    }
  };

  // Toggle switch handler
  const toggleSwitch = () => {
    const newIsEnabled = !isEnabled; // Toggle the current state
    setIsEnabled(newIsEnabled); // Update the local state
    updateDriverAvailability(newIsEnabled); // Send the update to the backend
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is the Test Screen</Text>

      {/* Display the driver ID */}
      <Text style={styles.text}>
        {driverId ? `Driver ID: ${driverId}` : 'Fetching driver ID...'}
      </Text>

      {/* Display the active status message */}
      <Text style={styles.text}>{activeStatusMessage}</Text>

      {/* Add the Switch button */}
      <View style={styles.switchContainer}>
        <Text style={styles.text}>{isEnabled ? 'Disponible is ON' : 'Disponible is OFF'}</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }} // Customize the track color
          thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"} // Customize the thumb color
          ios_backgroundColor="#3e3e3e" // iOS background color
          onValueChange={toggleSwitch} // On switch toggle
          value={isEnabled} // The current state of the switch
          disabled={isSwitchDisabled} // Disable the switch if the order is active
        />
        {isSwitchDisabled && <Text style={styles.text}>Switch is disabled due to active order</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  switchContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});

export default TestScreen;
