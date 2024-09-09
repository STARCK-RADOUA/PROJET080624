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
  const [imageUrl, setImageUrl] = useState('');  // Stocker l'URL de l'image Firebase
  const screenWidth = Dimensions.get('window').width;
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadButtonVisible, setUploadButtonVisible] = useState(false); // Contrôler la visibilité du bouton de téléchargement

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageUrl(''); // Réinitialiser imageUrl lorsqu'une nouvelle image est sélectionnée
      setUploadButtonVisible(true); // Afficher le bouton de téléchargement après la sélection d'une image
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
          reject(new TypeError('Erreur de requête réseau'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      const filename = image.substring(image.lastIndexOf('/') + 1);
      const ref = firebase.storage().ref().child(filename);

      await ref.put(blob);

      // Obtenez l'URL de téléchargement de l'image
      const downloadURL = await ref.getDownloadURL();

      setImageUrl(downloadURL);
      setUploading(false);
      setUploadButtonVisible(false); // Masquer le bouton de téléchargement après succès
      Alert.alert('Succès', 'Photo téléchargée avec succès !');
    } catch (error) {
      console.error(error);
      setUploading(false);
      Alert.alert('Erreur', 'Le téléchargement de l\'image a échoué. Veuillez réessayer.');
    }
  };

  const validateForm = () => {
    if (!serviceName.trim()) {
      Alert.alert('Erreur de validation', 'Le nom du service est requis.');
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

    const serviceData = {
      name: serviceName,
      image: imageUrl,
      test: testService,
      isSystemPoint: isSystemPoint,
    };

    axios.post(`${BASE_URL}/api/services/`, serviceData)
      .then(response => {
        console.log('Service soumis:', response.data);
        setModalVisible(false);
        Alert.alert('Succès', 'Service ajouté avec succès !');
        resetForm();
      })
      .catch(error => {
        console.error('Erreur lors de la soumission du service:', error);
        Alert.alert('Erreur', 'L\'ajout du service a échoué. Veuillez réessayer.');
      });
  };

  const resetForm = () => {
    setServiceName('');
    setIsSystemPoint(false);
    setTestService(false);
    setImage(null);
    setImageUrl('');  // Réinitialiser imageUrl
    setUploadButtonVisible(false); // Réinitialiser la visibilité du bouton de téléchargement
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

          <Text style={styles.modalTitle}>Ajouter un nouveau service</Text>

          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Nom du service */}
            <View>
              <Text style={styles.label}>Nom du service</Text>
              <TextInput
                style={styles.input}
                value={serviceName}
                onChangeText={setServiceName}
                placeholder="Entrez le nom du service"
              />
            </View>

            {/* Point système */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Système du points</Text>
              <Switch thumbColor={"#f3b13e"} value={isSystemPoint} onValueChange={setIsSystemPoint} />
            </View>

            {/* Service de test */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Système du test</Text>
              <Switch thumbColor={"#f3b13e"} value={testService} onValueChange={setTestService} />
            </View>

            {/* Sélection d'image */}
            <Text style={styles.label}>Image</Text>
            {image ? (
              <View style={styles.imageWrapper}>
                {uploadButtonVisible && (
                  <TouchableOpacity style={styles.uploadButton} onPress={uploadMedia}>
                    {uploading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.uploadButtonText}>Télécharger</Text>
                    )}
                  </TouchableOpacity>
                )}
                <View style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.roundedImage} />
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => {
                      setImage(null);
                      setImageUrl(''); // Réinitialiser imageUrl lors de la suppression de l'image
                      setUploadButtonVisible(false); // Rendre le bouton de téléchargement visible à nouveau
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="#f3b13e" />
                  </TouchableOpacity>
                </View>
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
            <Text style={styles.submitButtonText}>Soumettre le service</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingVertical: "20%",
  },
  modalView: {
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f695a',
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
    color: '#dddddd',
    textAlign: 'left',
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 10,
    backgroundColor: '#3a3a3a',
    color: '#ffffff',
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
    backgroundColor: '#444',
    borderRadius: 10,
    marginBottom: 10,
  },
  pickImageText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
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
    backgroundColor: '#444',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555',
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowColor: '#000',
  },
  uploadButtonText: {
    color: '#ffffff',
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

export default AddServiceModal;
