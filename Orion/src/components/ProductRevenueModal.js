import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { BASE_URL } from '@env';
import { format } from 'date-fns';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

export default function ProductRevenueModal({ visible, onClose, product }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const fetchProductRevenue = async () => {
    if (!startDate || !endDate || !product) return;
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/products/revenue-between-dates`, {
        productId: product.product._id,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
      setRevenueData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!startDate || !endDate || !product) return;

    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    setDownloading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/products/${product.product._id}/products/pdf?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {
        responseType: 'arraybuffer',
      });

      const base64 = btoa(
        new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', "Impossible d'accéder au stockage. Veuillez accorder la permission.");
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}Revenue_Product_${product.product._id}.pdf`;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);
      setPdfDownloaded(true);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "Une erreur s'est produite lors du téléchargement du PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={30} color="#FF5555" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{product.name}</Text>

          {/* Date Pickers */}
          <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>
              {startDate ? format(startDate, 'yyyy-MM-dd') : 'Sélectionner la date de début'}
            </Text>
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
                setRevenueData(null); // Clear revenue data on new date selection
              }}
            />
          )}

          <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>
              {endDate ? format(endDate, 'yyyy-MM-dd') : 'Sélectionner la date de fin'}
            </Text>
          </TouchableOpacity>

          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
                setRevenueData(null);
              }}
            />
          )}

          {revenueData && revenueData.totalRevenue > 0 ? (
            !pdfDownloaded ? (
              <TouchableOpacity style={styles.button} onPress={downloadPDF} disabled={downloading}>
                {downloading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Télécharger PDF</Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text style={styles.successText}>PDF téléchargé avec succès !</Text>
            )
          ) : (
            <TouchableOpacity style={styles.button} onPress={fetchProductRevenue}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Récupérer les revenus</Text>
              )}
            </TouchableOpacity>
          )}

          {revenueData  && (
            <View style={styles.resultContainer}>
              <Text>Total des revenus : {revenueData.totalRevenue || 0} MAD </Text>
              <Text>Total des achats : {revenueData.totalTimesBought || 0}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2D2D2D',
  },
  dateButton: {
    backgroundColor: '#EFEFEF',
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#555555',
  },
  button: {
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
