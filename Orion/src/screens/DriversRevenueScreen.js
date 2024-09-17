import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Button, ScrollView } from 'react-native';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';
import { Calendar } from 'react-native-calendars'; // Asksuming you use react-native-calendars

const socket = io(BASE_URLIO);

export default function DriverRevenue() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [driverData, setDriverData] = useState(null);

  useEffect(() => {
    socket.emit('watchDrivers');
    socket.on('driversUpdated', ({ drivers }) => {
        console.log('fucking' , drivers)
      setDrivers(drivers);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchDriverData = async (userId) => {
    try {
      socket.emit('getDriverRevenue', userId, startDate, endDate);
      socket.on('driverData', (data) => {
        console.log('Received driverData:', data);  // Add this line
        setDriverData(data);
      });
    } catch (error) {
      console.error('Error fetching driver data:', error);
    }
  };

  const handleCardPress = (driver) => {
    setSelectedDriver(driver);
    setModalVisible(true);
  };

  const handleFetchData = () => {
    if (startDate && endDate) { 
      fetchDriverData(selectedDriver._id);
    } else {
      alert('Please select both start and end dates.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Revenue</Text>
      <ScrollView contentContainerStyle={styles.cardContainer}>
        {drivers.map(driver => (
          <TouchableOpacity key={driver._id} style={styles.driverCard} onPress={() => handleCardPress(driver)}>
            <Text style={styles.driverName}>{driver.firstName} {driver.lastName}</Text>
            <Text>Total Revenue: {driver.totalRevenue}</Text>
            <Text>Total Orders: {driver.totalOrders}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Driver Details</Text>
            {selectedDriver && (
              <>
                <Text>Name: {selectedDriver.firstName} {selectedDriver.lastName}</Text>
                <Text>Total Revenue All Time: {driverData?.driver.totalRevenue}</Text>
                <Text>Total Orders All Time: {driverData?.driver.totalOrders}</Text>

                <Calendar
                  onDayPress={(day) => {
                    if (!startDate) {
                      setStartDate(day.dateString);
                    } else {
                      setEndDate(day.dateString);
                    }
                  }}
                />

                <Button title="Fetch Data" onPress={handleFetchData} />

                {driverData && (
                  <>
                    <Text>Revenue Between Dates: {driverData.revenueBetweenDates}</Text>
                    <Text>Orders Between Dates: {driverData.ordersBetweenDates}</Text>
                  </>
                )}
              </>
            )}
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f4f4c3',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#030e0f',
    marginBottom: 20,
    textAlign: 'left',
  },
  cardContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
