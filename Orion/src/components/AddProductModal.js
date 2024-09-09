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
      setImageUrl(''); // Réinitialiser l'URL de l'image pour faire réapparaître le bouton de téléchargement
    }
  };

  const uploadMedia = async () => {
    if (!image) {
      Alert.alert('Erreur', 'Veuillez sélectionner une image d\'abord.');
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
      setImageUrl(downloadURL);

      setUploading(false);
      Alert.alert('Succès', 'Photo téléchargée avec succès!');
    } catch (error) {
      console.error(error);
      setUploading(false);
      Alert.alert('Erreur', 'Échec du téléchargement de l\'image. Veuillez réessayer.');
    }
  };

  useEffect(() => {
    axios.get(`${BASE_URL}/api/services`)
      .then(response => {
        setServiceTypeOptions(response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des types de service:', error);
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
      Alert.alert('Erreur de validation', 'Le nom du produit est requis.');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Erreur de validation', 'La description est requise.');
      return false;
    }
    if (!price || isNaN(price)) {
      Alert.alert('Erreur de validation', 'Un prix valide est requis.');
      return false;
    }
    if (!serviceType) {
      Alert.alert('Erreur de validation', 'Le type de service est requis.');
      return false;
    }
    if (!imageUrl) {
      Alert.alert('Erreur de validation', 'Le téléchargement de l\'image est requis.');
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
        console.log('Produit soumis:', response.data);
        setModalVisible(false);
        Alert.alert('Succès', 'Produit ajouté avec succès!');
        resetForm();
      })
      .catch(error => {
        console.error('Erreur lors de l\'ajout du produit:', error);
        Alert.alert('Erreur', 'Échec de l\'ajout du produit. Veuillez réessayer.');
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

          <Text style={styles.modalTitle}>Ajouter un nouveau produit</Text>

          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Nom du produit */}
            <View>
              <Text style={styles.label}>Nom du produit</Text>
              <TextInput
                style={styles.input}
                value={productName}
                onChangeText={setProductName}
                placeholder="Entrez le nom du produit"
              />
            </View>

            {/* Description du produit */}
            <View>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Entrez la description du produit"
              />
            </View>

            {/* Prix du produit */}
            <View>
              <Text style={styles.label}>Prix</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="Entrez le prix du produit"
                keyboardType="numeric"
              />
            </View>

            {/* Type de service */}
            <View>
              <Text style={styles.label}>Type de service</Text>
              <Picker
                selectedValue={serviceType}
                style={styles.input}
                onValueChange={(itemValue) => setServiceType(itemValue)}
              >
                <Picker.Item label="Sélectionnez le type de service" value="" />
                {serviceTypeOptions.map((option) => (
                  <Picker.Item key={option._id} label={option.name} value={option.name} />
                ))}
              </Picker>
            </View>

            {/* Produit actif */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Est actif</Text>
              <Switch thumbColor={"#f3b13e"} value={isActive} onValueChange={setIsActive} />
            </View>

            {/* Section des options */}
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
                  placeholder="Nom de l'option"
                />
                <TextInput
                  style={[styles.input, styles.optionInput]}
                  value={option.price}
                  onChangeText={(text) => {
                    const newOptions = [...options];
                    newOptions[index].price = text;
                    setOptions(newOptions);
                  }}
                  placeholder="Prix de l'option"
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

            {/* Sélecteur d'image */}
            <Text style={styles.label}>Image</Text>
            {image ? (
              <View style={styles.imageWrapper}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.roundedImage} />
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => {
                      setImage(null);
                      setImageUrl(''); // Réinitialiser l'URL de l'image pour faire réapparaître le bouton de téléchargement
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="#f3b13e" />
                  </TouchableOpacity>
                </View>
                {!uploading && !imageUrl && (
                  <TouchableOpacity style={styles.uploadButton} onPress={uploadMedia}>
                    <Text style={styles.uploadButtonText}>Télécharger</Text>
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
                <Text style={styles.pickImageText}>SÉLECTIONNER UN FICHIER</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Bouton de soumission */}
          <TouchableOpacity style={styles.submitButton} onPress={submitForm}>
            <Text style={styles.submitButtonText}>Soumettre le produit</Text>
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
    backgroundColor: '#8a8a8a50',
    paddingVertical: '20%',
  },
  modalView: {
    backgroundColor: '#333',
    borderRadius: 15,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1f695a',
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
    color: '#f0f0f0',
    textAlign: 'left',
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 10,
    backgroundColor: '#424242',
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#f0f0f0',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  optionInput: {
    width: '40%',
    backgroundColor: '#424242',
    color: '#fff',
    borderColor: '#333',
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
    backgroundColor: '#444343',
    borderRadius: 10,
    marginBottom: 10,
  },
  pickImageText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
    backgroundColor: '#f3b13e',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowColor: '#000',
  },
  uploadingButton: {
    backgroundColor: 'yellow',
  },
  uploadButtonText: {
    color: '#1e1e1e',
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
    color: '#1e1e1e',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingBottom: 50,
  },
});

export default AddProductModal;
