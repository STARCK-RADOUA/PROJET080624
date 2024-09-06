import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated, Easing, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import DeviceInfo from 'react-native-device-info';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';

const socket = io(`${BASE_URLIO}`);
const { width, height } = Dimensions.get('window'); // Get device dimensions

const RegistrationWithLocationScreen = ({ navigation }) => {
  const [deviceId, setDeviceId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cmpassword, setcmPassword] = useState('');
  const [location, setLocation] = useState(null);
  const [isLocationObtained, setIsLocationObtained] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const buttonScale = useRef(new Animated.Value(1)).current;

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
      phoneError === '' &&
      isLocationObtained
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
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required to proceed.');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
    setIsLocationObtained(true);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      {/* Futuristic theme based on orange `#e9ab25` */}
      <LinearGradient colors={['#0f2027', '#203a43', '#e9ab25']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.title}>Complete Your Registration</Text>

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

          {/* Horizontal location icon and confirm button */}
          <View style={styles.horizontalContainer}>
            <TouchableOpacity onPress={handleGetLocation} style={styles.locationButton}>
              <Ionicons name="location-outline" size={40} color="white" />
              <Text style={styles.locationButtonText}>Get Location</Text>
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
          </View>

          {/* Information about location requirement */}
          <Text style={styles.infoText}>
            To verify you're not a robot or spam, please provide your location to proceed.
          </Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: '9%',
  },
  scrollViewContent: {
    justifyContent: 'center',
    paddingTop: width * 0.2,
    alignItems: 'center',
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
    width: '100%',
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
    width: '100%',
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
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  locationButton: {
    backgroundColor: '#e9ab25',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e9ab25',
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  locationButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#e9ab25',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 30,
    lineHeight: 20,
  },
});

export default RegistrationWithLocationScreen;
