import React, { useState } from 'react';
import { View, Image, Text, TextInput, Modal, Pressable, ScrollView, Switch, TouchableOpacity, StyleSheet, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from './../services/firebaseConfig';
import * as FileSystem from 'expo-file-system';
import { BASE_URL } from '@env';

const AddServiceModal = ({ modalVisible, setModalVisible }) => {
  const [serviceName, setServiceName] = useState('');
  const [isSystemPoint, setIsSystemPoint] = useState(false);
  const [testService, setTestService] = useState(false);
  const [imageUrl, setImageUrl] = useState('');  // Store Firebase image URL
  const screenWidth = Dimensions.get('window').width;
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadButtonVisible, setUploadButtonVisible] = useState(false); // To control the visibility of the upload button

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageUrl(''); // Reset imageUrl when a new image is selected
      setUploadButtonVisible(true); // Show upload button when a new image is selected
    }
  };

  const uploadMedia = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image first.');
      return;
    }

    setUploading(true);

    try {
      const { uri } = await FileSystem.getInfoAsync(image);
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      const filename = image.substring(image.lastIndexOf('/') + 1);
      const ref = firebase.storage().ref().child(filename);

      await ref.put(blob);

      // Get the download URL of the uploaded image
      const downloadURL = await ref.getDownloadURL();

      setImageUrl(downloadURL);
      setUploading(false);
      setUploadButtonVisible(false); // Hide upload button after successful upload
      Alert.alert('Success', 'Photo uploaded successfully!');
    } catch (error) {
      console.error(error);
      setUploading(false);
      Alert.alert('Error', 'Failed to upload the image. Please try again.');
    }
  };

  const validateForm = () => {
    if (!serviceName.trim()) {
      Alert.alert('Validation Error', 'Service name is required.');
      return false;
    }
    if (!imageUrl) {
      Alert.alert('Validation Error', 'Image upload is required.');
      return false;
    }
    return true;
  };

  const submitForm = () => {
    if (!validateForm()) return;

    const serviceData = {
      name: serviceName,
      image: imageUrl,
      test: testService,
      isSystemPoint: isSystemPoint,
    };

    axios.post(`${BASE_URL}/api/services/`, serviceData)
      .then(response => {
        console.log('Service submitted:', response.data);
        setModalVisible(false);
        Alert.alert('Success', 'Service added successfully!');
        resetForm();
      })
      .catch(error => {
        console.error('Error submitting service:', error);
        Alert.alert('Error', 'Failed to add the service. Please try again.');
      });
  };

  const resetForm = () => {
    setServiceName('');
    setIsSystemPoint(false);
    setTestService(false);
    setImage(null);
    setImageUrl('');  // Reset imageUrl
    setUploadButtonVisible(false); // Reset upload button visibility
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

          <Text style={styles.modalTitle}>Add New Service</Text>

          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Service Name */}
            <View>
              <Text style={styles.label}>Service Name</Text>
              <TextInput
                style={styles.input}
                value={serviceName}
                onChangeText={setServiceName}
                placeholder="Enter service name"
              />
            </View>

            {/* Is System Point Switch */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Is System Point</Text>
              <Switch thumbColor={"#f3b13e"} value={isSystemPoint} onValueChange={setIsSystemPoint} />
            </View>

            {/* Test Service Switch */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Test Service</Text>
              <Switch thumbColor={"#f3b13e"} value={testService} onValueChange={setTestService} />
            </View>

            {/* Image Picker Section */}
            <Text style={styles.label}>Image</Text>
            {image ? (
              <View style={styles.imageWrapper}>
                {uploadButtonVisible && (
                  <TouchableOpacity style={styles.uploadButton} onPress={uploadMedia}>
                    {uploading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.uploadButtonText}>Upload</Text>
                    )}
                  </TouchableOpacity>
                )}
                <View style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.roundedImage} />
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => {
                      setImage(null);
                      setImageUrl(''); // Reset imageUrl when image is deleted
                      setUploadButtonVisible(false); // Ensure the upload button reappears when a new image is picked
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="#f3b13e" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
                <Ionicons name="cloud-upload-outline" size={50} color="black" />
                <Text style={styles.pickImageText}>SELECT A FILE</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={submitForm}>
            <Text style={styles.submitButtonText}>Submit Service</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Darker background
    paddingVertical: "20%",
  },
  modalView: {
    backgroundColor: '#2c2c2c', // Dark background for the modal view
    borderRadius: 10,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7, // Increased shadow opacity for more depth
    shadowRadius: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f695a', // White text color for better contrast
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dddddd', // Light gray for labels
    textAlign: 'left',
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444', // Darker border color
    marginBottom: 10,
    backgroundColor: '#3a3a3a', // Darker background for inputs
    color: '#ffffff', // White text for input fields
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickImageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#444', // Darker background for image picker button
    borderRadius: 10,
    marginBottom: 10,
  },
  pickImageText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff', // White text for image picker
  },
  imageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  roundedImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginLeft: 10,
    marginBottom: 10,
  },
  deleteImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  uploadButton: {
    backgroundColor: '#444', // Darker background for upload button
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555', // Slightly lighter border color for contrast
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowColor: '#000',
  },
  uploadButtonText: {
    color: '#ffffff', // White text for the upload button
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#f3b13e', // Keep the accent color for the submit button
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center',
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

export default AddServiceModal;
