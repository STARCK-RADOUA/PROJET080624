import React, { useState, useEffect } from 'react';
import { Modal, View, Switch, Text, Image, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { firebase } from './../services/firebaseConfig';
import { BASE_URL } from '@env';

const ServiceModal = ({ visible, onClose, service }) => {
  if (!service) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editableService, setEditableService] = useState({ ...service });
  const [image, setImage] = useState(editableService.image);
  const [uploading, setUploading] = useState(false);
  const [uploadButtonVisible, setUploadButtonVisible] = useState(false);

  useEffect(() => {
    setEditableService({ ...service });
    setImage(service.image);  // Set the initial image URL
  }, [service]);

  const handleInputChange = (field, value) => {
    setEditableService((prevService) => ({
      ...prevService,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setUploadButtonVisible(true);
    }
  };

  const uploadMedia = async () => {
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

      const downloadURL = await ref.getDownloadURL();
      setImage(downloadURL);
      handleInputChange('image', downloadURL);

      setUploading(false);
      setUploadButtonVisible(false);
      Alert.alert('Photo Uploaded!!!');
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdateService = () => {
    axios.put(`${BASE_URL}/api/services/update/${editableService._id}`, editableService)
      .then(response => {
        console.log('Service updated successfully:', response.data);
        setIsEditing(false);
        onClose();
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to update service. Please try again.');
        console.error('Error updating service:', error);
      });
  };

  const handleDeleteService = () => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            axios.delete(`${BASE_URL}/api/services/delete/${editableService._id}`)
              .then(response => {
                console.log('Service deleted:', response.data);
                onClose();
                Alert.alert('Success', 'Service deleted successfully!');
              })
              .catch(error => {
                console.error('Error deleting service:', error);
                Alert.alert('Error', 'Failed to delete service. Please try again.');
              });
          },
        },
      ],
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={30} color="black" />
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.serviceImage} />
            ) : (
              <View style={[styles.serviceImage, styles.imagePlaceholder]}>
                <Ionicons name="image-outline" size={50} color="#ccc" />
              </View>
            )}
            <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
              <Ionicons name="camera-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {uploadButtonVisible && (
            <TouchableOpacity style={styles.uploadButton} onPress={uploadMedia}>
              {uploading ? (
                <ActivityIndicator size="small" color="yellow" />
              ) : (
                <Text style={styles.uploadButtonText}>Upload</Text>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.fieldRow}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editableService.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
            ) : (
              <Text style={styles.name}>{editableService.name}</Text>
            )}
            <TouchableOpacity onPress={toggleEdit}>
              <Ionicons name="create-outline" size={20} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>System Point:</Text>
            {isEditing ? (
              <Switch
                value={editableService.isSystemPoint}
                onValueChange={(value) => handleInputChange('isSystemPoint', value)}
                thumbColor={"#f3b13e"}
              />
            ) : (
              <Text style={styles.textValue}>{editableService.isSystemPoint ? 'Yes' : 'No'}</Text>
            )}
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Test Service:</Text>
            {isEditing ? (
              <Switch
                value={editableService.test}
                onValueChange={(value) => handleInputChange('test', value)}
                thumbColor={"#f3b13e"}
              />
            ) : (
              <Text style={styles.textValue}>{editableService.test ? 'Yes' : 'No'}</Text>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdateService}
            >
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteService}>
            <Text style={styles.deleteButtonText}>Delete</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#f3b13e',
    padding: 5,
    borderRadius: 20,
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  editInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '85%',
    fontSize: 16,
    paddingVertical: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  textValue: {
    fontSize: 16,
    color: '#555',
  },
  updateButton: {
    backgroundColor: '#f3b13e',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  updateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#C7253E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ServiceModal;
