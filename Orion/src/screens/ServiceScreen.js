import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';
import AddServiceModal from '../components/AddServiceModal';
import ServiceCard from '../components/ServiceCard';
import ServiceModal from '../components/ServiceModal';

const ServiceScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const socket = io(BASE_URLIO);

    // Écouter les données mises à jour des services
    socket.on('servicesUpdated', ({ services }) => {
      setServices(services);
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenServiceModal = (service) => {
    setSelectedService(service);
    setServiceModalVisible(true);
  };

  const handleCloseServiceModal = () => {
    setServiceModalVisible(false);
    setSelectedService(null);
  };

  const renderSkeleton = () => (
    <>
      {[...Array(3)].map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonDescription} />
        </View>
      ))}
    </>
  );

  return (
    <View style={styles.appContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Services</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.cardList}>
        {loading ? (
          renderSkeleton()
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service, index) => (
            <ServiceCard key={index} service={service} onReadMore={() => handleOpenServiceModal(service)} />
          ))
        ) : (
          <Text style={styles.noResultsText}>Aucun service trouvé</Text>
        )}
      </ScrollView>

      <AddServiceModal modalVisible={addModalVisible} setModalVisible={setAddModalVisible} />
      <ServiceModal
        visible={serviceModalVisible}
        onClose={handleCloseServiceModal}
        service={selectedService}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9', // Light background for modern look
  },
  headerContainer: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827', // Dark grey for bold title
    marginBottom: 10,
    textAlign: 'center', // Centered title for balance
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingLeft: 15,
    borderColor: '#E5E7EB', // Light grey border for clean look
    borderWidth: 1,
    borderRadius: 12, // Rounded corners for modern feel
    backgroundColor: '#F3F4F6', // Light background for input
    color: '#1F2937', // Dark text color for readability
    marginRight: 10,
    shadowColor: '#000', // Subtle shadow for elevation
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#5A67D8', // Vibrant green for call-to-action
    borderRadius: 12,
    elevation: 2,
  },
  addButtonText: {
    color: '#FFF', // White text for contrast
    fontSize: 16,
    fontWeight: '600',
  },
  cardList: {
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280', // Medium grey for "no results" text
    textAlign: 'center',
    marginTop: 20,
  },
  skeletonCard: {
    height: 100,
    backgroundColor: '#E5E7EB', // Light grey for skeleton loading
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  skeletonTitle: {
    width: '50%',
    height: 20,
    backgroundColor: '#D1D5DB', // Grey for skeleton title
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonDescription: {
    width: '80%',
    height: 15,
    backgroundColor: '#D1D5DB', // Grey for skeleton description
    borderRadius: 4,
  },
});

export default ServiceScreen;
