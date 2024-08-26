import { BASE_URL, BASE_URLIO } from '@env';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import io from 'socket.io-client';
import Header from '../components/Header';
import useNotificationMenu from '../services/useNotificationMenu';
import NotificationMenu from '../components/NotificationMenu';
import { getClient , getUserDetails} from '../services/userService';

const socket = io(`${BASE_URLIO}`);

const UserProfileScreen = ({ navigation }) => {
  const { isNotificationMenuVisible, slideAnim, toggleNotificationMenu } = useNotificationMenu();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneModalVisible, setPhoneModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password modal inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isPasswordMatch, setIsPasswordMatch] = useState(false);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false); 
  const [showValidateSection, setShowValidateSection] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getUserDetails();
      setPhoneNumber(user.phone);
    };
    fetchUserData();

   
  }, []);

  // Function to send userId and currentPassword to the backend for validation
  const handleCurrentPasswordValidation = async () => {
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
    const id = await getClient(); 

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/users/change-phone`, { phoneNumber , id });
      Alert.alert('Success', 'Phone number changed successfully!');
      setPhoneModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to change phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    const id = await getClient(); 

    setLoading(true);
    try {
      if (!isPasswordMatch) {
        throw new Error("Passwords do not match.");
      }

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

  return (
    <View style={styles.container}>
      <Header navigation={navigation} toggleNotificationMenu={toggleNotificationMenu} />
      {isNotificationMenuVisible && (
        <NotificationMenu slideAnim={slideAnim} toggleNotificationMenu={toggleNotificationMenu} socket={socket} />
      )}

      <View style={styles.profileContainer}>

        <View style={styles.row}>
         
          <Text style={styles.phoneNumber}>+212 {phoneNumber}</Text>

          <TouchableOpacity 
            style={styles.changeNumberButton} 
            onPress={() => setPhoneModalVisible(true)}>
            <Text style={styles.buttonText}>Change</Text>
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
            <TextInput
              inputMode="numeric"
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
            )}

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
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
            {isPasswordMatch && confirmNewPassword.length > 0 && (
              <Text style={styles.successText}>Passwords match</Text>
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
    marginBottom: 20,
    width: '70%',
    height: 40,
    paddingHorizontal: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  input: {
    
  },
  inputSmall: {
    width: '65%',
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  changeNumberButton: {
    backgroundColor: '#FFA500',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  changePasswordButton: {
    backgroundColor: '#FFA500',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
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
  modalInput: {
    width: '100%',
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#FFA500',
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
    color: '#FFA500',
    fontSize: 16,
  },
  validateButton: {
    backgroundColor: '#FFA500',
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
