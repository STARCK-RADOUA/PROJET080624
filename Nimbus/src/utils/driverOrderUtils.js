import axios from 'axios';
import { Linking, Alert } from 'react-native';
import * as Device from 'expo-device';
import { BASE_URL } from '@env';

export const getDeviceId = async (setDeviceId) => {
  setDeviceId(Device.osBuildId);
};

export const fetchDriverId = async (deviceId, setDriverId, setDriverInfo,setPoint, setActiveStatusMessage) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/driver/device`, { deviceId });
    if (response.status === 200 && response.data.driverId) {
      setDriverId(response.data.driverId);
      setDriverInfo(response.data.user || { firstName: 'Unknown', lastName: '' });
      setPoint(response.data.user || { points_earned: '0'})
      setActiveStatusMessage(response.data.driverInfo?.isDisponible ? 'True' : 'False');
    }
  } catch (error) {
    console.error('Error fetching driver ID:', error);
  }
};
export const getDistance = async (startLat, startLng, endLat, endLng) => {
  try {
    // Envoyer les données dans le corps de la requête
    const response = await axios.post(`${BASE_URL}/api/driver/get-distance`, {
      startLat,
      startLng,
      endLat,
      endLng
    });

    const { distance } = response.data;
    return { distance };
  } catch (error) {
    console.error(error);
    return { distance: 'que quelques' }; // Retour en cas d'erreur
  }
};

export const updateDriverAvailability = async (driverId, newIsEnabled) => {
  try {
    if (driverId) {
      await axios.post(`${BASE_URL}/api/driver/updateAvailability`, {
        driverId,
        isDisponible: newIsEnabled,
      });
    }
  } catch (error) {
    console.error('Error updating driver availability:', error);
  }
};export const updateDriverPause = async (driverId, newIsEnabled) => {
  try {
    if (driverId) {
      await axios.post(`${BASE_URL}/api/driver/updatePause`, {
        driverId,
        isDisponible: newIsEnabled,
      });
    }
  } catch (error) {
    console.error('Error updating driver availability:', error);
  }
};

export const openGoogleMaps = (location) => {
  const { latitude, longitude } = parseLocation(location);
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  Linking.openURL(url).catch((err) => console.error('Error opening Google Maps:', err));
};

export const openWaze = (location) => {
  const { latitude, longitude } = parseLocation(location);
  const url = `waze://?ll=${latitude},${longitude}&navigate=yes`;
  Linking.openURL(url).catch(() => {
    Alert.alert("Can't open Waze", 'Make sure Waze is installed on your device.');
  });
};

const parseLocation = (location) => {
  const [latitude, longitude] = location.split(',').map(coord => parseFloat(coord));
  return { latitude, longitude };
};
