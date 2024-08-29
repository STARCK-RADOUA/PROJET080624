import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera/legacy';
import { BASE_URL } from '@env';


const QrCodeScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState(null);
  
  const [type, setType] = useState(CameraType.back); // Set default camera type to back

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Function to handle scanned QR code
  const handleBarCodeScanned = async ({ data }) => {
     setScanned(true);
   
    console.log('------------------------------------');

console.log('------------------------------------');
   
    setQrData(data); // Data from scanned QR code

    // Call the API to verify the QR code
    try {
      const response = await fetch(`${BASE_URL}/api/qr-codes/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uniqueId: data }), // Send QR code data to the backend
      });

      const result = await response.json();

      if (response.ok) {
        
        navigation.replace('Registration',{uniqueId: data});
Alert.alert('Succès', 'QR Code validé avec succès');
      } else {
        Alert.alert('Erreur', result.error || 'Échec de la vérification du QR code');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de vérifier le QR code');
    }
  };

  if (hasPermission === null) {
    return <Text>Demande de permission pour la caméra...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Accès à la caméra refusé</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: ['qr'], // Scan only QR codes
        }}
      />
      <Text style={styles.scannerText}>Scannez le QR code</Text>

      {scanned && (
        <Button
          title={'Scanner à nouveau'}
          onPress={() => setScanned(false)}
          color="#ff5a5f"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '70%',
  },
  scannerText: {
    position: 'absolute',
    bottom: 20,
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: '#000000a0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export default QrCodeScannerScreen;
