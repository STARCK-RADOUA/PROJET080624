import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getDriverId, getDeviceIde } from '../services/userService'; // Remplacer par getDriverId
import { Ionicons } from '@expo/vector-icons';
import * as ScreenCapture from 'expo-screen-capture'; 
import { BASE_URL, BASE_URLIO } from '@env';
import DeviceInfo from 'react-native-device-info';

const QrcodeGeneratorDriverScreen = () => {
  const [qrData, setQrData] = useState(null);
  const [expiration, setExpiration] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); 
  const [deviceId, setDeviceId] = useState('');
  
  const getDeviceId = async () => {
   await setDeviceId(DeviceInfo.getUniqueId());
    // Set deviceId using expo-device's osBuildId
  };
  // Fonction pour générer le QR code
  const generateQRCode = async () => {
    try { const deviceId = DeviceInfo.getUniqueId();
        console.log('------------------------------------');
        console.log('Device ID:', deviceId);
        console.log('------------------------------------');
       // Utilise getDriverId au lieu de getClientId
      const response = await fetch(`${BASE_URL}/api/qr-codes/generateDriver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({  deviceId }), // Adapter ici pour driver
      });
      const data = await response.json();
      
      if (response.ok) {
        setQrData(data.uniqueId);
        setScanned(false);
        setExpiration(false);
        setTimeLeft(30);
      } else {
        console.error('Erreur lors de la génération du QR code:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }
  };

  // Empêcher la capture d'écran
  useEffect(() => {
    getDeviceId();
    const preventScreenCapture = async () => {
      await ScreenCapture.preventScreenCaptureAsync();
    };
    preventScreenCapture();
    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, []);

  // Régénérer le QR code toutes les 30 secondes
  useEffect(() => {
    getDeviceId();
    generateQRCode();
    const interval = setInterval(generateQRCode, 30 * 1000);
    const countdown = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, [scanned]);

  return (
    <View style={styles.container}>
      <Text style={styles.parrainage }>Génération QR Driver</Text> 
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
              <QRCode value={qrData} size={250} backgroundColor="white" color="black" />
            )}
            <Text style={styles.timerText}>{`Temps restant: ${timeLeft}s`}</Text>
          </View>
        )}
      </View>

      {/* Message adapté pour le driver */}
      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={30} color="#2C4231" />
        <Text style={styles.infoText}>
        Pourquoi ne pas partager ton QR code et faire découvrir notre service à de nouveaux clients ? Ton geste peut vraiment faire la différence dans l'agrandissement de notre communauté !

        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // mêmes styles que précédemment
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3d4ab2b',
    padding: 20,
  },
  qrContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C4231',
    borderRadius: 60,
    padding: 20,
  },
  qrCodeDisplay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 60,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 25,
    elevation: 20,
  },
  expiredText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d44343',
    marginBottom: 20,
  },
  scannedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C4231',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 22,
    color: '#2C4231',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  regenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C4231',
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0e6d2',
    padding: 15,
    borderRadius: 15,
    marginTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
    width: '90%',
  },
  infoText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 0,
    textAlign: 'center',
  }, 
  parrainage: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#2C4231',
    textAlign: 'center',
    marginBottom: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
});

export default QrcodeGeneratorDriverScreen;
