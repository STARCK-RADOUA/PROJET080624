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
      Alert.alert('Validation Error', 'First Name is required');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Validation Error', 'Last Name is required');
      return false;
    }
    if (!deviceId.trim()) {
      Alert.alert('Validation Error', 'Device ID is required');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Phone number is required');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Password is required');
      return false;
    }
    if (isNaN(pointsEarned) || pointsEarned < 0) {
      Alert.alert('Validation Error', 'Points Earned must be a positive number');
      return false;
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
        console.log('User submitted:', response.data);
        Alert.alert('Success', 'User added successfully!');
        setModalVisible(false);
        resetForm();
      })
      .catch(error => {
        console.error('Error submitting user:', error);
        Alert.alert('Error', 'Failed to add the user. Please try again.');
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

          <Text style={styles.modalTitle}>Add New Driver</Text>

          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
              />
            </View>

            <View>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
              />
            </View>

            <View>
              <Text style={styles.label}>Device ID</Text>
              <TextInput
                style={styles.input}
                value={deviceId}
                onChangeText={setDeviceId}
                placeholder="Enter device ID"
              />
            </View>

            <View>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry={true}
              />
            </View>

            <View>
              <Text style={styles.label}>Points Earned</Text>
              <TextInput
                style={styles.input}
                value={pointsEarned.toString()}
                onChangeText={setPointsEarned}
                placeholder="Enter points"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Activated</Text>
              <Switch thumbColor="#f3b13e" value={activated} onValueChange={setActivated} />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Is Logged In</Text>
              <Switch thumbColor="#f3b13e" value={isLogin} onValueChange={setIsLogin} />
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.submitButton} onPress={submitForm} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Driver</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Darker background for modal container
    paddingVertical: "20%",
  },
  modalView: {
    backgroundColor: '#333', // Dark background for modal view
    borderRadius: 10,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7, // Increase shadow opacity for a more pronounced effect
    shadowRadius: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1f695a', // White text for modal title
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ddd', // Light gray color for labels
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555', // Darker border color for inputs
    marginBottom: 10,
    backgroundColor: '#444', // Darker background color for inputs
    color: '#fff', // White text for inputs
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#f3b13e',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center',
  },
  submitButtonText: {
    color: '#000', // Dark text for contrast with the submit button color
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingBottom: 50,
  },
});

export default AddDriverModal;
