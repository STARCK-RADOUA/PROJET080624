import React, { useState } from 'react';
import { View, Text, TextInput, Modal, Pressable, ScrollView, Switch, TouchableOpacity, StyleSheet, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '@env';

const AddDriverModal = ({ modalVisible, setModalVisible }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);
  const [userType, setUserType] = useState('Driver');
  const [activated, setActivated] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert('Erreur de validation', 'Le prénom est obligatoire');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Erreur de validation', 'Le nom est obligatoire');
      return false;
    }
    if (!deviceId.trim()) {
      Alert.alert('Erreur de validation', 'L\'ID de l\'appareil est obligatoire');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Erreur de validation', 'Le numéro de téléphone est obligatoire');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Erreur de validation', 'Le mot de passe est obligatoire');
      return false;
    }
    if (isNaN(pointsEarned) || pointsEarned < 0) {
      Alert.alert('Erreur de validation', 'Les points accumulés doivent être un nombre positif');
      return false;
    }
    
    // Validate phone number only if it's provided
    if (phone && !/^\d{10}$/.test(phone)) {
      Alert.alert('Erreur', 'Le numéro de téléphone doit contenir exactement 10 chiffres.');
      return false;
    }
  
    // Add password validation only if it has been changed and is not empty
    if (password && password.trim() !== "") {
      const passwordd = password;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(passwordd)) {
        Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
        return false;
      }
    }
    return true;
  };

  const submitForm = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const userData = {
      firstName,
      lastName,
      deviceId,
      phone: parseInt(phone),
      password,
      points_earned: parseInt(pointsEarned),
      userType,
      activated,
      isLogin,
    };

    axios.post(`${BASE_URL}/api/users/driver/add`, userData)
      .then(response => {
        console.log('Utilisateur soumis :', response.data);
        Alert.alert('Succès', 'Le chauffeur a été ajouté avec succès !');
        setModalVisible(false);
        resetForm();
      })
      .catch(error => {
        console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
        Alert.alert('Erreur', 'Échec de l\'ajout du livreur. Veuillez réessayer.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setDeviceId('');
    setPhone('');
    setPassword('');
    setPointsEarned(0);
    setActivated(false);
    setIsLogin(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalView, { width: screenWidth - 20 }]}>
          <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close-circle" size={30} color="black" />
          </Pressable>

          <Text style={styles.modalTitle}>Ajouter un nouveau livreur</Text>

          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Entrez le prénom"
              />
            </View>

            <View>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Entrez le nom"
              />
            </View>

            <View>
              <Text style={styles.label}>ID de l'appareil</Text>
              <TextInput
                style={styles.input}
                value={deviceId}
                onChangeText={setDeviceId}
                placeholder="Entrez l'ID de l'appareil"
              />
            </View>

            <View>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Entrez le numéro de téléphone"
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Entrez le mot de passe"
                secureTextEntry={true}
              />
            </View>

            <View>
              <Text style={styles.label}>Points accumulés</Text>
              <TextInput
                style={styles.input}
                value={pointsEarned.toString()}
                onChangeText={setPointsEarned}
                placeholder="Entrez les points"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Activé</Text>
              <Switch thumbColor="#5A67D8" value={activated} onValueChange={setActivated} />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Connecté</Text>
              <Switch thumbColor="#5A67D8" value={isLogin} onValueChange={setIsLogin} />
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.submitButton} onPress={submitForm} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Soumettre le livreur</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 67, 90, 0.85)', // Transparent dark background
    paddingVertical: '20%',
  },
  modalView: {
    backgroundColor: '#38435a88', // Dark background for modal
    borderRadius: 12,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5A67D8', // Primary color for title
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E2E8F0', // Light grey for labels
    textAlign: 'left',
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5A67D8', // Primary border color
    marginBottom: 12,
    backgroundColor: '#38435A', // Dark background for input field
    color: '#FFFFFF', // White text for inputs
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#5A67D8', // Primary theme color for submit button
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowColor: '#000',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingBottom: 50,
  },
});

export default AddDriverModal;
