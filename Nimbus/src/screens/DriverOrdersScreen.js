import React, { useState, useContext, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Switch, Image, Alert, Linking } from 'react-native';
import { io } from 'socket.io-client';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import OrderDetailModal from '../components/OrderDetailModal';
import { BASE_URLIO, BASE_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Device from 'expo-device';
import { LocationContext } from '../utils/LocationContext';
import { navigate } from '../utils/navigationRef';
import moment from 'moment';
import { fetchDriverId, updateDriverAvailability, openGoogleMaps, openWaze, getDeviceId } from '../utils/driverOrderUtils';
import styles from './styles/styles'; 

const DriverOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState(null);
  const [driverInfo, setDriverInfo] = useState({ firstName: '', lastName: '' });
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSwitchDisabled, setIsSwitchDisabled] = useState(false);
  const [activeStatusMessage, setActiveStatusMessage] = useState('Fetching status...');
  const { startTracking, stopTracking, isTracking } = useContext(LocationContext);

  useEffect(() => {
    getDeviceId(setDeviceId);
    startTracking(deviceId);
  }, []);

  useEffect(() => {
    if (deviceId) {
      fetchDriverId(deviceId, setDriverId, setDriverInfo, setActiveStatusMessage);
      startTracking(deviceId);
    }
  }, [deviceId]);

  useEffect(() => {
      const socket = io(BASE_URLIO, {
        query: { deviceId },
      });

      socket.emit('driverConnected', deviceId);

      socket.on('connect', () => startTracking(deviceId));
      socket.on('orderInprogressUpdatedForDriver', (data) => {
        console.log('------------------------------------');
        console.log(data);
        console.log('------------------------------------');
        setOrders(data.orders || []);
        setLoading(false);
        setIsEnabled(data.active);
      });

   
    
  }, [deviceId]);


  const confirmLogout = () => {
    // Affiche une alerte de confirmation avant la déconnexion
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          onPress: () => console.log('Déconnexion annulée'),
          style: 'cancel',
        },
        {
          text: 'Déconnecter',
          onPress: () => logout(), // Appelle la fonction logout si l'utilisateur confirme
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };
  
  const logout = async () => {
    const deviceId = Device.osBuildId;
    console.log('------------------------------------');
    console.log('Logging out...', deviceId);
    console.log('------------------------------------');
  
    try {
      const response = await fetch(`${BASE_URL}/api/clients/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('------------------------------------');
        console.log('Logout successful');
        console.log('------------------------------------');
        navigation.replace('Login');
      } else {
        Alert.alert('Déconnexion échouée', data.errors ? data.errors.join(', ') : data.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue pendant la déconnexion.');
    } finally {
      setLoading(false);
    }
  };
  



  const toggleSwitch = () => {
    const newIsEnabled = !isEnabled;
    setIsEnabled(newIsEnabled);
    updateDriverAvailability(driverId, newIsEnabled);
  };

  const handleCardPress = (order) => setSelectedOrder(order);
  const handleCloseModal = () => setSelectedOrder(null);

  return (
    <View style={styles.container}>
<View style={[styles.headerh, {
  shadowColor: !isEnabled ? '#7a2424' : '#28919b', // Rouge si désactivé, vert sinon
}]}>
        <View style={styles.headerv}>
          <TouchableOpacity style={styles.qr} onPress={() => navigate('QrcodeGeneratorDriverScreen')}>
            <Icon name="qrcode-scan" size={45} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Driver Availability</Text>
          <Switch
            trackColor={{ false: '#7a2424', true: '#1c7745' }}
            thumbColor={isEnabled ? '#36d815' : '#ca6411'}
            onValueChange={toggleSwitch}
            value={isEnabled}
            disabled={isSwitchDisabled}
          />
        </View>
        <Text style={styles.statusText}>{`${driverInfo.firstName} ${driverInfo.lastName}`}</Text>
      </View>

      {isEnabled ? (
        <>
        <View style={styles.container2}>
          <FlatList
            data={loading ? Array.from({ length: 3 }) : orders}
            keyExtractor={(item, index) => item?._id || index.toString()}
            renderItem={({ item }) =>
              loading ? (
                <>
                  <View style={styles.shimmerContainer} />
                </>
              ) : (
                <TouchableOpacity onPress={() => handleCardPress(item)}>
                  <View style={styles.card}>
                    <Image
                      source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/order-history.png' }}
                      style={styles.orderIcon}
                    />
                    <View style={styles.cardContent}>
                      <Text style={styles.orderNumber}>Order #{item.order_number || 'N/A'}</Text>
                      <Text style={styles.address_line}>{item.address_line || 'No Address Provided'}</Text>
                      <View style={styles.fieldRow}>
                        <TouchableOpacity style={styles.navigateButtonGoogle} onPress={() => openGoogleMaps(item.location)}>
                          <Ionicons name="navigate-outline" size={24} color="white" />
                          <Text style={styles.navigateText}>Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navigateButtonWaze} onPress={() => openWaze(item.location)}>
                          <Ionicons name="navigate-outline" size={24} color="white" />
                          <Text style={styles.navigateText}>Waze</Text>
                        </TouchableOpacity>
                         <TouchableOpacity style={styles.navigateButtonChat} onPress={() => openWaze(item.location)}>
                          <Ionicons name="send-outline" size={24} color="white" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.date}>
                        {moment(item.delivery_time).format('YYYY-MM-DD HH:mm') || 'No Delivery Time'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            }
          /> 
         
        </View>
        <View style={styles.footer }>
          <TouchableOpacity style={styles.navigateButtonSupportChat} onPress={() => confirmLogout()}>
                          <Ionicons name="log-out-outline" size={24} color="white" />
                          <Text style={styles.navigateText}>Quiter   </Text>
                          <Ionicons name="log-out-outline" size={24} color="white" />

                        </TouchableOpacity>
                         <TouchableOpacity style={styles.navigateButtonStop} onPress={() => navigate('SupportChat')}>
                          <Ionicons name="send-outline" size={30} color="white" />
                        </TouchableOpacity>
        </View>
        </>

       

      ) : (
        <View style={styles.disabledView}>
          <Text style={styles.disabledText}>Please enable availability to view orders.</Text>
          <TouchableOpacity style={styles.navigateButton} onPress={() => navigate('SupportChat')}>
            <Text style={styles.navigateButtonText}>Go to CHAT</Text>
          </TouchableOpacity> 
         
        </View>
      )}

      {selectedOrder && <OrderDetailModal visible={!!selectedOrder} onClose={handleCloseModal} order={selectedOrder} />}
    </View>
  );
};

export default DriverOrdersScreen;
