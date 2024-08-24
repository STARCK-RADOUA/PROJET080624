import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getClientId, getDeviceIde } from '../services/userService';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenCapture from 'expo-screen-capture'; // Import ScreenCapture
import { BASE_URL, BASE_URLIO } from '@env';
const QrcodeGeneratorScreen = () => {
  const [qrData, setQrData] = useState(null);
  const [expiration, setExpiration] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // Timer set to 30 seconds
  
  // Fonction pour appeler l'API du backend pour générer un QR Code
  const generateQRCode = async () => {
    try {
      const clientId = await getClientId();
      const deviceId = await getDeviceIde();
      console.log('Client ID:', clientId);
      console.log('Device ID:', deviceId);

      const response = await fetch(`${BASE_URL}/api/qr-codes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId, deviceId }), // Envoyer clientId et deviceId au backend
      });

      const data = await response.json();
      
      if (response.ok) {
        setQrData(data.uniqueId); // Utiliser l'ID unique généré par le backend pour le QR code
        setScanned(false);
        setExpiration(false);
        setTimeLeft(30); // Réinitialiser le timer pour 30 secondes
        console.log('QR Code généré:', data.uniqueId);
      } else {
        console.error('Erreur lors de la génération du QR code:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  };

  // Fonction pour empêcher les captures d'écran
  useEffect(() => {
    const preventScreenCapture = async () => {
      await ScreenCapture.preventScreenCaptureAsync();
    };

    preventScreenCapture(); // Empêche les captures d'écran

    return () => {
      ScreenCapture.allowScreenCaptureAsync(); // Autorise à nouveau les captures d'écran quand le composant est démonté
    };
  }, []);

  // Regénérer le QR Code toutes les 30 secondes
  useEffect(() => {
    generateQRCode(); // Génération initiale du QR code

    const interval = setInterval(() => {
      generateQRCode(); // Regénère toutes les 30 secondes
    }, 30 * 1000); // Toutes les 30 secondes

    const timeout = setTimeout(() => {
      setExpiration(true);
    }, 15 * 60 * 1000); // Expiration fixée à 15 minutes

    // Compteur de 30 secondes
    const countdown = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30)); // Réinitialise le compteur toutes les 30 secondes
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(countdown);
      clearInterval(interval);
    };
  }, [scanned]);

  return (
    <View style={styles.container}>
      <View style={styles.qrContainer}>
        {expiration ? (
          <>
            <Text style={styles.expiredText}>QR Code expiré</Text>
            <TouchableOpacity style={styles.regenButton} onPress={generateQRCode}>
              <Ionicons name="refresh" size={24} color="white" />
              <Text style={styles.regenButtonText}>Regénérer le QR Code</Text>
            </TouchableOpacity>
          </>
        ) : scanned ? (
          <Text style={styles.scannedText}>QR Code déjà scanné</Text>
        ) : (
          <View style={styles.qrCodeDisplay}>
            {qrData && (
              <QRCode
                value={qrData} // Affiche l'ID unique généré par le backend
                size={250}
                backgroundColor="white"
                color="black"
              />
            )}
            <Text style={styles.timerText}>{`Temps restant: ${timeLeft}s`}</Text>
          </View>
        )}
      </View>
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
  qrContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3d4ab60',
    borderRadius: 60,
    padding: 20,
  },
  qrCodeDisplay: {
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
    fontSize: 22,
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
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default QrcodeGeneratorScreen;
