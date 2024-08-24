import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { BASE_URL} from '@env';
const QrCodeScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState(null);

  // Demander la permission d'utiliser la caméra
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Fonction appelée après le scan du QR code
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setQrData(data); // Données du QR code scanné

    // Appeler l'API pour vérifier le QR code
    try {
      const response = await fetch(`${BASE_URL}/api/qr-codes/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uniqueId: data }), // Envoyer le contenu du QR code au backend pour vérification
      });

      const result = await response.json();

      if (response.ok) {
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
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject} // Occupe tout l'écran pour le scan
        />
        <Text style={styles.scannerText}>Scannez le QR code</Text>
      </View>

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
  scannerContainer: {
    width: '100%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#000',
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
