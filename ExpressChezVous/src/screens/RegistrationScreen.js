import { BASE_URL, BASE_URLIO } from '@env';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import io from 'socket.io-client';
import * as Device from 'expo-device';

const socket = io(`${BASE_URLIO}`); // Remplacez par l'URL de votre serveur

const RegistrationScreen = ({ navigation }) => {
  const [deviceId, setDeviceId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cmpassword, setcmPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // Récupération de l'ID unique de l'appareil avec Expo
    const getDeviceId = async () => {
      const id = Device.osBuildId; // Par exemple, en utilisant Device.osBuildId
      setDeviceId(id);
    };

    getDeviceId();

    // Vérification de la validité du formulaire
    setIsFormValid(
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      phone.trim() !== '' &&
      password === cmpassword &&  // Validation des mots de passe
      password.length >= 6  // Vérification de la longueur minimale du mot de passe
    );

    // Écoute de l'événement de registration côté serveur
    socket.on('clientRegistered', (data) => {
      console.log('Client registered:', data);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Loading' }],
      });
    });

    return () => {
      socket.off('clientRegistered');
    };
  }, [firstName, lastName, phone, password, cmpassword, deviceId]);

  const handleConfirm = () => {
    // Vérification supplémentaire avant d'envoyer les données
    if (password !== cmpassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    // Emission de l'événement avec les données de l'utilisateur + deviceId
    socket.emit('registerClient', { firstName, lastName, phone, password, deviceId });
    navigation.replace('Loading');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete your registration</Text>
      <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      
      {/* Champs pour le mot de passe */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry={true}
        value={cmpassword}
        onChangeText={setcmPassword}
      />

      <TouchableOpacity style={[styles.button, !isFormValid && styles.disabledButton]} onPress={isFormValid ? handleConfirm : null} disabled={!isFormValid}>
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    width: '80%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#FFDD00',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default RegistrationScreen;
