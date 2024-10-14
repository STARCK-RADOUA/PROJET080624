import React from 'react';
import { View, Text, Linking,TouchableOpacity, StyleSheet,Alert, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';


const WarnDetailModal = ({ warn, onClose }) => {
  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(err => console.error('Error opening Google Maps', err));
  };

  const openWaze = (latitude, longitude) => {
    const url = `waze://?ll=${latitude},${longitude}&navigate=yes`;
    Linking.openURL(url).catch(err => {
      Alert.alert("Can't open Waze", "Make sure Waze is installed on your device.");
    });
  };

  const showMapOptions = (location) => {
    const [longitude, latitude] = location.split(' ');
    const latitudeFloat = parseFloat(latitude);
    const longitudeFloat = parseFloat(longitude);

    if (!isNaN(latitudeFloat) && !isNaN(longitudeFloat)) {
      Alert.alert(
        'Choose Navigation App',
        'Select the app to navigate to this location',
        [
          { text: 'Google Maps', onPress: () => openGoogleMaps(  longitudeFloat, latitudeFloat) },
          { text: 'Waze', onPress: () => openWaze( longitudeFloat, latitudeFloat) },
          { text: 'Cancel', style: 'cancel' }
        ],
        { cancelable: true }
      );
    } else {
      console.error('Invalid location data');
      Alert.alert('Invalid location', 'The location data is not valid.');
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={warn !== null}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>{warn.firstName} {warn.lastName}</Text>
          <Text style={styles.modalText}>Device ID: {warn.deviceId}</Text>
          <Text style={styles.modalText}>Phone: +33 {warn.phone}</Text>
          <Text style={styles.modalText}>Password: **{warn.password}**</Text>
          <Text style={styles.modalText}>Location: {warn.location}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => showMapOptions(warn.location)}
            >
              <Ionicons name="navigate-outline" size={24} color="white" />
              <Text style={styles.buttonText}>Navigate</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modalTimestamp}>Created: {moment(warn.created_at).format('DD MMM YYYY, h:mm a')}</Text>
          <Text style={styles.modalTimestamp}>Updated: {moment(warn.updated_at).format('DD MMM YYYY, h:mm a')}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: "35%",
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#5A67D8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    color: '#5A67D8',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    color: '#dddddd',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A67D8',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: '#101010',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalTimestamp: {
    fontSize: 16,
    color: '#aaaaaa',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    marginTop: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});

export default WarnDetailModal;
