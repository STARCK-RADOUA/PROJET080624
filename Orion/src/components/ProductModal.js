import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { firebase } from './../services/firebaseConfig';
import { BASE_URL } from '@env';

const ProductModal = ({ visible, onClose, product }) => {
  if (!product) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editableProduct, setEditableProduct] = useState({ ...product });
  const [serviceTypeOptions, setServiceTypeOptions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [image, setImage] = useState(editableProduct.image_url);
  const [uploading, setUploading] = useState(false);
  const [uploadButtonVisible, setUploadButtonVisible] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/services`)
      .then(response => {
        setServiceTypeOptions(response.data);
      })
      .catch(error => {
        console.error('Error fetching service types:', error);
      });
  }, []);

  useEffect(() => {
    setEditableProduct({ ...product });
    setImage(product.image_url);
  }, [product]);

  const handleInputChange = (field, value) => {
    setEditableProduct((prevProduct) => ({
      ...prevProduct,
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
      setIsEditing(true);
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
      handleInputChange('image_url', downloadURL);

      setUploading(false);
      setUploadButtonVisible(false);
      Alert.alert('Success', 'Photo uploaded successfully!');
    } catch (error) {
      console.error(error);
      setUploading(false);
      Alert.alert('Error', 'Failed to upload the image. Please try again.');
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const addOption = () => {
    setEditableProduct({
      ...editableProduct,
      options: [...editableProduct.options, { name: '', price: 0 }],
    });
  };

  const removeOption = (index) => {
    const updatedOptions = editableProduct.options.filter((_, i) => i !== index);
    setEditableProduct({
      ...editableProduct,
      options: updatedOptions,
    });
  };

  const validateForm = () => {
    if (!editableProduct.name.trim()) {
      setErrorMessage('Product name is required.');
      return false;
    }
    if (!editableProduct.description.trim()) {
      setErrorMessage('Product description is required.');
      return false;
    }
    if (!editableProduct.price || isNaN(editableProduct.price)) {
      setErrorMessage('Please enter a valid price.');
      return false;
    }
    if (!editableProduct.service_type) {
      setErrorMessage('Please select a service type.');
      return false;
    }
    if (!image) {
      Alert.alert('Validation Error', 'Image is required. Please upload an image.');
      return false;
    }
    return true;
  };

  const handleUpdateProduct = () => {
    if (!validateForm()) return;

    axios.put(`${BASE_URL}/api/products/update/${editableProduct._id}`, editableProduct)
      .then(response => {
        console.log('Product updated successfully:', response.data);
        setIsEditing(false);
        onClose();
      })
      .catch(error => {
        setErrorMessage('Failed to update product. Please try again.');
        console.error('Error updating product:', error);
      });
  };

  const handleDeleteProduct = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            axios.delete(`${BASE_URL}/api/products/delete/${editableProduct._id}`)
              .then(response => {
                console.log('Product deleted:', response.data);
                onClose();
                Alert.alert('Success', 'Product deleted successfully!');
              })
              .catch(error => {
                console.error('Error deleting product:', error);
                Alert.alert('Error', 'Failed to delete product. Please try again.');
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
            <Ionicons name="close-circle" size={30} color="#fff" />
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.productImage} />
            ) : (
              <View style={[styles.productImage, styles.imagePlaceholder]}>
                <Ionicons name="image-outline" size={50} color="#ccc" />
              </View>
            )}
            <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
              <Ionicons name="camera-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {uploadButtonVisible && (
            <TouchableOpacity style={styles.uploadButton} onPress={uploadMedia}>
              {uploading ? (
                <ActivityIndicator size="small" color="#ffbf00" />
              ) : (
                <Text style={styles.uploadButtonText}>Upload</Text>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.fieldRow}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editableProduct.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Product Name"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.name}>{editableProduct.name}</Text>
            )}
            <TouchableOpacity onPress={toggleEdit}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.fieldRow}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editableProduct.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Product Description"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.description}>{editableProduct.description}</Text>
            )}
            <TouchableOpacity onPress={toggleEdit}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.fieldRow}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={String(editableProduct.price)}
                onChangeText={(value) => handleInputChange('price', value)}
                keyboardType="numeric"
                placeholder="Product Price"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.price}>${editableProduct.price ? parseFloat(editableProduct.price).toFixed(2) : '0.00'}</Text>
            )}
            <TouchableOpacity onPress={toggleEdit}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.fieldRow}>
            {isEditing ? (
              <Picker
                selectedValue={editableProduct.service_type}
                style={styles.editInput}
                onValueChange={(itemValue) => handleInputChange('service_type', itemValue)}
              >
                {serviceTypeOptions.map((option) => (
                  <Picker.Item key={option._id} label={option.name} value={option.name} />
                ))}
              </Picker>
            ) : (
              <Text style={styles.serviceType}>Service Type: {editableProduct.service_type}</Text>
            )}
            <TouchableOpacity onPress={toggleEdit}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Options:</Text>
            {editableProduct.options.length > 0 ? (
              editableProduct.options.map((option, index) => (
                <View key={index} style={styles.optionRow}>
                  {isEditing ? (
                    <>
                      <TextInput
                        style={styles.optionName}
                        value={option.name}
                        onChangeText={(value) =>
                          handleInputChange('options', [
                            ...editableProduct.options.slice(0, index),
                            { ...option, name: value },
                            ...editableProduct.options.slice(index + 1),
                          ])
                        }
                        placeholder="Option Name"
                        placeholderTextColor="#999"
                      />
                      <TextInput
                        style={styles.optionPrice}
                        value={String(option.price)}
                        onChangeText={(value) =>
                          handleInputChange('options', [
                            ...editableProduct.options.slice(0, index),
                            { ...option, price: parseFloat(value) },
                            ...editableProduct.options.slice(index + 1),
                          ])
                        }
                        keyboardType="numeric"
                        placeholder="Option Price"
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity onPress={() => removeOption(index)}>
                        <Ionicons name="remove-circle" size={24} color="#C7253E" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={styles.optionName}>{option.name}</Text>
                      <Text style={styles.optionPrice}>+${option.price ? parseFloat(option.price).toFixed(2) : '0.00'}</Text>
                    </>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noOptionsText}>No options available</Text>
            )}

            {isEditing && (
              <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
                <Ionicons name="add-circle" size={30} color="#ffbf00" />
              </TouchableOpacity>
            )}
          </View>

          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}

          {isEditing && (
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdateProduct}
            >
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProduct}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
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
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#444',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#ffbf00',
    padding: 5,
    borderRadius: 20,
  },
  uploadButton: {
    backgroundColor: '#555',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#666',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#ffbf00',
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
    borderBottomColor: '#777',
    width: '85%',
    fontSize: 16,
    paddingVertical: 5,
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#ffbf00',
  },
  description: {
    fontSize: 16,
    marginTop: 5,
    color: '#bbb',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffbf00',
    marginTop: 10,
  },
  serviceType: {
    fontSize: 16,
    color: '#bbb',
    marginTop: 5,
  },
  optionsContainer: {
    marginTop: 20,
    width: '100%',
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffbf00',
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionName: {
    fontSize: 16,
    color: '#fff',
    width: '40%',
  },
  optionPrice: {
    fontSize: 16,
    color: '#ffbf00',
    width: '30%',
  },
  addOptionButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  noOptionsText: {
    color: '#888',
    fontSize: 14,
  },
  updateButton: {
    backgroundColor: '#ffbf00',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  updateButtonText: {
    color: '#333',
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
  errorMessage: {
    color: '#C7253E',
    marginTop: 10,
    fontSize: 14,
  },
});

export default ProductModal;
