import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, AppState, TextInput, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import axios from 'axios';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { BASE_URL, BASE_URLIO } from '@env';
import { getClient } from '../services/userService';

const socket = io(`${BASE_URLIO}`);

const RegistrationScreen = ({ navigation, route }) => {
  const [deviceId, setDeviceId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cmpassword, setcmPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [savedTimestamp, setSavedTimestamp] = useState(null);
const [uniqueId, setUniqueId] = useState('');
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const getDeviceId = async () => {
      const id = Device.osBuildId;
      setDeviceId(id);
    };

    getDeviceId();
    setUniqueId(route?.params?.uniqueId )
    
    const validatePhoneNumber = (phone) => {
      const phoneRegex = /^\d{10}$/;
      return phoneRegex.test(phone);
    };

    if (phone !== '' && !validatePhoneNumber(phone)) {
      setPhoneError('Invalid phone number format.');
    } else {
      setPhoneError('');
    }

    setIsFormValid(
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      phone.trim() !== '' &&
      password === cmpassword &&
      password.length >= 6 &&
      phoneError === ''
    );

    // Check saved timestamp on component mount
    const checkStorage = async () => {
      const registrationData = await AsyncStorage.getItem('registrationTimestamp');
      if (registrationData) {
        const parsedData = JSON.parse(registrationData); // Parse l'objet JSON
        const { timestamp, uniqueId } = parsedData;
        setSavedTimestamp(timestamp);
        setUniqueId(uniqueId);
        const now = new Date().getTime();
        const elapsed = now - parseInt(timestamp, 10);
        if (elapsed > 15 * 60 * 1000) { // 15 minutes
          await AsyncStorage.removeItem('registrationTimestamp');
          console.log('Registration timestamp expired');
          navigation.replace('Login');
        }
      }
    };

    checkStorage();

    // Listen for 'clientRegistered' event
    socket.on('clientRegistered', async (data) => {
      if (data.message === 'success') {
        try {
          const clientId = await getClient();
          const response = await axios.post(`${BASE_URL}/api/carts/add`, {
            client_id: clientId,
          });

          if (response.status === 201) {
            console.log('New cart created:', response.data);
          } else if (response.status === 200) {
            console.log('Existing cart found:', response.data);
          }

        } catch (error) {
          console.error('Error handling cart creation/check:', error);
        }
        Alert.alert('Success', data.details);
        await AsyncStorage.removeItem('registrationTimestamp');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Loading' }],
        });
      } else {
        Alert.alert('Error', data.details);
      }
    });

    // Listen for client activation
    socket.on('clientActivated', async () => {
      setIsActivated(true);
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Services' }],
      });
    });

    return () => {
      socket.off('clientRegistered');
      socket.off('clientActivated');
    };
  }, [firstName, lastName, phone, password, cmpassword, deviceId, phoneError]);

  // Define saveTimestamp function
  const saveTimestamp = async () => {
    if (!savedTimestamp) {
      const now = new Date().getTime(); // Get the current timestamp
      const data = { timestamp: now, uniqueId }; // Store object with the current timestamp and uniqueId
      await AsyncStorage.setItem('registrationTimestamp', JSON.stringify(data)); // Use JSON.stringify to store
      setSavedTimestamp(now); // Set state with the current timestamp
      console.log('Registration timestamp saved:', now); // Log the current timestamp
    } else {
      const data = { timestamp: savedTimestamp, uniqueId }; // Use the savedTimestamp value if it exists
      await AsyncStorage.setItem('registrationTimestamp', JSON.stringify(data)); // Use JSON.stringify to store
      console.log('Registration timestamp 222 saved:', savedTimestamp); // Log the saved timestamp
    }
  
    console.log('------------------------------------');
    console.log('uniqueId:', uniqueId); // Ensure uniqueId is logged correctly
    console.log('------------------------------------');
  };
  

  // Listen to app state changes and save the timestamp when app goes to background
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        await saveTimestamp();
      }
    });

    return () => {
      appStateListener.remove();
    };
  }, [savedTimestamp , uniqueId]);

  const handleConfirm = () => {
    if (password !== cmpassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    socket.emit('registerClient', { firstName, lastName, phone, password, deviceId, token: uniqueId});
  };

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#e9ab25']} style={styles.container}>
      <Text style={styles.title}>Complete your registration</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#e9ab25" style={styles.inputIcon} />
        <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#ccc" value={firstName} onChangeText={setFirstName} />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#e9ab25" style={styles.inputIcon} />
        <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#ccc" value={lastName} onChangeText={setLastName} />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="#e9ab25" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          placeholderTextColor="#ccc"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#e9ab25" style={styles.inputIcon} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry={true} placeholderTextColor="#ccc" value={password} onChangeText={setPassword} />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#e9ab25" style={styles.inputIcon} />
        <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry={true} placeholderTextColor="#ccc" value={cmpassword} onChangeText={setcmPassword} />
      </View>

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          style={[styles.button, !isFormValid && styles.disabledButton]}
          onPress={() => {
            if (isFormValid) {
              animateButtonPress();
              handleConfirm();
            }
          }}
          disabled={!isFormValid}
        >
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#e9ab25',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e9ab25',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#e9ab25',
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#e9ab25',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 5,
  },
  buttonText: {
    color: '#191818',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1.2,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default RegistrationScreen;
