import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Linking,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '@env';
import io from 'socket.io-client';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const socket = io(BASE_URL);

const DriverModal = ({ visible, onClose, driver }) => {
  // Initialize hooks at the top level
  const [editableDriver, setEditableDriver] = useState(driver ? { ...driver } : null);
  const [location, setLocation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDisponible, setDisponible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    if (driver) {
      const updatedDriver = { ...driver, password: ' ' };
      setEditableDriver(updatedDriver);
      socket.emit('locationUpdateForAdminRequest', { deviceId: driver.deviceId });

      socket.on('locationUpdateForAdmin', ({ deviceId, latitude, longitude, isConnected, isDisponible }) => {
        if (deviceId === driver.deviceId) {
          setLocation({ latitude, longitude });
          setIsConnected(isConnected);
          setDisponible(isDisponible);
        }
      });

      return () => {
        socket.off('locationUpdateForAdmin');
      };
    } else {
      setEditableDriver(null);
    }
  }, [driver]);

  const fetchHistory = async () => {
    if (!driver) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/history/${driver._id}`);
      setHistoryData(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de l’historique:', error);
    }
  };

  // Handle the case where editableDriver is null
  if (!editableDriver) return null;

  const openInWaze = (location) => {
    const [latitude, longitude] = location.split(' ');
    const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    Linking.openURL(wazeUrl);
  };

  const handleDeleteDriver = () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer ce conducteur ?',
      [
        {
          text: 'Annuler',
          onPress: () => console.log('Suppression annulée'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const response = await axios.put(`${BASE_URL}/api/driver/delete/${editableDriver._id}`);
              if (response.status === 200) {
                Alert.alert('Succès', 'Conducteur supprimé avec succès.');
                onClose();
              }
            } catch (error) {
              console.error('Erreur lors de la suppression du conducteur:', error);
              Alert.alert('Erreur', 'Échec de la suppression du conducteur. Veuillez réessayer.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleActivateDeactivate = (isActive) => {
    try {
      setEditableDriver((prevDriver) => ({
        ...prevDriver,
        activated: isActive,
      }));

      socket.emit('adminActivateDeactivateDriver', {
        driverId: editableDriver._id,
        isActive,
        deviceId: editableDriver.deviceId,
      });

      Alert.alert('Succès', `Conducteur ${isActive ? 'activé' : 'désactivé'} avec succès.`);
    } catch (error) {
      console.error('Erreur lors de l’activation/désactivation du conducteur:', error);
      Alert.alert('Erreur', 'Échec de la mise à jour du statut. Veuillez réessayer.');
      setEditableDriver((prevDriver) => ({
        ...prevDriver,
        activated: !isActive,
      }));
    }
  };

  const handleToggleLoginStatus = () => {
    try {
      const newLoginStatus = !editableDriver.isLogin;
      setEditableDriver((prevDriver) => ({
        ...prevDriver,
        isLogin: newLoginStatus,
      }));

      socket.emit('adminToggleDriverLoginStatus', { driverId: editableDriver._id });

      Alert.alert('Succès', `Statut de connexion ${newLoginStatus ? 'activé' : 'désactivé'} avec succès.`);
    } catch (error) {
      console.error('Erreur lors du changement du statut de connexion:', error);
      Alert.alert('Erreur', 'Échec de la mise à jour du statut de connexion. Veuillez réessayer.');
      setEditableDriver((prevDriver) => ({
        ...prevDriver,
        isLogin: !prevDriver.isLogin,
      }));
    }
  };

  const openGoogleMaps = () => {
    if (!location) {
      Alert.alert('Emplacement non disponible', 'Aucune localisation disponible pour ce conducteur.');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    Linking.openURL(url).catch((err) => console.error("Erreur lors de l'ouverture de Google Maps", err));
  };

  const openWaze = () => {
    if (!location) {
      Alert.alert('Emplacement non disponible', 'Aucune localisation disponible pour ce conducteur.');
      return;
    }
    const url = `waze://?ll=${location.latitude},${location.longitude}&navigate=yes`;
    Linking.openURL(url).catch((err) => {
      Alert.alert("Impossible d'ouvrir Waze", "Assurez-vous que Waze est installé sur votre appareil.");
    });
  };

  const handleInputChange = (field, value) => {
    setEditableDriver((prevDriver) => ({
      ...prevDriver,
      [field]: value,
    }));
  };

  const handleUpdateDriver = async () => {
    const fieldNamesInFrench = {
      firstName: 'Prénom',
      lastName: 'Nom',
      deviceId: "ID de l'appareil",
      phone: 'Téléphone',
    };

    const requiredFields = ['firstName', 'lastName', 'deviceId'];
    for (const field of requiredFields) {
      if (!editableDriver[field]) {
        Alert.alert('Erreur', `Le champ ${fieldNamesInFrench[field]} est requis.`);
        return;
      }
    }

    if (editableDriver.phone && !/^\d{9}$/.test(editableDriver.phone)) {
      Alert.alert('Erreur', 'Le numéro de téléphone doit contenir exactement 9 chiffres.');
      return;
    }

    if (editableDriver.password && editableDriver.password.trim() !== '') {
      const password = editableDriver.password;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        Alert.alert(
          'Erreur',
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
        );
        return;
      }
    }

    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment mettre à jour les informations de ce conducteur ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const response = await axios.put(`${BASE_URL}/api/users/update/${editableDriver._id}`, editableDriver);
              if (response.status === 200) {
                Alert.alert('Succès', 'Conducteur mis à jour avec succès.');
                setIsEditing(false);
                onClose();
              }
            } catch (error) {
              if (error.response) {
                Alert.alert('Erreur', error.response.data.message || 'Erreur lors de la mise à jour.');
              } else {
                Alert.alert('Erreur', 'Échec de la mise à jour du conducteur. Veuillez réessayer.');
              }
            }
          },
        },
      ]
    );
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => {
              setHistoryVisible(!historyVisible);
              fetchHistory();
            }}
          >
            <Ionicons name="time-outline" size={24} color="#5A67D8" />
            <Text style={styles.historyText}>Historique des connexions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.historyButton}>
            <Text style={styles.historyText}>
              {editableDriver.firstName} {editableDriver.lastName}
            </Text>
          </TouchableOpacity>

          {historyVisible && (
            <FlatList
              data={historyData}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <Text style={styles.historyDescription}>{item.description}</Text>
                  <Text style={styles.historyDate}>{moment(item.dateAction).format('YYYY-MM-DD HH:mm')}</Text>
                  <TouchableOpacity style={styles.wazeButton} onPress={() => openInWaze(item.location)}>
                    <Ionicons name="navigate-outline" size={20} color="white" />
                    <Text style={styles.wazeButtonText}>Ouvrir dans Waze</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          <ScrollView>
            {isEditing ? (
              <>
                <Text style={styles.label}>Prénom :</Text>
                <TextInput
                  style={styles.textInput}
                  value={editableDriver.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                />
                <Text style={styles.label}>Nom :</Text>
                <TextInput
                  style={styles.textInput}
                  value={editableDriver.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                />
                <Text style={styles.label}>Mot de passe :</Text>
                <TextInput
                  style={styles.textInput}
                  value={editableDriver.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={true}
                />
              </>
            ) : null}

            <Text style={styles.label}>Téléphone :</Text>
            {isEditing ? (
              <View style={styles.phoneContainer}>
                <Text style={styles.countryCode}>+33</Text>
                <TextInput
                  style={styles.textInput}
                  value={editableDriver.phone ? editableDriver.phone.toString() : ''}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                />
              </View>
            ) : (
              <Text style={styles.textValue}>+33 {editableDriver.phone}</Text>
            )}

            {!isEditing && (
              <>
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Points :</Text>
                  <Text style={styles.textValue}>{editableDriver.points_earned}</Text>
                </View>

                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Type d'utilisateur :</Text>
                  <Text style={styles.textValue}>{editableDriver.userType}</Text>
                </View>

                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Activé :</Text>
                  <Text style={[styles.textValue, { color: editableDriver.activated ? 'green' : 'red' }]}>
                    {editableDriver.activated ? 'Oui' : 'Non'}
                  </Text>
                </View>

                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Statut de connexion :</Text>
                  <Text style={[styles.textValue, { color: editableDriver.isLogin ? 'green' : 'red' }]}>
                    {editableDriver.isLogin ? 'Connecté' : 'Déconnecté'}
                  </Text>
                </View>
              </>
            )}

            {isEditing && (
              <>
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Activé :</Text>
                  <Switch
                    value={editableDriver.activated}
                    onValueChange={handleActivateDeactivate}
                    thumbColor={editableDriver.activated ? '#5A67D8' : '#f4f3f4'}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                  />
                </View>

                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Statut de connexion :</Text>
                  <Switch
                    value={editableDriver.isLogin}
                    onValueChange={handleToggleLoginStatus}
                    thumbColor={editableDriver.isLogin ? '#5A67D8' : '#f4f3f4'}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                  />
                </View>
              </>
            )}

            <View style={styles.separator} />

            <View style={styles.fieldRow}>
              <TouchableOpacity style={styles.navigateButton} onPress={openGoogleMaps}>
                <Ionicons name="navigate-outline" size={24} color="white" />
                <Text style={styles.navigateText}>Google Maps</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navigateButton} onPress={openWaze}>
                <Ionicons name="navigate-outline" size={24} color="white" />
                <Text style={styles.navigateText}>Waze</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {isEditing ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateDriver}>
                <Text style={styles.saveText}>Sauvegarder</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={24} color="white" />
              <Text style={styles.editText}>Modifier</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteDriver}>
            <Ionicons name="trash" size={24} color="white" />
            <Text style={styles.deleteText}>Supprimer le conducteur</Text>
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
    marginVertical : "30%"
  },
  modalView: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    maxHeight: height,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  historyText: {
    color: '#5A67D8',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#2330a534',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 2,
  },
  historyDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  wazeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34A853',
    padding: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  wazeButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 5,
    padding: 5,
    flex: 1,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    marginRight: 8,
  },
  textValue: {
    fontSize: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#CED4DA',
    marginVertical: 10,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A67D8',
    borderRadius: 10,
    padding: 10,
    margin: 5,
  },
  navigateText: {
    color: 'white',
    marginLeft: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: '#5A67D8',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#5A67D8',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  editText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  deleteButton: {
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default DriverModal;
