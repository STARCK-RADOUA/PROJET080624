import React, { createContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null); // Ajout d'un état pour la localisation actuelle

  // Define background task for location updates
  TaskManager.defineTask('BACKGROUND_LOCATION_TASK', async ({ data, error }) => {
    if (error) {
      console.error('Background location task error:', error);
      return;
    }
    if (data) {
      const { locations } = data;
      const { latitude, longitude } = locations[0].coords;
      setCurrentLocation({ latitude, longitude }); // Mise à jour de la localisation actuelle dans le contexte

      console.log(`Background Latitude: ${latitude}, Longitude: ${longitude}`);
      if (socket) {
        socket.emit('driverLocationUpdate', { deviceId: Device.osBuildId , latitude, longitude });
        socket.emit('driverPing', { deviceId: Device.osBuildId  });

      }
    }
  });

  // Function to start tracking location
  const startTracking = async (deviceId) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Foreground permission to access location was denied');
      return;
    }

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

    // Start foreground location tracking
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 15000,
        distanceInterval: 1000,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude }); // Mise à jour de la localisation actuelle dans le contexte

        console.log(`Foreground Latitude: ${latitude}, Longitude: ${longitude}`);
        newSocket.emit('driverLocationUpdate', { deviceId, latitude, longitude });
      },
      (error) => {
        console.error('Foreground location error:', error);
      }
    );

    // Start background location tracking
    await Location.startLocationUpdatesAsync('BACKGROUND_LOCATION_TASK', {
      accuracy: Location.Accuracy.High,
      timeInterval: 20000,
      distanceInterval: 50,
    });

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
    <LocationContext.Provider value={{ startTracking, stopTracking, isTracking,currentLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
