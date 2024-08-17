import { BASE_URL } from '@env';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { styles } from './styles/loginstyle'; // Assuming you have a style file
import { getDeviceId } from '../services/userService';
const ServicesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    
    
    const deviceId =await  getDeviceId(); // Replace with the actual user ID from context or storage

    try {
      const response = await fetch(`${BASE_URL}/api/clients/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to login screen after successful logout
        navigation.replace('Login');
      } else {
        Alert.alert('Logout Failed', data.errors ? data.errors.join(', ') : data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong during logout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Services Page</Text>

      {/* Logout Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#fff" />}
    </View>
  );
};

export default ServicesScreen;
