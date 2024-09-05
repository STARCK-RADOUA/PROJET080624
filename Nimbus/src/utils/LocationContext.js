import React, { createContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [isTracking, setIsTracking] = useState(false);
  const socket = io(BASE_URLIO);

  const startTracking = async (deviceId) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    setIsTracking(true);

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 5, // Update every 5 meters
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        console.log('------------------------------------');
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        console.log('------------------------------------');
        socket.emit('driverLocationUpdate', { deviceId, latitude, longitude });
      }
    );
  };

  const stopTracking = () => {
    setIsTracking(false);
    socket.disconnect();
  };

  return (
    <LocationContext.Provider value={{ startTracking, stopTracking, isTracking }}>
      {children}
    </LocationContext.Provider>
  );
};
