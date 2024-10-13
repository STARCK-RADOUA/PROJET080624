import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env'; 
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

const QrScreen = () => {
  const [qrData, setQrData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedQr, setSelectedQr] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('tous');
  const [loading, setLoading] = useState(true);

  // Fetch the QR data using Axios
  useEffect(() => {
    const fetchQrData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/qr-codes/getForAdmin`);
        setQrData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQrData(); 
  }, []);

  // Unified filter logic: it filters based on both search text and selected type
  const applyFilter = (query, type) => {
    const filtered = qrData.filter(item => {
      const matchesType = 
        type === 'tous' || 
        (type === 'driver' && item.type === 'Driver') || 
        (type === 'client' && item.type === 'Client');
      
      const matchesQuery = 
        item.userInfo.firstName.toLowerCase().includes(query.toLowerCase()) ||
        item.userInfo.lastName.toLowerCase().includes(query.toLowerCase()) ||
        item.userInfo.phone.toString().includes(query) ||
        item.deviceId.includes(query) ||
        item.id.includes(query);

      return matchesType && matchesQuery;
    });
    setFilteredData(filtered);
  };

  // This handles typing in the search box
  const handleSearch = (query) => {
    setSearchText(query);
    applyFilter(query, selectedType);
  };

  // Handle the filter buttons click
  const handleTypeChange = (type) => {
    setSelectedType(type.toLowerCase());
    applyFilter(searchText, type.toLowerCase());
  };

  const handleCardPress = (qr) => {
    setSelectedQr(qr);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedQr(null);
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonPlaceholder} />
      <View style={styles.skeletonText} />
      <View style={styles.skeletonText} />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name, phone, deviceId, or QR id"
        value={searchText}
        onChangeText={handleSearch}
      />

      <View style={styles.listContainer}>
        {['Tous', 'Driver', 'Client'].map((type, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.listItem,
              selectedType === type.toLowerCase() && styles.selectedListItem,
            ]}
            onPress={() => handleTypeChange(type)}
          >
            <Text style={styles.listItemText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.cardContainer}>
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <View key={index}>{renderSkeleton()}</View>
          ))
        ) : filteredData.length > 0 ? (
          filteredData.map(qr => (
            <TouchableOpacity key={qr.id} style={styles.card} onPress={() => handleCardPress(qr)}>
              <View style={styles.cardContent}>
                <View style={styles.qrPlaceholder}>
                <Icon name="qrcode-scan" size={45} color="#fff" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>QR: {qr.qr}</Text>
                  <Text style={styles.cardSubtitle}>Expires: {new Date(qr.expirationTime).toLocaleString()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No QR codes found</Text>
        )}
      </ScrollView>

      {selectedQr && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Ionicons name="close-circle" size={30} color="black" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>QR Details</Text>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>QR Code:</Text>
                <Text style={styles.textValue}>{selectedQr.qr}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Expires:</Text>
                <Text style={styles.textValue}>{new Date(selectedQr.expirationTime).toLocaleString()}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>User:</Text>
                <Text style={styles.textValue}>{selectedQr.userInfo.firstName} {selectedQr.userInfo.lastName}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>User Device ID:</Text>
                <Text style={styles.textValue}>{selectedQr.deviceId}</Text>
              </View>
              
              <View style={styles.fieldRow}>
                <Text style={styles.label}>User Type: </Text>
                <Text style={styles.textValue}>{selectedQr.type}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>New Client Device ID:</Text>
                <Text style={styles.textValue}>{selectedQr.newclientDeviceId}</Text>
              </View>
              
              <View style={styles.separator} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFF',
  },
  searchInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    padding: 10,
  },
  listItem: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedListItem: {
    backgroundColor: '#e27a3f',
    borderRadius: 5,
  },
  listItemText: {
    color: '#000',
  },
  cardContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  card: {
    width: Dimensions.get('window').width - 40,
    backgroundColor: '#c0bbaf',
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#110a0a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  qrText: {
    color: '#555',
    fontWeight: 'bold',
  },
  textContainer: {
    marginLeft: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalView: {
    width: '85%',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1f695a',
    textAlign: 'center',
    marginVertical: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    color: '#ddd',
    flex: 1,
  },
  textValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: '#555',
    marginVertical: 15,
  },
  // Skeleton styles
  skeletonCard: {
    width: Dimensions.get('window').width - 40,
    backgroundColor: '#EAD8B1',
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  skeletonPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
  },
  skeletonText: {
    width: '80%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginVertical: 5,
  },
});

export default QrScreen;