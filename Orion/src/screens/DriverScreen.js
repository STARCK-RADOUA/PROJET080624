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
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f3b13e',
    borderColor: '#f3b13e',
    borderWidth: 1,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdownButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  dropdown: {
    position: 'absolute',
    top: 150,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    zIndex: 9999,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
