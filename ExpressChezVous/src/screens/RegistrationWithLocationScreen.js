import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';

const socket = io(`${BASE_URLIO}`);

const RegistrationWithLocationScreen = ({ navigation }) => {
  const [deviceId, setDeviceId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cmpassword, setcmPassword] = useState('');
  const [location, setLocation] = useState(null);
  const [isLocationObtained, setIsLocationObtained] = useState(false); // Vérifie si la localisation a été récupérée
  const [isFormValid, setIsFormValid] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const getDeviceId = async () => {
      const id = Device.osBuildId;
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
      phoneError === '' &&
      isLocationObtained // La localisation doit être obtenue pour valider le formulaire
    );

    socket.on('clientRegisteredLC', (data) => {
      if (data.message === 'success') {
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
      socket.off('clientRegisteredLC');
    };
  }, [firstName, lastName, phone, password, cmpassword, deviceId, phoneError, isLocationObtained]);

  const handleConfirm = () => {
    if (password !== cmpassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    socket.emit('registerClientLC', { firstName, lastName, phone, password, deviceId, location });
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

  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required to proceed.');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
    setIsLocationObtained(true); // Localisation récupérée avec succès
  };

  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#e4b50a']} style={styles.container}>
      <Text style={styles.title}>Complete your registration</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#fff" style={styles.inputIcon} />
        <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#ccc" value={firstName} onChangeText={setFirstName} />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#fff" style={styles.inputIcon} />
        <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#ccc" value={lastName} onChangeText={setLastName} />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="#fff" style={styles.inputIcon} />
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
        <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.inputIcon} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry={true} placeholderTextColor="#ccc" value={password} onChangeText={setPassword} />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.inputIcon} />
        <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry={true} placeholderTextColor="#ccc" value={cmpassword} onChangeText={setcmPassword} />
      </View>

      {/* Bouton pour récupérer la localisation */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={handleGetLocation}
      >
        <Text style={styles.buttonText}>Get Location</Text>
      </TouchableOpacity>

    

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
    color: '#fff',
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
    backgroundColor: '#ffaa00cf',
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#FFDD00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 5,
  },
  buttonText: {
    color: '#191818',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  locationButton: {
    width: '80%',
    padding: 15,
    backgroundColor: '#00AAFF',
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 15,
  },
  locationText: {
    color: '#fff',
    marginTop: 10,
  },
});

export default RegistrationWithLocationScreen;
