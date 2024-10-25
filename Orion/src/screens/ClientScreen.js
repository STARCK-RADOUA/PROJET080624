import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, FlatList, Platform } from 'react-native';
import io from 'socket.io-client';
import ClientCard from './../components/ClientCard';
import ClientModal from './../components/ClientModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native';
import { BASE_URLIO } from '@env';
export default function ClientScreen() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterActivated, setFilterActivated] = useState('all'); // Filter for activated
  const [filterIsLogin, setFilterIsLogin] = useState('all');     // Filter for login
  const [isDropdownVisible, setDropdownVisible] = useState(false); // Dropdown state
  const [isLoginDropdownVisible, setIsLoginDropdownVisible] = useState(false); // Login dropdown

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

    socket.emit('watchClients');
    socket.on('clientsUpdated', ({ clients }) => {
      setClients(clients);
      applyFilters(clients);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = (query) => {
    setSearchText(query);
    applyFilters(clients, query, filterActivated, filterIsLogin);
  };

  const applyFilters = (clients, searchQuery = searchText, activatedFilter = filterActivated, isLoginFilter = filterIsLogin) => {
    let filtered = clients;

    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.toString().includes(searchQuery)
      );
    }

    if (activatedFilter !== 'all') {
      filtered = filtered.filter(client =>
        activatedFilter === 'activated' ? client.activated : !client.activated
      );
    }

    if (isLoginFilter !== 'all') {
      filtered = filtered.filter(client =>
        isLoginFilter === 'loggedIn' ? client.isLogin : !client.isLogin
      );
    }

    setFilteredClients(filtered);
  };

  const handleDropdownSelect = (value) => {
    setFilterActivated(value);
    setDropdownVisible(false);
    applyFilters(clients, searchText, value, filterIsLogin);
  };

  const handleLoginDropdownSelect = (value) => {
    setFilterIsLogin(value);
    setIsLoginDropdownVisible(false);
    applyFilters(clients, searchText, filterActivated, value);
  };
  
  const handleCardPress = (client) => {
    setSelectedClient(client);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedClient(null);
  };


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Liste des clients</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom ou téléphone..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={(text) => handleSearch(text)}
        />
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
        {filteredClients.length > 0 ? (
          filteredClients.map(client => (
            <ClientCard key={client._id} client={client} onPress={() => handleCardPress(client)} />
          ))
        ) : (
          <Text>Aucun client disponible</Text>
        )}
      </ScrollView>

      <ClientModal
        visible={isModalVisible}
        onClose={() => closeModal()}
        client={selectedClient}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9', // Light background
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
