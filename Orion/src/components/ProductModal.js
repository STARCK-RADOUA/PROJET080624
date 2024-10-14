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
        console.error('Erreur lors de la récupération des types de service:', error);
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
          reject(new TypeError('Échec de la requête réseau'));
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
      Alert.alert('Succès', 'Photo téléchargée avec succès!');
    } catch (error) {
      console.error(error);
      setUploading(false);
      Alert.alert('Erreur', 'Échec du téléchargement de l\'image. Veuillez réessayer.');
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
      setErrorMessage('Le nom du produit est requis.');
      return false;
    }
    if (!editableProduct.description.trim()) {
      setErrorMessage('La description du produit est requise.');
      return false;
    }
    if (!editableProduct.price || isNaN(editableProduct.price)) {
      setErrorMessage('Veuillez entrer un prix valide.');
      return false;
    }
    if (!editableProduct.service_type) {
      setErrorMessage('Veuillez sélectionner un type de service.');
      return false;
    }
    if (!image) {
      Alert.alert('Erreur de validation', 'L\'image est requise. Veuillez télécharger une image.');
      return false;
    }
    return true;
  };

  const handleUpdateProduct = () => {
    if (!validateForm()) return;

    axios.put(`${BASE_URL}/api/products/update/${editableProduct._id}`, editableProduct)
      .then(response => {
        console.log('Produit mis à jour avec succès:', response.data);
        setIsEditing(false);
        onClose();
      })
      .catch(error => {
        setErrorMessage('Échec de la mise à jour du produit. Veuillez réessayer.');
        console.error('Erreur lors de la mise à jour du produit:', error);
      });
  };

  const handleDeleteProduct = () => {
    Alert.alert(
      'Supprimer le produit',
      'Êtes-vous sûr de vouloir supprimer ce produit?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: () => {
            axios.delete(`${BASE_URL}/api/products/delete/${editableProduct._id}`)
              .then(response => {
                console.log('Produit supprimé:', response.data);
                onClose();
                Alert.alert('Succès', 'Produit supprimé avec succès!');
              })
              .catch(error => {
                console.error('Erreur lors de la suppression du produit:', error);
                Alert.alert('Erreur', 'Échec de la suppression du produit. Veuillez réessayer.');
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
                <Text style={styles.uploadButtonText}>Télécharger</Text>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.fieldRow}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editableProduct.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Nom du produit"
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
                placeholder="Description du produit"
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
                placeholder="Prix du produit"
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
              <Text style={styles.serviceType}>Type de service: {editableProduct.service_type}</Text>
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
                        placeholder="Nom de l'option"
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
                        placeholder="Prix de l'option"
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
              <Text style={styles.noOptionsText}>Aucune option disponible</Text>
            )}

            {isEditing && (
              <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
                <Ionicons name="add-circle" size={30} color="#5A67D8" />
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
              <Text style={styles.updateButtonText}>Mettre à jour</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProduct}>
            <Text style={styles.deleteButtonText}>Supprimer</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Dark overlay for modal background
  },
  modalView: {
    width: '90%',
    backgroundColor: '#38435a88', // Dark grey background for the modal
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5, // Elevation to make the modal appear raised
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // Circular image for the product
    backgroundColor: '#2D3748', // Dark grey background for placeholder
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#5A67D8', // Bright yellow for camera icon background
    padding: 8,
    borderRadius: 20,
  },
  uploadButton: {
    backgroundColor: '#4a55689e', // Medium grey for upload button
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#5A67D8', // Bright yellow text for upload button
    fontSize: 14,
    fontWeight: '500',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  editInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#777', // Light grey border for editable inputs
    width: '85%',
    fontSize: 16,
    paddingVertical: 5,
    color: '#FFF', // White text color
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5A67D8', // Bright yellow for the product name
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#A0AEC0', // Light grey for the description text
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5A67D8', // Bright yellow for price
  },
  serviceType: {
    fontSize: 16,
    color: '#A0AEC0', // Light grey for service type text
  },
  optionsContainer: {
    width: '100%',
    marginTop: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5A67D8', // Bright yellow for options title
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
    color: '#FFF', // White text for option name
    width: '40%',
  },
  optionPrice: {
    fontSize: 16,
    color: '#5A67D8', // Bright yellow for option price
    width: '30%',
  },
  addOptionButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  noOptionsText: {
    color: '#A0AEC0', // Light grey for no options text
    fontSize: 14,
  },
  updateButton: {
    backgroundColor: '#5A67D8', // Bright yellow for the update button
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  updateButtonText: {
    color: '#1A202C', // Dark text for the button
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#C7253E', // Bright red for delete button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFF', // White text for delete button
    fontWeight: '600',
    fontSize: 16,
  },
  errorMessage: {
    color: '#C7253E', // Bright red for error messages
    marginTop: 10,
    fontSize: 14,
  },
});


export default ProductModal;
