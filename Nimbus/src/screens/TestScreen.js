import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Switch, TouchableOpacity, ScrollView, Animated, Image } from 'react-native';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import io from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';

const TestScreen = () => {
  const [driverId, setDriverId] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSwitchDisabled, setIsSwitchDisabled] = useState(false);
  const [activeStatusMessage, setActiveStatusMessage] = useState('Fetching status...');
  const [orders, setOrders] = useState([
    // Example static order data
    { order_number: '12345', client_name: 'John Doe', address_line: '123 Main St', payment_method: 'Credit Card', total_price: 50.0 },
    { order_number: '67890', client_name: 'Jane Smith', address_line: '456 Elm St', payment_method: 'Cash', total_price: 30.0 },
  ]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(0));

  const getDeviceId = async () => {
    if (Device.isDevice) {
      setDeviceId(DeviceInfo.getUniqueId());
    } else {
      Alert.alert('Error', 'Must use a physical device for Device ID.');
    }
  };

  const fetchDriverId = async () => {
    try {
      if (deviceId) {
        const response = await axios.post('http://192.168.8.113:4000/api/driver/device', {
          deviceId: deviceId,
        });

        if (response.status === 200 && response.data.driverId) {
          setDriverId(response.data.driverId);
          setIsEnabled(response.data.driverInfo.isDisponible);
          setActiveStatusMessage(response.data.driverInfo.isDisponible ? 'True' : 'False');
        }
      }
    } catch (error) {
      console.error('Error fetching driver ID:', error);
    }
  };

  useEffect(() => {
    const fetchAndSetDeviceId = async () => {
      await getDeviceId();
    };

    fetchAndSetDeviceId();
  }, []);

  useEffect(() => {
    if (deviceId) {
      fetchDriverId();
    }
  }, [deviceId]);

  useEffect(() => {
    if (!driverId) return;

    const socket = io('http://192.168.8.113:4000');

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
  }, [driverId]);

  const updateDriverAvailability = async (newIsEnabled) => {
    try {
      if (driverId) {
        await axios.post('http://192.168.8.113:4000/api/driver/updateAvailability', {
          driverId: driverId,
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

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 0,
      friction: 5,
      useNativeDriver: true,
    }).start(() => {
      setSelectedOrder(null);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Driver Availability</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
          disabled={isSwitchDisabled}
        />
        <Text style={styles.statusText}>{activeStatusMessage}</Text>
      </View>

      {isEnabled ? (
        <ScrollView contentContainerStyle={styles.orderList}>
          {orders.map((order, index) => (
            <TouchableOpacity key={index} style={styles.orderItem} onPress={() => openOrderModal(order)}>
              <Text style={styles.orderText}>Order #{order.order_number}</Text>
              <Text style={styles.orderText}>Client: {order.client_name}</Text>
              <Text style={styles.orderText}>Address: {order.address_line}</Text>
              <Text style={styles.orderText}>Payment: {order.payment_method}</Text>
              <Text style={styles.orderText}>Total: €{order.total_price.toFixed(2)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.disabledView}>
          <Text style={styles.disabledText}>Please enable availability to view orders.</Text>
        </View>
      )}

      {selectedOrder && (
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalView, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity style={styles.closeButton} onPress={animateOut}>
              <Ionicons name="close-circle" size={30} color="#ff5c5c" />
            </TouchableOpacity>

            <ScrollView>
              <View style={styles.orderInfo}>
                <Text style={styles.label}>Order #{selectedOrder.order_number ?? 'N/A'}</Text>
                <Text style={styles.label}>Client: {selectedOrder.client_name}</Text>
                <Text style={styles.label}>Address: {selectedOrder.address_line}</Text>
                <Text style={styles.label}>Payment: {selectedOrder.payment_method}</Text>
              </View>

              <Text style={styles.sectionHeader}>Total Price: €{selectedOrder.total_price.toFixed(2)}</Text>
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B3B1F',
  },
  header: {
    backgroundColor: '#2C4231',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#A5A5A5',
    marginTop: 5,
  },
  orderList: {
    padding: 15,
  },
  orderItem: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  orderText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  orderInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 5,
  },
  sectionHeader: {
    fontSize: 20,
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default TestScreen;
