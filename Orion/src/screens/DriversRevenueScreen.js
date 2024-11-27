import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, SafeAreaView , TouchableOpacity} from 'react-native';
import io from 'socket.io-client';
import DriverCard from './../components/DriverRevenuCard';
import DriverRevenueModal from './../components/DriverRevenueModal'; // Import the modal
import { BASE_URLIO } from '@env';
import { Ionicons } from '@expo/vector-icons'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import axios from 'axios';

export default function DriversRevenueScreen() {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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


  

  const applyFilters  = async() => {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      try {
        const response = await axios.get(`${BASE_URLIO}/api/orders/allbytime`, {
          params: {
            startDate: formattedStartDate, // Example start date
            endDate: formattedEndDate    // Example end date
          }
        });
    
        console.log('Driver Stats:', response.data);
        setFilteredDrivers(response.data);
         setShowFilterMenu(false);
      } catch (error) {
        console.error('Error fetching driver stats:', error);
      }
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const handleSearch = (query) => {
    setSearchText(query);
    const filtered = drivers.filter(driver =>
      driver.firstName.toLowerCase().includes(query.toLowerCase()) ||
      driver.lastName.toLowerCase().includes(query.toLowerCase()) ||
      driver.driverId.toString().includes(query) ||
      driver.userId.toString().includes(query) ||
      driver.phone.toString().includes(query)

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
          placeholder="Rechercher par nom, téléphone ou ID"
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>
      <TouchableOpacity onPress={toggleFilterMenu} style={styles.filterButton}>
          <Ionicons name="filter-outline" size={24} color="#fff" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
        {showFilterMenu && (
        <View style={styles.filterMenu}>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Start Date: {startDate.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>End Date: {endDate.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={applyFilters} style={styles.applyFilterButton}>
            <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || startDate;
            setShowStartDatePicker(false);
            setStartDate(currentDate);
          }}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || endDate;
            setShowEndDatePicker(false);
            setEndDate(currentDate);
          }}
        />
      )}

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
          <Text>Aucun livreur trouvé</Text>
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e27a3f',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  filterButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  filterMenu: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },
  dateButton: {
    backgroundColor: '#1f695a',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  dateButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  applyFilterButton: {
    backgroundColor: '#2e8b57',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  applyFilterButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});
