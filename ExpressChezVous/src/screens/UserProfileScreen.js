import { BASE_URL, BASE_URLIO } from '@env';
import React, { useEffect, useState } from 'react';
import { View, Text, Image,TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Header from '../components/Header';
import { getClient , getUserDetails} from '../services/userService';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const UserProfileScreen = ({ navigation }) => {
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isPhoneModalVisible, setPhoneModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [isNameModalVisible, setNameModalVisible] = useState(false);

  // Password modal inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isPasswordMatch, setIsPasswordMatch] = useState(false);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false); 
  const [showValidateSection, setShowValidateSection] = useState(true);

  const handleNameChange = async () => {
    if (!editedFirstName || !editedLastName) {
      Alert.alert('Erreur de Validation', 'Le prénom et le nom de famille sont tous deux requis.');
      return; // Stop the function if validation fails
    }
  
    if (editedFirstName.length < 2 || editedLastName.length < 2) {
      Alert.alert('Erreur de Validation', 'Les noms doivent comporter au moins 2 caractères.');
      return;
    }
  
    const id = await getClient(); 
    setLoading(true);
    console.log("Client ID:", id);
  
    try {
      await axios.post(`${BASE_URL}/api/users/change-name`, {
        id,
        firstName: editedFirstName.trim(),
        lastName: editedLastName.trim(),
      });
      setFirstName(editedFirstName);
      setLastName(editedLastName);
      Alert.alert('Succès', 'Le nom a été modifié avec succès !');
      setNameModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la modification du nom. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getUserDetails();
      setPhoneNumber(user.phone);
      setFirstName(user.firstName);
      setLastName(user.lastName);


    };
    fetchUserData();

   
  }, []);

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Erreur de Validation', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
  
    if (!isPasswordMatch) {
      Alert.alert('Erreur de Validation', 'Les mots de passe ne correspondent pas.');
      return;
    }
  
    const id = await getClient(); 
    setLoading(true);
  
    try {
      console.log('Password:', newPassword);
      console.log('Client ID:', id);
  
      const response = await axios.post(`${BASE_URL}/api/users/change-password`, {
        id,
        newPassword,
      });
  
      Alert.alert('Succès', 'Le mot de passe a été modifié avec succès !');
      setPasswordModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Échec de la modification du mot de passe.');
    } finally {
      setLoading(false);
    }
  };
  
  const validatePasswords = (newPass, confirmPass) => {
    if (newPass && confirmPass && newPass === confirmPass) {
      setIsPasswordMatch(true);
    } else {
      setIsPasswordMatch(false);
    }
  };
  

  
  const handleCurrentPasswordValidation = async () => {
    if (!currentPassword) {
      Alert.alert('Erreur de Validation', 'Veuillez entrer votre mot de passe actuel.');
      return;
    }
  
    setLoading(true); 
  
    try {
      const id = await getClient(); 
      const response = await axios.post(`${BASE_URL}/api/users/validate-password`, {
        id,
        currentPassword
      });
  
      if (response.data.isValid) {
        setIsCurrentPasswordValid(true); 
        setShowValidateSection(false); 
        Alert.alert('Succès', 'Le mot de passe actuel est correct.');
      } else {
        Alert.alert('Erreur', 'Le mot de passe actuel est incorrect.');
      }
    } catch (err) {
      console.error('Error validating password:', err);
      Alert.alert('Erreur', 'Un problème est survenu lors de la validation du mot de passe.');
    } finally {
      setLoading(false); 
    }
  };
  
  const handlePhoneChange = async () => {
    if (!phoneNumber) {
      Alert.alert('Erreur de Validation', 'Le numéro de téléphone est requis.');
      return; // Stop the function if validation fails
    }
  
    const phoneNumberPattern =  /^(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}$/; // Example pattern for a 10-digit phone number
    if (!phoneNumberPattern.test(phoneNumber)) {
      Alert.alert('Erreur de Validation', 'Veuillez entrer un numéro de téléphone valide de 10 chiffres.');
      return; // Stop the function if validation fails
    }
  
    const id = await getClient();
    console.log("Client ID:", id);
  
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/users/change-phone`, {
        phoneNumber: phoneNumber.trim(), // Trim any spaces
        id
      });
      Alert.alert('Succès', 'Numéro de téléphone modifié avec succès !');
      setPhoneModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la modification du numéro de téléphone. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
 

  return (
    <View style={styles.container}>
        <Header navigation={navigation} />

    
<View style={styles.profileContainer}>
<View style={styles.profileWrapper}>
          <View style={styles.profileImageContainer}>
            <Image
                source={require('../assets/images/8498789.png')}
              style={styles.profileImage}
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" /> 
            </View>
          </View>

          <View style={styles.horizontalLayout}>

          <Text style={styles.userName}>{`${firstName} ${lastName}`}</Text>
          <TouchableOpacity 
  style={styles.iconButton} 
  onPress={() => setNameModalVisible(true)}>
  <MaterialIcons name="edit" size={24} color="#e9ab25" />
</TouchableOpacity>
          </View>

          </View>

<View style={styles.row}>
  <Text style={styles.phoneNumber}>+33 {phoneNumber}</Text>
  
  <TouchableOpacity 
    style={styles.iconButton} 
    onPress={() => setPhoneModalVisible(true)}>
    <MaterialIcons name="edit" size={24} color="#e9ab25" />
  </TouchableOpacity>
</View>

<TouchableOpacity 
  style={styles.changePasswordButton} 
  onPress={() => setPasswordModalVisible(true)}>
  <Text style={styles.buttonText}>Mot de Passe</Text>
</TouchableOpacity>

</View>

      {/* Modal for Changing Phone Number */}
      <Modal visible={isPhoneModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Changer le numéro de téléphone</Text>
            <Text style={styles.modalTitle2}>Numéro de téléphone</Text>

            <TextInput
             
                keyboardType="phone-pad"
              placeholder="Saisir un nouveau numéro de téléphone"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.modalInput}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handlePhoneChange}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>OK</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPhoneModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Changing Password */}
      <Modal visible={isPasswordModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Changer le mot de passe</Text>

            {showValidateSection && (
              <View >
              <Text style={styles.modalTitle2}>Votre Mot de pass </Text>

              <View style={styles.row}>

                <TextInput
                  placeholder="Mot de passe actuel"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  style={styles.inputSmall}
                />
                <TouchableOpacity
                  style={styles.validateButton}
                  onPress={handleCurrentPasswordValidation}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.validateButtonText}>Valider</Text>}
                </TouchableOpacity>
              </View>
              </View>
            )}

            <Text style={styles.modalTitle2}>Nouveau mot de passe</Text>


            <TextInput
              placeholder="Créer un nouveau mot de passe"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                validatePasswords(text, confirmNewPassword);
              }}
              secureTextEntry
              style={styles.modalInput}
              editable={isCurrentPasswordValid}
            />
                  <Text style={styles.modalTitle2}>Confirmer le mot de pass</Text>

            <TextInput
              placeholder="Confirmer le nouveau mot de passe"
              value={confirmNewPassword}
              onChangeText={(text) => {
                setConfirmNewPassword(text);
                validatePasswords(newPassword, text);
              }}
              secureTextEntry
              style={styles.modalInput}
              editable={isCurrentPasswordValid}
            />

            {!isPasswordMatch && confirmNewPassword.length > 0 && (
              <Text style={styles.errorText}>Mot de pass incorect</Text>
            )}
            {isPasswordMatch && confirmNewPassword.length > 0 && (
              <Text style={styles.successText}>Mot de pass incorect</Text>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handlePasswordChange}
              disabled={!isPasswordMatch || loading || !isCurrentPasswordValid}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>OK</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPasswordModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Modal for Changing Name */}
<Modal visible={isNameModalVisible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Changer de nom</Text>
      <Text style={styles.modalTitle2}>Prenom</Text>

      <TextInput
        placeholder="Prenom"
        value={editedFirstName}
        onChangeText={setEditedFirstName}
        style={styles.modalInput}
      />
            <Text style={styles.modalTitle2}>Nom</Text>

      <TextInput
        placeholder="Nom"
        value={editedLastName}
        onChangeText={setEditedLastName}
        style={styles.modalInput}
      />
      <TouchableOpacity
        style={styles.modalButton}
        onPress={handleNameChange}
        disabled={loading}
      >

        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>OK</Text>}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.modalCloseButton}
        onPress={() => setNameModalVisible(false)}
      >
        <Text style={styles.modalCloseText}>Annuler</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  phoneNumber: {
    fontSize: 24,
    alignContent:"flex-start",
    fontWeight: 'bold',
    color: '#4A4A4A', // Darker color for futuristic look
    
    flex: 1,
  },
  horizontalLayout: {
    flexDirection: 'row',  // Horizontal layout
    alignItems: 'center',
    justifyContent: 'space-between',  // Ensure spacing between elements
    width: '100%',  // Full width layout
  },
  row: {
    flexDirection: 'row',  // Horizontal layout
    alignItems: 'center',
    justifyContent: 'space-between', // Align the number and icon side by side
    width: '100%',
  },
  iconButton: {
    backgroundColor: '#E0F7FA', // Light futuristic color
    padding: 10,
    borderRadius: 50,
    marginLeft: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    
  },
  profileWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,

  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#e9ab25',
    borderWidth: 3,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 2,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
    fontWeight: 'bold',
    color: '#e9ab25',
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  inputSmall: {
    width: '65%',
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  changeNumberButton: {
    backgroundColor: '#e9ab25',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  changePasswordButton: {
    backgroundColor: '#e9ab25', // Modern blue color
    borderRadius: 30, // Rounder button for a more modern look
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5, // Add shadow to enhance the button
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600', // Slightly bolder text for modern feel
    letterSpacing: 1.2,
    fontWeight: 'bold',
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
   modalTitle2: {
    fontSize: 15,
    fontWeight: 'bold',
    alignContent: "flex-start"
  },
  modalInput: {
    width: '100%',
    color: '#161313',
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#e9ab25',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 10,
  },
  modalCloseText: {
    color: '#e9ab25',
    fontSize: 16,
  },
  validateButton: {
    backgroundColor: '#e9ab25',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  validateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  successText: {
    color: 'green',
    marginBottom: 10,
  },
});

export default UserProfileScreen;
