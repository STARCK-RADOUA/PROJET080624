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
  const [sortOrder, setSortOrder] = useState('asc'); // Track sort order (ascending or descending)

  // Fetch the QR data using Axios
  useEffect(() => {
    const fetchQrData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/qr-codes/getForAdmin`);
        setQrData(response.data);
        setFilteredData(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
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

  // Sort QR data by expiration date
  const sortByDate = () => {
    const sortedData = [...filteredData].sort((a, b) => {
      const dateA = new Date(a.expirationTime);
      const dateB = new Date(b.expirationTime);

      // Ascending or descending sorting based on sortOrder
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredData(sortedData);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Toggle sort order
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
        placeholder="Rechercher par nom, téléphone, identifiant de l'appareil ou identifiant QR"
        value={searchText}
        onChangeText={handleSearch}
      />

      {/* Filter buttons */}
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

      {/* Sort Button */}
      <TouchableOpacity style={styles.sortButton} onPress={sortByDate}>
        <Text style={styles.sortButtonText}>
          Trier par date {sortOrder === 'asc' ? '⬆️' : '⬇️'}
        </Text>
      </TouchableOpacity>

      {/* Display the QR Cards */}
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
                  <Text style={styles.cardTitle}>
                    {qr.type === 'Driver' ? (
                      <>
                        <Text style={styles.clientName}>
                          {qr.clientInfo?.firstName ? "🤝 " + qr.clientInfo.firstName : '❓Un inconnu'} {qr.clientInfo?.lastName ? qr.clientInfo.lastName : ''}
                        </Text>
                        {'\n'} parrainé par le livreur {'\n'}
                        <Text style={styles.driverName}>
                          {qr.userInfo?.firstName ? "🚚 " + qr.userInfo.firstName : ''} {qr.userInfo?.lastName ? qr.userInfo.lastName : ''}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.clientName}>
                          {qr.clientInfo?.firstName ? "🤝 " + qr.clientInfo.firstName : '❓Un inconnu'}
                        </Text>
                        {'\n'} parrainé par le client {'\n'}
                        <Text style={styles.driverName}>
                          {qr.userInfo?.firstName ? "🧑‍💼 " + qr.userInfo.firstName : ''} {qr.userInfo?.lastName ? qr.userInfo.lastName : ''}
                        </Text>
                      </>
                    )}
                  </Text>
                  <Text style={styles.cardSubtitle}>Expires: {new Date(qr.expirationTime).toLocaleString()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No QR codes found</Text>
        )}
      </ScrollView>

      {/* QR Code Modal */}
     

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

        <Text style={styles.modalTitle}>📜 Détails du QR Code</Text>

<View style={styles.fieldRow}>
<Text style={styles.label}>🔢 QR Code:</Text>
<Text style={styles.textValue}>{selectedQr.qr}</Text>
</View>

<View style={styles.fieldRow}>
<Text style={styles.label}>⏳ Expire le:</Text>
<Text style={styles.textValue}>{new Date(selectedQr.expirationTime).toLocaleString()}</Text>
</View>

<View style={styles.fieldRow}>
<Text style={styles.label}>👨‍💼 Auteur du code de parrainage:</Text>
<Text style={styles.textValue}>{selectedQr.userInfo.firstName} {selectedQr.userInfo.lastName}</Text>
</View>

<View style={styles.fieldRow}>
<Text style={styles.label}>🛠️ Type de générateur:</Text>
<Text style={styles.textValue}>{selectedQr.type}</Text>
</View>

<View style={styles.fieldRow}>
<Text style={styles.label}>📞 Téléphone de générateur:</Text>
<Text style={styles.textValue}>+33 {selectedQr.userInfo.phone}</Text>
</View>

<View style={styles.fieldRow}>
<Text style={styles.label}>💻 Device ID de générateur:</Text>
<Text style={styles.textValue}>{selectedQr.deviceId}</Text>
</View>

<View style={styles.fieldRow}>
<Text style={styles.label}>💻 Device ID de Scanneur:</Text>
<Text style={styles.textValue}>
{selectedQr.newclientDeviceId ? selectedQr.newclientDeviceId : '❓ Inconnu'}
</Text>
</View>

<View style={styles.fieldRow}>
<Text style={styles.label}>🧑‍💼 Scanneur du code:</Text>
<Text style={styles.textValue}>
{selectedQr.clientInfo?.firstName ? selectedQr.clientInfo.firstName : '❓ Inconnu'}
{selectedQr.clientInfo?.lastName ? ' ' + selectedQr.clientInfo.lastName : ''}
</Text>
</View>

<View style={styles.fieldRow}>
<Text style={styles.label}>📞 Téléphone de Scanneur:</Text>
<Text style={styles.textValue}>
{selectedQr.clientInfo?.phone ? `+33 ${selectedQr.clientInfo.phone}` : '❓ Inconnu'}
</Text>
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
    backgroundColor: '#F9F9F9', // Light background for a clean look
  },
  searchInput: {
    height: 50,
    borderColor: '#DDD', // Light grey border
    borderWidth: 1,
    borderRadius: 12, // Rounded corners for a modern feel
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#FFF', // White background for input
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  listContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#EEE', // Subtle background for filter options
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  listItem: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10, // Rounded button
    marginHorizontal: 5,
  },
  selectedListItem: {
    backgroundColor: '#5A67D8', // Indigo color for selected filter
  },
  listItemText: {
    color: '#555', // Dark grey text
    fontSize: 14,
  },
  sortButton: {
    backgroundColor: '#5A67D8',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  sortButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  card: {
    width: Dimensions.get('window').width - 40,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#4A5568', // Dark grey placeholder for QR
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748', // Dark grey text
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#718096', // Light grey for subtitles
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Dark overlay for modal
  },
  modalView: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2B6CB0', // Blue text for title
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldRow: {
    flexDirection: 'column', // Stack items vertically
    alignItems: 'flex-start', // Align items to the start of the container
    marginVertical: 10, // Maintain some space between rows
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
    color: '#2b70e7', // Blue color for labels
    marginBottom: 5, // Add space below the label
  },
  textValue: {
    marginLeft: 20, //
    fontSize: 16,
    color: '#1A202C', // Black text for values
    textAlign: 'left', // Align text to the left
    marginBottom: 5, // Add space below the value
  },
  separator: {
    height: 1,
    backgroundColor: '#CBD5E0', // Light grey separator
    marginVertical: 10,
  },
  skeletonCard: {
    width: Dimensions.get('window').width - 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  skeletonPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 15,
  },
  skeletonText: {
    width: '70%',
    height: 20,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    marginVertical: 5,
  },
});


export default QrScreen;
