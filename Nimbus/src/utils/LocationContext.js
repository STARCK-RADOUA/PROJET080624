import React, { createContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [socket, setSocket] = useState(null);

  // Function to start tracking location
  const startTracking = async (deviceId) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Foreground permission to access location was denied');
      return;
    }

    // Request background location permission if necessary
    if (Platform.OS === 'android') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.log('Background permission to access location was denied');
        return;
      }
    }

    // Initialize socket connection
    const newSocket = io(BASE_URLIO);
    setSocket(newSocket);

    // Start location tracking
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 5, // Update every 5 meters
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        newSocket.emit('driverLocationUpdate', { deviceId, latitude, longitude });
      }
    );

    setIsTracking(true);
    setLocationSubscription(subscription);
  };

  // Function to stop tracking location
  const stopTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setIsTracking(false);
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return (
    <LocationContext.Provider value={{ startTracking, stopTracking, isTracking }}>
      {children}
    </LocationContext.Provider>
  );
};
