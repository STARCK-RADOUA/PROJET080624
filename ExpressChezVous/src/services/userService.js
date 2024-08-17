import { BASE_URL } from '@env';

import axios from 'axios';
import * as Device from 'expo-device';

// Function to get the device ID
const getDeviceId = () => {
  return Device.osBuildId; 
};

export const getDeviceIde = () => {
  return Device.osBuildId; 
};





export const getClient = async () => {
  try {
    const deviceId = getDeviceId();


    const response = await axios.post(`${BASE_URL}/api/sessions/get-client-id`, {

      deviceId: deviceId,
    });

    const clientId = response.data.userId;
    return clientId;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    throw error;
  }
};

export const getClientById = async () => {
  try {
    const deviceId = getDeviceId();

    const response = await axios.post(`${BASE_URL}/api/sessions/get-client-details`, {
      deviceId: deviceId,
    });

    const clientDetails = response.data;
    console.log('User details:', clientDetails);
    return clientDetails;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};



export const getClientId = async () => {
  try {
    const deviceId = getDeviceId();

    const response = await axios.post(`${BASE_URL}/api/sessions/get-client-ide`, {
      deviceId: deviceId,
    });
    const clientId = response.data.clientId;
    console.log(clientId)
    return clientId;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    throw error;
  }

};




