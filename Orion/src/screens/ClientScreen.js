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
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
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
