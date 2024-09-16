// driverUtils.js
import axios from 'axios';
import { BASE_URL } from '@env';

export const getDeviceId = async (setDeviceId) => {
  setDeviceId(Device.osBuildId);
};

export const fetchDriverId = async (setDriverId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/driver/id`);
    setDriverId(response.data.driverId);
  } catch (error) {
    console.error('Error fetching driver ID:', error);
  }
};

export const fetchDriverOrders = (socket, setOrders, setLoading, driverId) => {
  socket.on('driverOrderUpdate', (data) => {
    setOrders(data.orders || []);
    setLoading(false);
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err.message);
    setLoading(false);
  });
};
