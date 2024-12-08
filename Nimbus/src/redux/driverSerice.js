

import { BASE_URLIO, BASE_URL } from '@env';
import axios from 'axios';
import * as Application from 'expo-application';

const getDeviceId = () => {
    return Application.applicationId; 
  };

  export const getDriverId = async () => {
    try {
      const deviceId = getDeviceId();
  
      const response = await axios.post(`${BASE_URL}/api/sessions/get-driver-ide`, {
        deviceId: deviceId,
      });
      const driverId = response.data.driverId;
      console.log("driver id " , driverId)
      return driverId;
    } catch (error) {
      console.error('Error fetching Driver ID:', error);
      throw error;
    }}

