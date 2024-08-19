import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getClientId } from '../services/userService';
import SimpleCrypto from 'react-native-simple-crypto'; // Importez la bibliothèque de cryptage

const QrcodeGeneratorScreen = () => {
  const [qrData, setQrData] = useState(null);
  const [expiration, setExpiration] = useState(false);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const clientId = await getClientId();
        const uniqueId = Math.random().toString(36).substring(7); // Générer un identifiant unique

        // Générer l'horodatage actuel et ajouter 1 minute pour l'expiration
        const timestamp = Date.now();
        const expirationTime = timestamp + 1 * 60 * 1000; // 1 minute en millisecondes

        const qrInfo = {
          clientId,
          uniqueId,
          expirationTime, // Ajouter l'heure d'expiration
        };

        // Crypter les informations avec AES
        const secretKey = 'your_secret_key'; // Utiliser une clé secrète pour le cryptage
        const encryptedQRInfo = await SimpleCrypto.AES.encrypt(JSON.stringify(qrInfo), SimpleCrypto.utils.convertUtf8ToBytes(secretKey));

        setQrData(SimpleCrypto.utils.convertBytesToHex(encryptedQRInfo)); // Convertir en format Hexadécimal pour le QR code
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
              value={qrData} // Les informations cryptées du QR code
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
