import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';
import AddServiceModal from '../components/AddServiceModal';
import ServiceCard from '../components/ServiceCard';
import ServiceModal from '../components/ServiceModal';

const ServiceScreen = () => {
  const [services, setServices] = useState([]);      // List of services fetched from the backend
  const [loading, setLoading] = useState(true);      // Loading state for skeleton placeholder
  const [searchText, setSearchText] = useState('');  // Search text for filtering services
  const [addModalVisible, setAddModalVisible] = useState(false);  // State for Add Service modal visibility
  const [serviceModalVisible, setServiceModalVisible] = useState(false);  // State for Service Details modal visibility
  const [selectedService, setSelectedService] = useState(null);   // State for the selected service details

  useEffect(() => {
    console.log('Attempting to connect to the socket server...');
    const socket = io(BASE_URLIO);

    // Emit the event to start watching services
    socket.emit('watchServices');
    console.log('watchServices event emitted');

    // Listen for updates from the server
    socket.on('servicesUpdated', ({ services }) => {
      console.log('servicesUpdated event received:', services);
      setServices(services); // Update the services state with the new data
      setLoading(false); // Set loading to false after receiving the data
    });

    // Log if there's an error connecting to the socket
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Log when the socket is connected
    socket.on('connect', () => {
      console.log('Connected to the socket server');
    });

    // Log when the socket is disconnected
    socket.on('disconnect', () => {
      console.log('Disconnected from the socket server');
    });

    // Cleanup on component unmount
    return () => {
      console.log('Disconnecting from socket server...');
      socket.disconnect();
    };
  }, []);

  // Filter services based on search input (by name)
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Open the service details modal
  const handleOpenServiceModal = (service) => {
    setSelectedService(service);
    setServiceModalVisible(true);
  };

  // Close the service details modal
  const handleCloseServiceModal = () => {
    setServiceModalVisible(false);
    setSelectedService(null);
  };

  // Render custom skeleton loader for loading state
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
      {/* Header with Search Input */}
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Services</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}  // Update search text state
          />
          <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable List of Services */}
      <ScrollView contentContainerStyle={styles.cardList}>
        {loading ? (
          renderSkeleton()  // Render custom skeleton during loading
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service, index) => (
            <ServiceCard key={index} service={service} onReadMore={() => handleOpenServiceModal(service)} />
          ))
        ) : (
          <Text style={styles.noResultsText}>No services found</Text>
        )}
      </ScrollView>

      {/* Add Service Modal */}
      <AddServiceModal modalVisible={addModalVisible} setModalVisible={setAddModalVisible} />

      {/* Service Details Modal */}
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
    padding: 10,
    backgroundColor: 'white',
  },
  headerContainer: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '500',
  },
  cardList: {
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
    textAlign: 'center',
  },
  skeletonCard: {
    height: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
  },
  skeletonTitle: {
    width: '50%',
    height: 20,
    backgroundColor: '#d4d4d4',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonDescription: {
    width: '80%',
    height: 15,
    backgroundColor: '#d4d4d4',
    borderRadius: 4,
  },
});

export default ServiceScreen;
