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

    // Listen for the updated services data
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
            placeholder="Search by name..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <Text style={styles.addButtonText}>Add</Text>
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
          <Text style={styles.noResultsText}>No services found</Text>
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
