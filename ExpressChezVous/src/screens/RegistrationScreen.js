import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { BASE_URL, BASE_URLIO } from '@env';
import { getClient } from '../services/userService';
const socket = io(`${BASE_URLIO}`);

const RegistrationScreen = ({ navigation,route }) => {
  const [deviceId, setDeviceId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cmpassword, setcmPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const buttonScale = useRef(new Animated.Value(1)).current;
console.log('------------------------------------');
console.log(route.params.uniqueId,"yuyuuyuyuyyuyuyuyuyuyuyuyuyuyuyuyyuy");
console.log('------------------------------------');
  useEffect(() => {
    const getDeviceId = async () => {
      const id = DeviceInfo.getUniqueId();
      setDeviceId(id);
    };

    getDeviceId();

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

    socket.on('clientRegistered', async(data) => {
      if (data.message === 'success') {

        try {
          const clientId = await getClient();
          // Send the client ID to check if the cart exists or create a new one
          const response = await axios.post(`${BASE_URL}/api/carts/add`, {
            client_id: clientId,  // Make sure to send `client_id` as expected by the backend
          });
      
          if (response.status === 201) {
            console.log('New cart created:', response.data);
          } else if (response.status === 200) {
            console.log('Existing cart found:', response.data);
          }
      
          // Proceed with the rest of your logic
         
        } catch (error) {
          console.error('Error handling cart creation/check:', error);
        }
        Alert.alert('Success', data.details);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Loading' }],
        });
      } else {
        Alert.alert('Error', data.details);
      }
    });

    return () => {
      socket.off('clientRegistered');
    };
  }, [firstName, lastName, phone, password, cmpassword, deviceId, phoneError]);

  const handleConfirm = () => {
    if (password !== cmpassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
console.log(phone)
    socket.emit('registerClient', { firstName, lastName, phone, password, deviceId , token: route.params.uniqueId});
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
      })
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
