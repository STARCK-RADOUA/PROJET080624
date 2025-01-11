import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity ,Dimensions} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getClientId, getDeviceIde } from '../services/userService';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenCapture from 'expo-screen-capture'; // Import ScreenCapture
import { BASE_URL } from '@env';
const { width, height } = Dimensions.get('window');

const Parrainage = () => {
  const [qrData, setQrData] = useState(null);
  const [expiration, setExpiration] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // Timer set to 30 seconds
  
  // Function to call backend API to generate a QR Code
  const generateQRCode = async () => {
    try {
      const clientId = await getClientId();
      const deviceId = await getDeviceIde();
      const response = await fetch(`${BASE_URL}/api/qr-codes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, deviceId }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setQrData(data.uniqueId);
        setScanned(false);
        setExpiration(false);
        setTimeLeft(30);
      } else {
        console.error('Error generating QR code:', data.error);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Prevent screen capture
  useEffect(() => {
    const preventScreenCapture = async () => {
      await ScreenCapture.preventScreenCaptureAsync();
    };
    preventScreenCapture();
    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, []);

  // Regenerate the QR code every 30 seconds
  useEffect(() => {
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
       <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={30} color="#e9ab25" />
        <Text style={styles.infoText}>
          Si vous invitez un autre client via le QR code, vous gagnerez un point. Vous pouvez acheter n'importe quel produit, mais vous devez en acheter un payant.
        </Text>
      </View>
    <Text style={styles.parrainage }> Parrainage</Text>
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

      {/* Futuristic Styled Message */}
   
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f3d4ab2b',
    padding: 20,
  },
  qrContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ab25dd',
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
  // New styles for the informational container
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
    width: width*0.95,
    height: height*0.15,
  },
  infoText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    width: width*0.75,

  }, 
   parrainage : {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#e9ab25',
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

export default Parrainage;
