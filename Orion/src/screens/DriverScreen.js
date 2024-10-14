import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import io from 'socket.io-client';
import DriverCard from './../components/DriverCard';
import DriverModal from './../components/DriverModal';
import AddUserModal from './../components/AddDriverModal';
import { BASE_URLIO } from '@env';

export default function DriverScreen() {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterActivated, setFilterActivated] = useState('all');
  const [filterIsLogin, setFilterIsLogin] = useState('all');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isLoginDropdownVisible, setIsLoginDropdownVisible] = useState(false);

  const filters = [
    { label: "Filtrer par activation", value: "all" },
    { label: "Activé", value: "activated" },
    { label: "Désactivé", value: "deactivated" }
  ];

  const loginFilters = [
    { label: "Filtrer par connexion", value: "all" },
    { label: "Connecté", value: "loggedIn" },
    { label: "Déconnecté", value: "loggedOut" }
  ];

  useEffect(() => {
    const socket = io(BASE_URLIO);
    socket.emit('watchDrivers');
    socket.on('driversUpdated', ({ drivers }) => {
      setDrivers(drivers);
      applyFilters(drivers);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = (query) => {
    setSearchText(query);
    applyFilters(drivers, query, filterActivated, filterIsLogin);
  };

  const applyFilters = (drivers, searchQuery = searchText, activatedFilter = filterActivated, isLoginFilter = filterIsLogin) => {
    let filtered = drivers;

    if (searchQuery) {
      filtered = filtered.filter(driver =>
        driver.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.phone.toString().includes(searchQuery)
      );
    }

    if (activatedFilter !== 'all') {
      filtered = filtered.filter(driver =>
        activatedFilter === 'activated' ? driver.activated : !driver.activated
      );
    }

    if (isLoginFilter !== 'all') {
      filtered = filtered.filter(driver =>
        isLoginFilter === 'loggedIn' ? driver.isLogin : !driver.isLogin
      );
    }

    setFilteredDrivers(filtered);
  };

  const handleDropdownSelect = (value) => {
    setFilterActivated(value);
    setDropdownVisible(false);
    applyFilters(drivers, searchText, value, filterIsLogin);
  };

  const handleLoginDropdownSelect = (value) => {
    setFilterIsLogin(value);
    setIsLoginDropdownVisible(false);
    applyFilters(drivers, searchText, filterActivated, value);
  };

  const handleCardPress = (driver) => {
    setSelectedDriver(driver);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedDriver(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Liste des livreurs</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom ou téléphone..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Dropdowns */}
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setDropdownVisible(!isDropdownVisible)} style={styles.dropdownButton}>
          <Text>{filters.find(f => f.value === filterActivated)?.label || 'Filtrer'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLoginDropdownVisible(!isLoginDropdownVisible)} style={styles.dropdownButton}>
          <Text>{loginFilters.find(f => f.value === filterIsLogin)?.label || 'Filtrer par login'}</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal for Activation Filter */}
      {isDropdownVisible && (
        <View style={styles.dropdown}>
          {filters.map((filter) => (
            <TouchableOpacity key={filter.value} onPress={() => handleDropdownSelect(filter.value)}>
              <Text style={styles.dropdownItem}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Dropdown Modal for Login Filter */}
      {isLoginDropdownVisible && (
        <View style={styles.dropdown}>
          {loginFilters.map((filter) => (
            <TouchableOpacity key={filter.value} onPress={() => handleLoginDropdownSelect(filter.value)}>
              <Text style={styles.dropdownItem}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.cardContainer}>
        {filteredDrivers.length > 0 ? (
          filteredDrivers.map(driver => (
            <DriverCard key={driver._id} driver={driver} onPress={() => handleCardPress(driver)} />
          ))
        ) : (
          <Text>Aucun livreur disponible</Text>
        )}
      </ScrollView>

      <DriverModal
        visible={isModalVisible}
        onClose={closeModal}
        driver={selectedDriver}
      />

      <AddUserModal modalVisible={addModalVisible} setModalVisible={setAddModalVisible} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9', // Light background
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#38435A', // Dark grey for titles
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingLeft: 15,
    borderColor: '#DDD', // Light grey border
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#FFF', // White input background
    color: '#111827', // Dark text color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginRight: 10,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#5A67D8', // Primary button color
    borderRadius: 12, // Rounded corners for buttons
  },
  addButtonText: {
    color: '#FFFFFF', // White text for contrast
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: '#EEE', // Subtle background for filter options
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  dropdownButton: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5A67D8', // Primary theme color for dropdown buttons
    borderRadius: 12,
    marginHorizontal: 5,
  },
  dropdownButtonText: {
    color: '#FFFFFF', // White text for dropdown buttons
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginVertical: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0', // Light grey for dropdown item borders
  },
  cardContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

