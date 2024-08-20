import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getClientId } from '../services/userService';
import { v4 as uuidv4 } from 'uuid'; // Importer la bibliothèque uuid

const QrcodeGeneratorScreen = () => {
  const [qrData, setQrData] = useState(null);
  const [expiration, setExpiration] = useState(false);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const clientId = await getClientId();

        // Utiliser uuid pour générer un identifiant unique compatible avec React Native
        const uniqueId = uuidv4();

        // Générer l'horodatage actuel et ajouter 1 minute pour l'expiration
        const timestamp = Date.now();
        const expirationTime = timestamp + 1 * 60 * 1000; // 1 minute en millisecondes

        const qrInfo = {
          clientId,
          uniqueId,
          expirationTime, // Ajouter l'heure d'expiration
        };

        // Encodage simple du QR code sans cryptage sécurisé pour éviter les problèmes de compatibilité
        setQrData(JSON.stringify(qrInfo)); // Encodage en JSON pour le QR code
      } catch (error) {
        console.error('Erreur lors de la génération du QR code :', error);
      }
    };

    generateQRCode();

    // Gérer l'expiration du QR code après 1 minute
    const timer = setTimeout(() => {
      setExpiration(true); // Marqueur que le QR code a expiré
    }, 1 * 60 * 1000); // 1 minute

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {expiration ? (
        <Text>QR Code Expired</Text>
      ) : (
        <>
          {qrData && (
            <QRCode
              value={qrData} // Les informations du QR code encodées en JSON
              size={200}
              backgroundColor="white"
              color="black"
            />
          )}
          <Text>Scan the QR code within 1 minute</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QrcodeGeneratorScreen;
