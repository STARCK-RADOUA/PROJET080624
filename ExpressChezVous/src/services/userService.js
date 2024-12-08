import { BASE_URL } from '@env';

import axios from 'axios';
import DeviceInfo from 'react-native-device-info';

// Function to get the device ID
const getDeviceId = () => {
  return DeviceInfo.getUniqueId(); 
};

export const getDeviceIde = () => {
  return DeviceInfo.getUniqueId(); 
};





export const getClient = async () => {
  try {
    const deviceId = getDeviceId();


    const response = await axios.post(`${BASE_URL}/api/sessions/get-client-id`, {

      deviceId: deviceId,
    });
console.log(response.data.userId,"ggggggggggggggg")
    const clientId = response.data.userId;
    console.log(clientId)
    return clientId;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    throw error;
  }
};

export const getUserDetails = async () => {
  try {
    const deviceId = getDeviceId();

    const response = await axios.post(`${BASE_URL}/api/sessions/get-user-details`, {
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




