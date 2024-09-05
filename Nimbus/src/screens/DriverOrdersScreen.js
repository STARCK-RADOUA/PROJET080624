import React, { useState,useContext, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Switch, Image, Alert, Dimensions } from 'react-native';
import { io } from 'socket.io-client';
import moment from 'moment';
import { AppState } from 'react-native';

import OrderDetailModal from '../components/OrderDetailModal';
import { BASE_URLIO ,BASE_URL} from '@env';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Device from 'expo-device';
import { LocationContext } from '../utils/LocationContext'; // Import the LocationContext

const { width, height } = Dimensions.get('window');

const DriverOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState(null);
  const [driverInfo, setDriverInfo] = useState({ firstName: '', lastName: '' });
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSwitchDisabled, setIsSwitchDisabled] = useState(false);
  const [activeStatusMessage, setActiveStatusMessage] = useState('Fetching status...');
  const { startTracking } = useContext(LocationContext); 
  const socket = io(BASE_URLIO);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const fetchAndSetDeviceId = async () => {
setDeviceId(Device.osBuildId);    };
    fetchAndSetDeviceId();
    startTracking(Device.osBuildId);

  }, []);

  useEffect(() => {
    if (deviceId) {
      fetchDriverId();
      startTracking(deviceId);

    }
  }, [deviceId]);
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        // Reconnect logic when app comes to the foreground
        socket.connect();
        startTracking(deviceId);

      }

      if (nextAppState === 'background') {
        console.log('App is in the background or closed');
        // Disconnect logic when app goes to the background or is closed
        socket.disconnect();
      }

      setAppState(nextAppState);
    };

    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [appState]);


  useEffect(() => {
    if (driverId) {
      socket.emit('driverConnected', driverId);

      socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      socket.on('orderActiveChanged', (data) => {
        if (data.active) {
          setIsSwitchDisabled(true);
          setIsEnabled(true);
          setActiveStatusMessage('Order is active');
        } else {
          setIsSwitchDisabled(false);
          setIsEnabled(false);
          setActiveStatusMessage('Order is inactive');
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [driverId]);

  const updateDriverAvailability = async (newIsEnabled) => {
    try {
      if (driverId) {
        await axios.post(`${BASE_URL}/api/driver/updateAvailability`, {
          driverId,
          isDisponible: newIsEnabled,
        });
      }
    } catch (error) {
      console.error('Error updating driver availability:', error);
    }
  };

  const toggleSwitch = () => {
    const newIsEnabled = !isEnabled;
    setIsEnabled(newIsEnabled);
    updateDriverAvailability(newIsEnabled);
  };

  const fetchDriverId = async () => {
    try {
      if (deviceId) {
        const response = await axios.post(`${BASE_URL}/api/driver/device`, { deviceId });

        if (response.status === 200 && response.data.driverId) {
          setDriverId(response.data.driverId);
          setDriverInfo(response.data.user || { firstName: 'Unknown', lastName: '' });
          setIsEnabled(response.data.driverInfo?.isDisponible || false);
          setActiveStatusMessage(response.data.driverInfo?.isDisponible ? 'True' : 'False');
        }
      }
    } catch (error) {
      console.error('Error fetching driver ID:', error);
    }
  };

  const getDeviceId = async () => {
    if (Device.isDevice) {
      setDeviceId(Device.osBuildId);
    } else {
      Alert.alert('Error', 'Must use a physical device for Device ID.');
    }
  };

  useEffect(() => {
    const fetchDriverOrders = () => {
      const socket = io(BASE_URLIO);

      socket.on('driverOrderUpdate', (data) => {
        setOrders(data.orders || []);
        setLoading(false);
      });

      socket.on('error', (err) => {
        console.error('Socket error:', err.message);
        setLoading(false);
      });

      return () => {
        socket.disconnect();
      };
    };

    fetchDriverOrders();
  }, [driverId]);

  const handleCardPress = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
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
    <View style={styles.container}>
      <View style={styles.headerh}>
        <View style={styles.headerv}>
          <Text style={styles.headerText}>Driver Availability</Text>
          <Switch
            trackColor={{ false: '#7a2424', true: '#1c7745' }}
            thumbColor={isEnabled ? '#36d815' : '#ca6411'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
            disabled={isSwitchDisabled}
          />
        </View>
        <Text style={styles.statusText}>{`${driverInfo.firstName} ${driverInfo.lastName}`}</Text>
      </View>

      {isEnabled ? (
        <View style={styles.container2}>
          <FlatList
            data={loading ? Array.from({ length: 3 }) : orders}
            keyExtractor={(item, index) => item?._id || index.toString()}
            renderItem={({ item }) => (
              loading ? (
                renderSkeleton()
              ) : (
                <TouchableOpacity onPress={() => handleCardPress(item)}>
                  <View style={styles.card}>
                    <Image
                      source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/order-history.png' }}
                      style={styles.orderIcon}
                    />
                    <View style={styles.cardContent}>
                      <Text style={styles.orderNumber}>Order #{item.order_number || 'N/A'}</Text>
                      <Text style={styles.location}>{item.address_line || 'No Address Provided'}</Text>
                      <View style={styles.rightContainer}>
                        <Text style={styles.date}>
                          {moment(item.delivery_time).format('YYYY-MM-DD HH:mm') || 'No Delivery Time'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            )}
          />
        </View>
      ) : (
        <View style={styles.disabledView}>
          <Text style={styles.disabledText}>Please enable availability to view orders.</Text>
        </View>
      )}

      {selectedOrder && (
        <OrderDetailModal
          visible={!!selectedOrder}
          onClose={handleCloseModal}
          order={selectedOrder}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
    backgroundColor: '#ffffff',
  },
  container2: {
    paddingTop: 10,
    height: '70%',
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  headerv: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  headerh: {
    backgroundColor: '#2C4231',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 95,
    borderTopLeftRadius: 95,
    borderBottomRightRadius: 95,
    borderTopRightRadius: 95,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#A5A5A5',
    fontSize: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  orderIcon: {
    width: '15%',
    height: width * 0.15,
    resizeMode: 'contain',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
  disabledView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledText: {
    color: '#A5A5A5',
    fontSize: 18,
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

export default DriverOrdersScreen;
