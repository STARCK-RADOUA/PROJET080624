import React, { useState, useEffect } from 'react'; 
import {
  Modal,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL, BASE_URLIO } from '@env';
import io from 'socket.io-client';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const ClientModal = ({ visible, onClose, client }) => {
  // Initialize hooks at the top level
  const [editableClient, setEditableClient] = useState(client ? { ...client } : null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  // Connexion Socket.IO pour l'activation/désactivation
  const socket = io(BASE_URLIO);

  useEffect(() => {
    if (client) {
      setEditableClient({ ...client });
    } else {
      setEditableClient(null);
    }
  }, [client]);

  useEffect(() => {
    const fetchBlockedStatus = async () => {
      if (!editableClient || !editableClient._id) return;
  
      try {
        // Make an Axios call to get the blocked status of the client
        const response = await axios.get(`${BASE_URL}/api/clients/statuss`, {
          params: { clientId: editableClient._id },  // Send the clientId in the request params
        });
  
        const blockedStatus = response.data.blocked; // Assuming the response contains a blocked field
  
        // Only update the state if the blocked status has changed
        if (editableClient.blocked !== blockedStatus) {
          setEditableClient((prevClient) => ({
            ...prevClient,
            blocked: blockedStatus, // Initialize blocked status
          }));
        }
      } catch (error) {
        console.error('Error fetching blocked status:', error);
      }
    };
  
    // Only trigger fetch if editableClient and its _id are valid
    if (editableClient && editableClient._id) {
      fetchBlockedStatus();
    }
  }, [editableClient?._id]); // Only run this effect when the client._id changes
  

  const fetchHistory = async () => {
    if (!client) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/history/${client._id}`);
      setHistoryData(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de l’historique:', error);
    }
  };

  const handleActivateDeactivate = (isActive) => {
    try {
      setEditableClient((prevClient) => ({
        ...prevClient,
        activated: isActive,
      }));
      socket.emit('adminActivateDeactivateClient', {
        clientId: editableClient._id,
        isActive,
        deviceId: editableClient.deviceId,
      });
      Alert.alert('Succès', `Client ${isActive ? 'activé' : 'désactivé'} avec succès.`);
    } catch (error) {
      console.error('Erreur lors de l’activation/désactivation du client:', error);
      Alert.alert('Erreur', 'Échec de la mise à jour de l’état d’activation.');
      setEditableClient((prevClient) => ({
        ...prevClient,
        activated: !isActive,
      }));
    }
  };

  const handleToggleLoginStatus = () => {
    try {
      const newLoginStatus = !editableClient.isLogin;
      setEditableClient((prevClient) => ({
        ...prevClient,
        isLogin: newLoginStatus,
      }));
      socket.emit('adminToggleLoginStatus', {
        clientId: editableClient._id,
        deviceId: editableClient.deviceId,
      });
      Alert.alert('Succès', `État de connexion ${newLoginStatus ? 'activé' : 'désactivé'} avec succès.`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l’état de connexion:', error);
      Alert.alert('Erreur', 'Échec de la mise à jour de l’état de connexion.');
      setEditableClient((prevClient) => ({
        ...prevClient,
        isLogin: !prevClient.isLogin,
      }));
    }
  };

  const handleBlockUnblock = async (isBlocked) => {
    try {
      // Send a PATCH request to the backend to update the block status
      const response = await axios.put(`${BASE_URL}/api/clients/block-unblock/`, {
        clientId: editableClient._id, // Send the clientId in the request body
        isBlocked: isBlocked,   
        
      });
  
      // If the request is successful, update the local state
      setEditableClient((prevClient) => ({
        ...prevClient,
        blocked: isBlocked,
      }));
  
      // Show success message
      Alert.alert('Succès', `Client ${isBlocked ? 'bloqué' : 'débloqué'} avec succès.`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du blocage/déblocage du client:', error);
      Alert.alert('Erreur', 'Échec de la mise à jour du blocage/déblocage.');
  
      // If there is an error, revert the block status to its previous state
      setEditableClient((prevClient) => ({
        ...prevClient,
        blocked: !isBlocked,
      }));
    }
  };

  const openInWaze = (location) => {
    const [latitude, longitude] = location.split(' ');
    const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    Linking.openURL(wazeUrl);
  };

  // Handle the case where editableClient is null
  if (!editableClient) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={30} color="#333" />
          </TouchableOpacity>

          <Text style={styles.name}>
            {editableClient.firstName} {editableClient.lastName}
          </Text>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => {
              setHistoryVisible(!historyVisible);
              fetchHistory();
            }}
          >
            <Ionicons name="time-outline" size={24} color="#5A67D8" />
            <Text style={styles.historyText}>Historique des connexions</Text>
          </TouchableOpacity>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Téléphone:</Text>
            <Text style={styles.textValue}>+33 {editableClient.phone}</Text>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldColumn}>
              <Text style={styles.label}>ID de l'appareil:</Text>
              <Text style={styles.textValue}>
                {editableClient.deviceId}
              </Text>
            </View>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Points accumulés:</Text>
            <Text style={styles.textValue}>{editableClient.points_earned}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Type d'utilisateur:</Text>
            <Text style={styles.textValue}>{editableClient.userType}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Activé:</Text>
            <Switch
              value={editableClient.activated}
              onValueChange={handleActivateDeactivate}
              thumbColor={editableClient.activated ? '#34C759' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Statut de connexion:</Text>
            <Switch
              value={editableClient.isLogin}
              onValueChange={handleToggleLoginStatus}
              thumbColor={editableClient.isLogin ? '#34C759' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
            />
          </View>

          {/* New Block/Unblock Switch */}
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Bloqué:</Text>
            <Switch
              value={editableClient.blocked}
              onValueChange={handleBlockUnblock}
              thumbColor={editableClient.blocked ? '#FF3B30' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#FF6347' }}
            />
          </View>

          {historyVisible && (
            <FlatList
              data={historyData}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <Text style={styles.historyDescription}>
                    {item.description}
                  </Text>
                  <Text style={styles.historyDate}>
                    {moment(item.dateAction).format('YYYY-MM-DD HH:mm')}
                  </Text>
                  <TouchableOpacity
                    style={styles.wazeButton}
                    onPress={() => openInWaze(item.location)}
                  >
                    <Ionicons name="navigate-outline" size={20} color="white" />
                    <Text style={styles.wazeButtonText}>
                      Ouvrir dans Waze
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    maxHeight: height * 0.9,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  historyText: {
    color: '#5A67D8',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  textValue: {
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#CED4DA',
    marginVertical: 15,
  },
  historyItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#2330a534',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 2,
  },
  historyDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  wazeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34A853',
    padding: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  wazeButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  fieldColumn: {
    marginVertical: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  textValue: {
    fontSize: 16,
    color: '#333',
  },
});

export default ClientModal;
