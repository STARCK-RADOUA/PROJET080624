import axios from 'axios';
import * as Device from 'expo-device';

// Function to get the device ID
const getDeviceId = () => {
  return Device.osBuildId; // Using osBuildId from expo-device
};

// Function to get userId by device ID
export const getUser = async () => {
  try {
    const deviceId = getDeviceId();

    // Sending deviceId to the backend to get the userId
    const response = await axios.post('http://192.168.1.35:4000/api/sessions/get-user-id', {
      deviceId: deviceId,
    });

    const userId = response.data.userId;
    console.log('User ID:', userId);
    return userId;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    throw error;
  }
};

// Function to get user details by device ID
export const getUserById = async () => {
  try {
    const deviceId = getDeviceId();

    // Sending deviceId to the backend to get user details
    const response = await axios.post('https://your-backend-url.com/api/sessions/get-user-details', {
      deviceId: deviceId,
    });

    const userDetails = response.data;
    console.log('User details:', userDetails);
    return userDetails;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};
