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
            style={[styles.listItem, selectedType === type.toLowerCase() && styles.selectedListItem]}
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
          <Text>Aucun Qr trouvé</Text>
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
                <Ionicons name="close-circle" size={40} color="black" />
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

            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f7f7f7' },
  searchInput: { height: 40, borderColor: '#ccc', borderWidth: 1, paddingLeft: 10, borderRadius: 5 },
  listContainer: { flexDirection: 'row', marginVertical: 10 },
  listItem: { padding: 10, backgroundColor: '#e0e0e0', borderRadius: 5, marginRight: 5 },
  selectedListItem: { backgroundColor: '#81c784' },
  listItemText: { color: '#000', fontSize: 16 },
  sortButton: { padding: 10, backgroundColor: '#4caf50', marginVertical: 10, borderRadius: 5 },
  sortButtonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  cardContainer: { paddingBottom: 10 },
  card: { flexDirection: 'row', backgroundColor: '#ffffff', padding: 10, marginBottom: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  cardContent: { flexDirection: 'row', flex: 1 },
  qrPlaceholder: { backgroundColor: '#2196f3', padding: 10, borderRadius: 10, marginRight: 15 },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 14, color: '#666' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  fieldRow: { flexDirection: 'row', marginBottom: 10 },
  label: { fontWeight: 'bold', flex: 1 },
  textValue: { flex: 2, color: '#333' },
  skeletonCard: { backgroundColor: '#e0e0e0', padding: 15, borderRadius: 10, marginBottom: 10 },
  skeletonPlaceholder: { backgroundColor: '#ccc', height: 15, width: '80%', borderRadius: 5, marginBottom: 10 },
  skeletonText: { backgroundColor: '#ccc', height: 10, width: '60%', borderRadius: 5, marginBottom: 5 },
});

export default QrScreen;
