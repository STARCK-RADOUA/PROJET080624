// src/screens/RegistrationScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const RegistrationScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    navigation.navigate('Loading'); // Redirige vers l'écran de chargement
    setTimeout(() => {
      setIsLoading(false);
      // Simuler l'activation du compte
      navigation.replace('Home'); // Après l'activation, redirigez vers l'écran principal
    }, 3000); // Simule une attente de 3 secondes
  };

  useEffect(() => {
    setIsFormValid(firstName.trim() !== '' && lastName.trim() !== '' && phoneNumber.trim() !== '');
  }, [firstName, lastName, phoneNumber]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete your registration</Text>
      <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
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
