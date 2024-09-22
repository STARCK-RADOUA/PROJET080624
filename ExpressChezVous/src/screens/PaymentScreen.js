import { BASE_URLIO } from '@env';
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import io from 'socket.io-client';
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

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);
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
          text: 'Comander',
          onPress: () => handlePayment(), // Appelle la fonction logout si l'utilisateur confirme
          style: 'active',
        },
      ],
      { cancelable: true }
    );
  };
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
        socket.emit('addOrder', orderData);

        socket.on('orderAdded', (order) => {
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
        style={[styles.okButton, !selectedPayment && styles.disabledButton]}
        disabled={!selectedPayment}
        onPress={confirmLogout}
      >
        <Text style={styles.okText}>{loading ? 'Processing...' : 'Confirm Payment'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f73', // Dark futuristic background
    alignItems: 'center',
    justifyContent: 'top',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#d69a17', // Futuristic orange for title
    marginBottom: 40,
    textAlign: 'center',
  },
  exchangeContainer: {
    marginBottom: 30,
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 20,
    marginBottom: 10,
    color: '#271917', // Bright orange for label
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#203a433e', // Dark background for input container
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: width * 0.8,
    justifyContent: 'center',
  },
  input: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d3a747', // Futuristic orange for input text
    textAlign: 'center',
  },
  paymentOption: {
    width: width * 0.8,
    paddingVertical: 15,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ab25', // Bright orange for border
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#50666d', // Dark background for option
    elevation: 5,
  },
  selectedOption: {
    backgroundColor: '#295061', // Darker shade for selected
    borderColor: '#00ff2a', // Darker orange for selected border
  },
  paymentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e6dbc5', // Futuristic orange for payment text
  },
  okButton: {
    width: width * 0.8,
    marginVertical: 20,
    paddingVertical: 15,
    backgroundColor: '#e9ab25', // Solid orange button
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc', // Grey background when disabled
  },
  okText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
