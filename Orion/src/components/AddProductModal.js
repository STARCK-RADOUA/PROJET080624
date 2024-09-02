import React, { useState, useEffect } from 'react';
import { View, Image, Text, TextInput, Modal, Pressable, ScrollView, Switch, TouchableOpacity, StyleSheet, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from './../services/firebaseConfig';
import * as FileSystem from 'expo-file-system';
import { BASE_URL } from '@env';

const AddProductModal = ({ modalVisible, setModalVisible }) => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [serviceTypeOptions, setServiceTypeOptions] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [options, setOptions] = useState([{ name: '', price: '' }]);
  const [imageUrl, setImageUrl] = useState('');
  const screenWidth = Dimensions.get('window').width;
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageUrl(''); // Reset the imageUrl so that the upload button reappears
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

      const downloadURL = await ref.getDownloadURL();
      setImageUrl(downloadURL);

      setUploading(false);
      Alert.alert('Success', 'Photo uploaded successfully!');
    } catch (error) {
      console.error(error);
      setUploading(false);
      Alert.alert('Error', 'Failed to upload the image. Please try again.');
    }
  };

  useEffect(() => {
    axios.get(`${BASE_URL}/api/services`)
      .then(response => {
        setServiceTypeOptions(response.data);
      })
      .catch(error => {
        console.error('Error fetching service types:', error);
      });
  }, []);

  const addOption = () => {
    setOptions([...options, { name: '', price: '' }]);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const validateForm = () => {
    if (!productName.trim()) {
      Alert.alert('Validation Error', 'Product name is required.');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Description is required.');
      return false;
    }
    if (!price || isNaN(price)) {
      Alert.alert('Validation Error', 'Valid price is required.');
      return false;
    }
    if (!serviceType) {
      Alert.alert('Validation Error', 'Service type is required.');
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

    const productData = {
      name: productName,
      description,
      price: parseFloat(price),
      image_url: imageUrl,
      service_type: serviceType,
      is_active: isActive,
      options: options.filter(option => option.name && option.price),
    };

    axios.post(`${BASE_URL}/api/products/add`, productData)
      .then(response => {
        console.log('Product submitted:', response.data);
        setModalVisible(false);
        Alert.alert('Success', 'Product added successfully!');
        resetForm();
      })
      .catch(error => {
        console.error('Error submitting product:', error);
        Alert.alert('Error', 'Failed to add the product. Please try again.');
      });
  };

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setPrice('');
    setServiceType('');
    setIsActive(true);
    setOptions([{ name: '', price: '' }]);
    setImage(null);
    setImageUrl('');
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

          <Text style={styles.modalTitle}>Add New Product</Text>

          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Product Name */}
            <View>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                value={productName}
                onChangeText={setProductName}
                placeholder="Enter product name"
              />
            </View>

            {/* Product Description */}
            <View>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter product description"
              />
            </View>

            {/* Product Price */}
            <View>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="Enter product price"
                keyboardType="numeric"
              />
            </View>

            {/* Service Type Dropdown */}
            <View>
              <Text style={styles.label}>Service Type</Text>
              <Picker
                selectedValue={serviceType}
                style={styles.input}
                onValueChange={(itemValue) => setServiceType(itemValue)}
              >
                <Picker.Item label="Select service type" value="" />
                {serviceTypeOptions.map((option) => (
                  <Picker.Item key={option._id} label={option.name} value={option.name} />
                ))}
              </Picker>
            </View>

            {/* Is Active Switch */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Is Active</Text>
              <Switch thumbColor={"#f3b13e"} value={isActive} onValueChange={setIsActive} />
            </View>

            {/* Options Section */}
            <Text style={styles.optionsTitle}>Options</Text>
            {options.map((option, index) => (
              <View key={index} style={styles.optionContainer}>
                <TextInput
                  style={[styles.input, styles.optionInput]}
                  value={option.name}
                  onChangeText={(text) => {
                    const newOptions = [...options];
                    newOptions[index].name = text;
                    setOptions(newOptions);
                  }}
                  placeholder="Option name"
                />
                <TextInput
                  style={[styles.input, styles.optionInput]}
                  value={option.price}
                  onChangeText={(text) => {
                    const newOptions = [...options];
                    newOptions[index].price = text;
                    setOptions(newOptions);
                  }}
                  placeholder="Option price"
                  keyboardType="numeric"
                />
                {index === options.length - 1 ? (
                  <TouchableOpacity onPress={addOption} style={styles.addOptionButton}>
                    <Ionicons name="add-circle" size={30} color="black" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => removeOption(index)} style={styles.removeOptionButton}>
                    <Ionicons name="remove-circle" size={30} color="#f3b13e" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Image Picker Section */}
            <Text style={styles.label}>Image</Text>
            {image ? (
              <View style={styles.imageWrapper}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.roundedImage} />
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => {
                      setImage(null);
                      setImageUrl(''); // Reset the imageUrl so the upload button reappears
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="#f3b13e" />
                  </TouchableOpacity>
                </View>
                {!uploading && !imageUrl && (
                  <TouchableOpacity style={styles.uploadButton} onPress={uploadMedia}>
                    <Text style={styles.uploadButtonText}>Upload</Text>
                  </TouchableOpacity>
                )}
                {uploading && (
                  <View style={[styles.uploadButton, styles.uploadingButton]}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
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
            <Text style={styles.submitButtonText}>Submit Product</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Increase opacity
    paddingVertical : "20%"
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    textAlign: 'left',
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 10,
    backgroundColor: '#f9fafb',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  optionInput: {
    width: '40%',
  },
  addOptionButton: {
    marginLeft: 10,
    padding: 0,
    backgroundColor: 'transparent',
  },
  removeOptionButton: {
    marginLeft: 10,
  },
  pickImageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    marginBottom: 10,
  },
  pickImageText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageWrapper: {
    flexDirection: 'row', // Layout image and button in row
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
    marginLeft: 10, // Add space between upload button and image
    marginBottom: 10,
  },
  deleteImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  uploadButton: {
    backgroundColor: '#f3b13e',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 20, // Align button to the right of the image
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowColor: '#000',
  },
  uploadingButton: {
    backgroundColor: 'yellow',
  },
  uploadButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#f3b13e',
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

export default AddProductModal;
