import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import io from 'socket.io-client';
import DriverCard from './../components/DriverRevenuCard';
import DriverRevenueModal from './../components/DriverRevenueModal'; // Import the modal
import { BASE_URLIO } from '@env';

export default function DriversRevenueScreen() {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    const socket = io(BASE_URLIO);
    socket.emit('getDriverStats');
    socket.on('driverStats', (data) => {
      console.log(data)
      setDrivers(data);
      setFilteredDrivers(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = (query) => {
    setSearchText(query);
    const filtered = drivers.filter(driver =>
      driver.firstName.toLowerCase().includes(query.toLowerCase()) ||
      driver.lastName.toLowerCase().includes(query.toLowerCase()) ||
      driver.driverId.toString().includes(query) ||
      driver.userId.toString().includes(query)
    );
    setFilteredDrivers(filtered);
  };

  const openModal = (driver) => {
    setSelectedDriver(driver);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDriver(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Liste des livreurs</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom, téléphone, ID..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.cardContainer}>
        {filteredDrivers.length > 0 ? (
          filteredDrivers.map(driver => (
            <DriverCard
              key={driver.driverId}
              driver={driver}
              onPress={() => openModal(driver)}
            />
          ))
        ) : (
          <Text>Aucun livreur disponible</Text>
        )}
      </ScrollView>

      {/* Render the modal */}
      {selectedDriver && (
        <DriverRevenueModal
          visible={modalVisible}
          onClose={closeModal}
          driver={selectedDriver}
        />
      )}
    </SafeAreaView>
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
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingLeft: 40,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    color: '#111827',
    marginRight: 10,
  },
  cardContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
