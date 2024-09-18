import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { BASE_URL } from '@env';
import { format } from 'date-fns';

export default function DriverRevenueModal({ visible, onClose, driver }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState(null);

  const fetchDriverRevenue = async () => {
    if (!startDate || !endDate || !driver) return;

    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/driver/revenue-orders`, {
        driverId: driver.driverId,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      });
      setRevenueData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{driver.firstName} {driver.lastName}</Text>

          {/* Date Pickers */}
          <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>
              {startDate ? format(startDate, 'yyyy-MM-dd') : "Select Start Date"}
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
              }}
            />
          )}

          <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>
              {endDate ? format(endDate, 'yyyy-MM-dd') : "Select End Date"}
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
              }}
            />
          )}

          <TouchableOpacity style={styles.button} onPress={fetchDriverRevenue}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Fetch Revenue</Text>
            )}
          </TouchableOpacity>

          {/* Display the revenue and total orders */}
          {revenueData && (
            <View style={styles.resultContainer}>
              <Text>Total Revenue: {revenueData.totalRevenue}</Text>
              <Text>Total Delivered Orders: {revenueData.totalDeliveredOrders}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
  },
  button: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
  },
  closeButtonText: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },
});
