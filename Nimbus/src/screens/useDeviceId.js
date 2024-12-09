import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';  // Pour générer un identifiant unique

const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const getDeviceId = async () => {
      try {
        console.log('Vérification de l\'identifiant dans AsyncStorage...');

        // Vérifier si un identifiant existe déjà dans AsyncStorage
        const storedDeviceId = await AsyncStorage.getItem('deviceId');
        console.log('Identifiant récupéré de AsyncStorage:', storedDeviceId);

        if (storedDeviceId) {
            console.log('L\'identifiant existe déjà. Utilisation de l\'identifiant existant.');

          // Si un identifiant est trouvé dans le cache, l'utiliser
          setDeviceId(storedDeviceId);
          
        } else {
            console.log('Aucun identifiant trouvé dans AsyncStorage. Génération d\'un nouvel identifiant...');

          // Si aucun identifiant n'est trouvé, en générer un nouveau
          const newDeviceId = uuidv4();  // Génère un nouvel identifiant unique
          setDeviceId(newDeviceId);
          console.log('Nouvel identifiant généré:', newDeviceId);

          // Stocker ce nouvel identifiant dans AsyncStorage pour une utilisation future
          await AsyncStorage.setItem('deviceId', newDeviceId);
          console.log('Identifiant stocké dans AsyncStorage:', newDeviceId);

        }
      } catch (error) {
        console.error('Error retrieving or saving device ID:', error);
      }
    };

    getDeviceId();
  }, []);

  return deviceId;
};

export default useDeviceId;
