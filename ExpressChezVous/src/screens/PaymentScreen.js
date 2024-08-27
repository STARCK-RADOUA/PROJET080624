import { BASE_URLIO } from '@env';
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import io from 'socket.io-client';
import { LinearGradient } from 'expo-linear-gradient'; // Gradient for modern button look
import { DataContext } from '../navigation/DataContext';

const PaymentScreen = ({ navigation, route }) => {
  const orderDetails = route.params; // Order details passed from another screen
  const [selectedPayment, setSelectedPayment] = useState(null); // No payment selected by default
  const [exchangeValue, setExchangeValue] = useState(0); // Initial exchange value
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const { sharedData } = useContext(DataContext); // Socket.IO instance storage state
  const serviceName = sharedData.serviceName;
  const serviceTest = sharedData.serviceTest;
  const serviceId = sharedData.id;

  // Initialize the Socket.IO connection
  useEffect(() => {
    const socketInstance = io(BASE_URLIO);
    setSocket(socketInstance);

    // Clean up the connection when the component is unmounted
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!selectedPayment) {
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        exchange: exchangeValue, // Send the exchange value
        paymentMethod: selectedPayment === 'cash' ? 'cash' : 'TPE', // Send the payment method
        orderdetaille: orderDetails,
        serviceTest: serviceTest,
        serviceId: serviceId,
      };

      if (socket) {
        // Emit data to the server via Socket.IO
        socket.emit('addOrder', orderData);

        // Listen for the server's response for the 'orderAdded' event
        socket.on('orderAdded', (order) => {
          console.log('Order added:', order);
          if (!serviceTest) {
            Alert.alert('Success', 'Your order is being created!');
          }
          const dataToSend = {
            order_id: order,
          };
          if (serviceTest) {
            Alert.alert('Failure', 'Service unavailable at the moment');
            navigation.replace('Home');
          }
          if (!serviceTest) {
            navigation.replace('PaymentSuccessScreen', { data: dataToSend });
          }
        });
      }
    } catch (error) {
      console.error('Error creating the order:', error);
      Alert.alert('Error', 'Failed to update the order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>

      <View style={styles.exchangeContainer}>
        <Text style={styles.label}>Exchange</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={`${exchangeValue} €`}
            keyboardType="numeric"
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, '');
              setExchangeValue(numericValue || '');
            }}
            editable={true}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.paymentOption, selectedPayment === 'cash' && styles.selectedOption]}
        onPress={() => setSelectedPayment('cash')}
      >
        <Text style={styles.paymentText}>Cash Payment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.paymentOption, selectedPayment === 'card' && styles.selectedOption]}
        onPress={() => setSelectedPayment('card')}
      >
        <Text style={styles.paymentText}>TPE Machine</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.okButton}
        disabled={!selectedPayment}
        onPress={handlePayment}
      >
        <LinearGradient
          colors={selectedPayment ? ['#e9ab25', '#e9ab25a9'] : ['#cccccc', '#bfbfbf']} // Orange gradient
          style={styles.okButtonGradient}
        >
          <Text style={styles.okText}>{loading ? 'Processing...' : 'Confirm Payment'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF5E1', // Light orange background
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e9ab25', // Strong orange for title
    marginBottom: 40,
    textAlign: 'center',
  },
  exchangeContainer: {
    marginBottom: 30,
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#e9ab25', // Tomato orange for label
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEFD5', // Lighter orange for input container
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: width * 0.8,
    justifyContent: 'center',
  },
  input: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e9ab25', // Strong orange for input text
    textAlign: 'center',
  },
  paymentOption: {
    width: width * 0.8,
    paddingVertical: 15,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF8C00', // Dark orange for border
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5E1', // Light orange for background
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: '#FFE4B5', // Lighter shade of orange for selected
    borderColor: '#e9ab25', // Darker orange for selected border
  },
  paymentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e9ab25', // Strong orange for payment text
  },
  okButton: {
    width: width * 0.8,
    marginVertical: 20,
    borderRadius: 12,
  },
  okButtonGradient: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  okText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
