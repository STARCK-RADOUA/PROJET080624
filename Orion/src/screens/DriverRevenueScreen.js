import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Animated, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';
import DriverItem from './DriverRevenueItem'; // Update import

const socket = io(BASE_URLIO);

const DriverRevenueScreen = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isAscending, setIsAscending] = useState(true);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const scaleAnim = useState(new Animated.Value(1))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {

        socket.emit('fetchDriverOrdersForCountUpdated', startDate.toISOString(), endDate.toISOString());
      
        socket.on('fetchDriverOrdersForCountUpdated', (data) => {
          const { totalBusiness, driverRevenues, orders } = data;
          setDrivers(Object.values(driverRevenues)); // Convert driverRevenues object to array
          setFilteredDrivers(Object.values(driverRevenues)); // Same here for filtering
          setTotalRevenue(totalBusiness);
          console.log('------------------------------------');
          console.log(totalBusiness,"totalBusiness");
          console.log(driverRevenues,"driverRevenues");

          console.log('------------------------------------');
        });
      
        // Other socket listeners and cleanup...
      
     
      
    socket.on('driverAdded', (newDriver) => {
      setDrivers((prevDrivers) => [...prevDrivers, newDriver]);
      setFilteredDrivers((prevDrivers) => [...prevDrivers, newDriver]);
    });

    socket.on('driverUpdated', (updatedDriver) => {
      setDrivers((prevDrivers) =>
        prevDrivers.map((driver) => (driver._id === updatedDriver._id ? updatedDriver : driver))
      );
      setFilteredDrivers((prevDrivers) =>
        prevDrivers.map((driver) => (driver._id === updatedDriver._id ? updatedDriver : driver))
      );
    });

    socket.on('driverDeleted', (deletedDriver) => {
      setDrivers((prevDrivers) => prevDrivers.filter((driver) => driver._id !== deletedDriver._id));
      setFilteredDrivers((prevDrivers) => prevDrivers.filter((driver) => driver._id !== deletedDriver._id));
    });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    return () => {
      socket.off('fetchDriverOrdersForCountUpdated');
      socket.off('driverAdded');
      socket.off('driverUpdated');
      socket.off('driverDeleted');
    };
}, [startDate, endDate]);

  const handleSearch = (text) => {
    setSearchText(text);
    filterDrivers(text, startDate, endDate);
  };

  const filterDrivers = (searchText, startDate, endDate) => {
    const endDateInclusive = new Date(endDate);
    endDateInclusive.setDate(endDateInclusive.getDate() + 1);
    const startDateInclusive = new Date(startDate);
    startDateInclusive.setDate(startDateInclusive.getDate() - 1);
  
    const filtered = drivers
      .filter(driver =>
        (driver.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
         driver.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
         driver.phone.toString().includes(searchText))
      )
      .filter(driver => {
        const driverDate = new Date(driver.created_at);
        // Check if driverDate is valid
        return !isNaN(driverDate) && driverDate >= startDateInclusive && driverDate < endDateInclusive;
      });
  
    setFilteredDrivers(filtered);
  };

  const handleSortByDate = () => {
    const sorted = [...filteredDrivers].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return isAscending ? dateA - dateB : dateB - dateA;
    });
    setFilteredDrivers(sorted);
    setIsAscending(!isAscending);
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const applyFilters = () => {
    // Convert dates to ISO strings for backend
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();
  console.log('------------------------------------');
  console.log("start et and avant envoyer vers server ",startISO, endISO);
  console.log('------------------------------------');
    socket.emit('fetchDriverOrdersForCountUpdated', startISO, endISO);
    setShowFilterMenu(false);
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Total Business Revenue: €{totalRevenue.toFixed(2)}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone"
          value={searchText}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={handleSortByDate} style={styles.sortButton}>
          <Ionicons name="time-outline" size={24} color="#fff" />
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFilterMenu} style={styles.menuButton}>
          <Ionicons name="filter-outline" size={24} color="#fff" />
          <Text style={styles.menuButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredDrivers}
        renderItem={({ item }) => (
          <DriverItem
            item={item}
            scaleAnim={scaleAnim}
            fadeAnim={fadeAnim}
            handlePressIn={() => {
              Animated.spring(scaleAnim, {
                toValue: 0.95,
                friction: 5,
                useNativeDriver: true,
              }).start();
            }}
            handlePressOut={() => {
              Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
              }).start();
            }}
            onPress={() => setSelectedDriver(item)}
          />
        )}
        keyExtractor={item => item._id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={30}
        windowSize={7}
      />

      {selectedDriver && (
        <DriverDetailModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
        />
      )}

      {showFilterMenu && (
        <View style={styles.filterMenu}>
          <Text style={styles.menuTitle}>Filter Options</Text>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Start Date: {startDate.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>End Date: {endDate.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={applyFilters} style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate ;
            setShowStartDatePicker(Platform.OS === 'ios');
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
            const currentDate = selectedDate ;
            setShowEndDatePicker(Platform.OS === 'ios');
            setEndDate(currentDate);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbfbda',
    paddingTop: 10,
  },
  header: {
    padding: 10,
    backgroundColor: '#6472743e',
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#030e0f',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    height: 40,
    color: '#000',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#156974',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  sortButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e27a3f',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  menuButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  filterMenu: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    zIndex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: '#1f695a',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  dateButtonText: {
    color: '#fff',
  },
  filterButton: {
    backgroundColor: '#e27a3f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 10,
  },
});

export default DriverRevenueScreen;
