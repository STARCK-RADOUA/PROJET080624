import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated, Easing, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
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
      const id = Device.osBuildId;
      setDeviceId(id);
    };
    handleGetLocation();
    getDeviceId();

    const validatePhoneNumber = (phone) => {
      const phoneRegex = /^(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}$/;
      return phoneRegex.test(phone);
    };

    if (phone !== '' && !validatePhoneNumber(phone)) {
      setPhoneError('Format de numéro de téléphone invalide.');
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
      Alert.alert('Permission refusée', 'L autorisation de localisation est requise pour continuer.');
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
          <Text style={styles.title}>Complétez votre inscription</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#e9ab25" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Prénom" placeholderTextColor="#ccc" value={firstName} onChangeText={setFirstName} />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#e9ab25" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Nom de famille" placeholderTextColor="#ccc" value={lastName} onChangeText={setLastName} />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#e9ab25" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="06 ********"
              keyboardType="phone-pad"
              placeholderTextColor="#ccc"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#e9ab25" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry={true} placeholderTextColor="#ccc" value={password} onChangeText={setPassword} />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#e9ab25" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Confirmer le mot de passe" secureTextEntry={true} placeholderTextColor="#ccc" value={cmpassword} onChangeText={setcmPassword} />
          </View>

          {/* Horizontal location icon and confirm button */}
          <View style={styles.horizontalContainer}>
          

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
                <Text style={styles.buttonText}>Confirmer</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

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
    backgroundColor: '#101010', // Darker background for modern contrast
  },
  scrollViewContent: {
    justifyContent: 'center',
    paddingTop: width * 0.15, // Less padding for a sleeker look
    alignItems: 'center',
  },
  title: {
    fontSize: 32, // Larger and modern font size
    fontWeight: '700', // Bold font weight for a strong presence
    marginBottom: 30, // More space for a cleaner layout
    color: '#f5f5f5', // White for modern contrast
    textAlign: 'center',
    letterSpacing: 1.8, // Modern spaced letters
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#1c1c1c', // Darker input background
    borderRadius: 15, // More rounded corners for modern look
    marginBottom: 20, // More space between inputs
    paddingHorizontal: 15,
    paddingVertical: 12, // Slightly thicker padding
    borderWidth: 1,
    borderColor: '#e9ab25', // Gold border
    shadowColor: '#e9ab25',
    shadowOpacity: 0.4, // Softer shadow for subtle depth
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  inputIcon: {
    marginRight: 12, // Slightly more space between icon and input
    color: '#e9ab25', // Gold icon color
  },
  input: {
    flex: 1,
    color: '#fff', // Clean white text for input fields
    fontSize: 18, // Larger text for better readability
    fontWeight: '400', // Lighter font weight for a modern feel
  },
  button: {
    width: '100%',
    padding: 16, // Slightly larger padding
    backgroundColor: '#1c1c1c', // Gold background for modern accent
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#1c1c1c',
    shadowOffset: { width: 0, height: 8 }, // Subtle elevated shadow for depth
    shadowOpacity: 0.7,
    shadowRadius: 15,
    elevation: 8,
    flexDirection: 'row', // Horizontal layout for possible icons in the future
    justifyContent: 'center', // Center text
    marginTop: 20,
  },
  buttonText: {
    color: '#e9ab25', // Dark text for contrast
    fontWeight: '700', // Stronger font weight
    fontSize: 18, // Larger button text for modern emphasis
    letterSpacing: 1.2,
  },
  disabledButton: {
    opacity: 0.5, // Disabled button is semi-transparent
  },
  errorText: {
    color: '#ff4d4d', // Bright red for error messages
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14, // More readable error text size
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensure space between the location and confirm buttons
    marginTop: 30, // More space for a cleaner layout
    width: '100%',
  },
 
 
  infoText: {
    color: '#e9ab25', // Gold text for modern feel
    textAlign: 'center',
    fontSize: 14,
    marginTop: 30,
    lineHeight: 20,
    fontStyle: 'italic', // Italicized for emphasis
  },
});

export default RegistrationWithLocationScreen;
