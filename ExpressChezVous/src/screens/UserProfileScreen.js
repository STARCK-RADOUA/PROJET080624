import { BASE_URL, BASE_URLIO } from '@env';
import React, { useEffect, useState } from 'react';
import { View, Text, Image,TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import io from 'socket.io-client';
import Header from '../components/Header';
import useNotificationMenu from '../services/useNotificationMenu';
import NotificationMenu from '../components/NotificationMenu';
import { getClient , getUserDetails} from '../services/userService';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
const socket = io(`${BASE_URLIO}`);

const UserProfileScreen = ({ navigation }) => {
  const { isNotificationMenuVisible, slideAnim, toggleNotificationMenu } = useNotificationMenu();
  
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
      Alert.alert('Validation Error', 'Both first and last names are required.');
      return; // Stop the function if validation fails
    }
  
    if (editedFirstName.length < 2 || editedLastName.length < 2) {
      Alert.alert('Validation Error', 'Names must be at least 2 characters long.');
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
      Alert.alert('Success', 'Name changed successfully!');
      setNameModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to change name. Please try again.');
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
      Alert.alert('Validation Error', 'Password must be at least 8 characters long.');
      return;
    }
  
    if (!isPasswordMatch) {
      Alert.alert('Validation Error', 'Passwords do not match.');
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
  
      Alert.alert('Success', 'Password changed successfully!');
      setPasswordModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to change password.');
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
      Alert.alert('Validation Error', 'Please enter your current password.');
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
        Alert.alert('Success', 'Current password is correct.');
      } else {
        Alert.alert('Error', 'Current password is incorrect.');
      }
    } catch (err) {
      console.error('Error validating password:', err);
      Alert.alert('Error', 'Something went wrong with password validation.');
    } finally {
      setLoading(false); 
    }
  };
  
  const handlePhoneChange = async () => {
    if (!phoneNumber) {
      Alert.alert('Validation Error', 'Phone number is required.');
      return; // Stop the function if validation fails
    }
  
    const phoneNumberPattern = /^[0-9]{10}$/; // Example pattern for a 10-digit phone number
    if (!phoneNumberPattern.test(phoneNumber)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number.');
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
      Alert.alert('Success', 'Phone number changed successfully!');
      setPhoneModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to change phone number. Please try again.');
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

       
          <Text style={styles.userName}>{`${firstName} ${lastName}`}</Text>
          <TouchableOpacity 
  style={styles.iconButton} 
  onPress={() => setNameModalVisible(true)}>
  <MaterialIcons name="edit" size={24} color="#e9ab25" />
</TouchableOpacity>

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
  <Text style={styles.buttonText}>Change Password</Text>
</TouchableOpacity>

</View>

      {/* Modal for Changing Phone Number */}
      <Modal visible={isPhoneModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Change Phone Number</Text>
            <Text style={styles.modalTitle2}>Numerro de telephone</Text>

            <TextInput
             
                keyboardType="phone-pad"
              placeholder="Enter new phone number"
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
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Changing Password */}
      <Modal visible={isPasswordModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Change Password</Text>

            {showValidateSection && (
              <View >
              <Text style={styles.modalTitle2}>Votre Mot de pass </Text>

              <View style={styles.row}>

                <TextInput
                  placeholder="Current Password"
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
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.validateButtonText}>Validate</Text>}
                </TouchableOpacity>
              </View>
              </View>
            )}

            <Text style={styles.modalTitle2}>New mot de pass</Text>


            <TextInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                validatePasswords(text, confirmNewPassword);
              }}
              secureTextEntry
              style={styles.modalInput}
              editable={isCurrentPasswordValid}
            />
                  <Text style={styles.modalTitle2}>Confirmee le mot de pass</Text>

            <TextInput
              placeholder="Confirm New Password"
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
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Modal for Changing Name */}
<Modal visible={isNameModalVisible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Change Name</Text>
      <Text style={styles.modalTitle2}>Prenom</Text>

      <TextInput
        placeholder="First Name"
        value={editedFirstName}
        onChangeText={setEditedFirstName}
        style={styles.modalInput}
      />
            <Text style={styles.modalTitle2}>Nom</Text>

      <TextInput
        placeholder="Last Name"
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
        <Text style={styles.modalCloseText}>Cancel</Text>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  phoneNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A4A4A', // Darker color for futuristic look
    
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align the number and icon side by side
    width: '100%',
    marginBottom: 20,
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
    marginBottom: 20,
    padding: 50,

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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginTop: 10,
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
