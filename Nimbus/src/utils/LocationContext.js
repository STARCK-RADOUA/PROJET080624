import React, { createContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null); // Stocke la souscription de localisation
  const socket = io(BASE_URLIO);

  // Fonction pour démarrer le suivi de la localisation
  const startTracking = async (deviceId) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    setIsTracking(true);

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Mettre à jour toutes les 5 secondes
        distanceInterval: 5, // Mettre à jour tous les 5 mètres
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        socket.emit('driverLocationUpdate', { deviceId, latitude, longitude });
      }
    );

    setLocationSubscription(subscription); // Stocker la souscription pour arrêter plus tard
  };

  // Fonction pour arrêter le suivi de la localisation
  const stopTracking = () => {
    setIsTracking(false);
    if (locationSubscription) {
      locationSubscription.remove(); // Arrêter l'écoute de la localisation
      setLocationSubscription(null); // Réinitialiser la souscription
    }
    socket.disconnect();
  };

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      socket.disconnect();
    };
  }, [locationSubscription]);

  return (
    <LocationContext.Provider value={{ startTracking, stopTracking, isTracking }}>
      {children}
    </LocationContext.Provider>
  );
};
