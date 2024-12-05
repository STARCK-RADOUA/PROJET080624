import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { Input } from 'react-native-elements';  // Expo SDK 52 Input component
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';

// Connect to the socket server
const socket = io(BASE_URLIO);

const SettingsScreen = () => {
  const [isClientsActive, setIsClientsActive] = useState(true);
  const [isDriversActive, setIsDriversActive] = useState(true);
  const [isSystemActive, setIsSystemActive] = useState(true);
  const [maxTranche, setMaxTranche] = useState('30');
  const [actuTranche, setActuTranche] = useState('10');

  useEffect(() => {
    socket.emit('statusS');
    // Listen to the initial status from the server
    socket.on('statusSite', (data) => {
      setIsSystemActive(data.systemActive);
      setIsClientsActive(data.clientsActive);
      setIsDriversActive(data.driversActive);
      setMaxTranche(data.MAX_TRANCHE );
      setActuTranche(data.actuTranche );
    });

    // Cleanup on unmount
    return () => {
      socket.off('status');
    };
  }, []);

  // Toggle System status
  const toggleSystem = () => {
    const newStatus = !isSystemActive;
    setIsSystemActive(newStatus);
    socket.emit('toggleSystem', newStatus); // Emit change to the server
  };

  // Toggle Clients status
  const toggleClients = () => {
    const newStatus = !isClientsActive;
    setIsClientsActive(newStatus);
    socket.emit('toggleClients', newStatus); // Emit change to the server
  };

  // Toggle Drivers status
  const toggleDrivers = () => {
    const newStatus = !isDriversActive;
    setIsDriversActive(newStatus);
    socket.emit('toggleDrivers', newStatus); // Emit change to the server
  };

  // Function to apply tranche values
  const applyTranches = () => {
    socket.emit('updateTranches', { maxTranche, actuTranche });
    alert('Tranches mises à jour');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Icon name="settings-outline" type="ionicon" color="#000" />
      </View>

      {/* System Activation Section */}
      <View style={styles.settingContainer}>
        <View style={styles.settingRow}>
          <Icon name="power-outline" type="ionicon" color={isSystemActive ? "#1976d2" : "#ff5252"} />
          <Text style={styles.settingText}>Activate Entire System</Text>
        </View>
        <Switch
          trackColor={{ false: '#767577', true: '#1976d2' }}
          thumbColor={isSystemActive ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSystem}
          value={isSystemActive}
        />
      </View>

      {/* Clients Activation Section */}
      <View style={styles.settingContainer}>
        <View style={styles.settingRow}>
          <Icon name="people-outline" type="ionicon" color={isClientsActive ? "#1976d2" : "#ff5252"} />
          <Text style={styles.settingText}>Activate All Clients</Text>
        </View>
        <Switch
          trackColor={{ false: '#767577', true: '#1976d2' }}
          thumbColor={isClientsActive ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleClients}
          value={isClientsActive}
        />
      </View>

      {/* Drivers Activation Section */}
      <View style={styles.settingContainer}>
        <View style={styles.settingRow}>
          <Icon name="car-outline" type="ionicon" color={isDriversActive ? "#1976d2" : "#ff5252"} />
          <Text style={styles.settingText}>Activate All Drivers</Text>
        </View>
        <Switch
          trackColor={{ false: '#767577', true: '#1976d2' }}
          thumbColor={isDriversActive ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleDrivers}
          value={isDriversActive}
        />
      </View>

      {/* Max Tranche and Actu Tranche Input Section */}
      <View style={styles.settingContainer}>
        <Text style={styles.settingText}>Max Tranche:</Text>
        <Input
          value={maxTranche}
          onChangeText={setMaxTranche}
          placeholder="Enter max tranche"
          keyboardType="numeric"
          containerStyle={styles.inputContainer}
          inputStyle={styles.inputStyle}
        />
      </View>

      <View style={styles.settingContainer}>
        <Text style={styles.settingText}>Actu Tranche:</Text>
        <Input
          value={actuTranche}
          onChangeText={setActuTranche}
          placeholder="Enter actu tranche"
          keyboardType="numeric"
          containerStyle={styles.inputContainer}
          inputStyle={styles.inputStyle}
        />
      </View>

      {/* Apply Button */}
      <TouchableOpacity style={styles.applyButton} onPress={applyTranches}>
        <Text style={styles.applyButtonText}>Appliquer</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#000',
  },
  inputContainer: {
    width: '60%',
  },
  inputStyle: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
