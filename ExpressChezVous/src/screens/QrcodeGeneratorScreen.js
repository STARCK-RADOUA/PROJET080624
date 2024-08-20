import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getClientId } from '../services/userService';
import { v4 as uuidv4 } from 'uuid';
import * as Crypto from 'expo-crypto'; // Utiliser expo-crypto pour le chiffrement
import { Ionicons } from '@expo/vector-icons'; // Pour ajouter une icône au bouton

// Fonction pour générer un UUID sans utiliser 'crypto'
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const QrcodeGeneratorScreen = () => {
  const [qrData, setQrData] = useState(null);
  const [expiration, setExpiration] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // Timer pour 60 secondes

  // Fonction pour générer le QR code
  const generateQRCode = async () => {
    try {
      const clientId = await getClientId();
      const uniqueId = generateUUID();
      const timestamp = Date.now();
      const expirationTime = timestamp + 1 * 60 * 1000; // 1 minute

      const qrInfo = {
        clientId,
        uniqueId,
        expirationTime,
      };

      // Utiliser expo-crypto pour générer un hash SHA-256
      const hashData = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        JSON.stringify(qrInfo)
      );

      setQrData(hashData);
      setScanned(false);
      setExpiration(false);
      setTimeLeft(60); // Réinitialisation du timer
    } catch (error) {
      console.error('Erreur lors de la génération du QR code :', error);
    }
  };

  // Initialiser et expirer le QR code après 1 minute
  useEffect(() => {
    generateQRCode();

    // Définir un timer pour l'expiration après 1 minute
    const timer = setTimeout(() => {
      setExpiration(true);
    }, 1 * 60 * 1000);

    const countdown = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdown);
    };
  }, [scanned]);

  return (
    <View style={styles.container}>
      
      <View style={styles.container1}>
      {expiration ? (
        <>
          <Text style={styles.expiredText}>QR Code Expired</Text>
          <TouchableOpacity style={styles.regenButton} onPress={generateQRCode}>
            <Ionicons name="refresh" size={24} color="white" />
            <Text style={styles.regenButtonText}>Regenerate QR Code</Text>
          </TouchableOpacity>
        </>
      ) : scanned ? (
        <Text style={styles.scannedText}>QR Code already scanned</Text>
      ) : (

        <View style={styles.container2}>
          {qrData && (
            <QRCode
              value={qrData} // Hash SHA-256 utilisé pour générer le QR code
              size={250}
              backgroundColor="white"
              color="black"
            />
          )}
          <Text style={styles.timerText}>{`Time left: ${timeLeft}s`}</Text>
        </View>
      )}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3d4ab52',
    padding: 20,
  },
  container1: {
    
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3d4ab60',
   
    borderRadius: 60,
   
  },
   container2: {
    
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 60,
    
   
  },
  expiredText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4d4d',
    marginBottom: 20,
  },
  scannedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffa500',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 20,
   
    color: '#996a12',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  regenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffa51ec3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 20,
  },
  regenButtonText: {
    color: '#f89a1f',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
 
});

export default QrcodeGeneratorScreen;
