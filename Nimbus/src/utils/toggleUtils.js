// toggleUtils.js
import axios from 'axios';
import { BASE_URL } from '@env';

export const toggleSwitchState = (isEnabled, setIsEnabled, driverId) => {
  const newIsEnabled = !isEnabled;
  setIsEnabled(newIsEnabled);
  updateDriverAvailability(driverId, newIsEnabled); // Update availability in the backend
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
};
