import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import axios from 'axios';

const PaymentScreen = ({ route }) => {
  const  orderId  = "66bea74097d7e61f1d6b3bd7"
  const [selectedPayment, setSelectedPayment] = useState(null); // Default to null, no payment selected
  const [exchangeValue, setExchangeValue] = useState(0); // Initial exchange value (numeric)
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!selectedPayment) return;

    setLoading(true);

    try {
      // Replace with your actual server URL
      const serverUrl = `http://192.168.8.119:4000/api/orders/update/${orderId}`;

      const payload = {
        exchange: exchangeValue, // Send the exchange value
        paymentMethod: selectedPayment === 'cash' ? 'cash' : 'TPE', // Send the payment method
      };

      const response = await axios.put(serverUrl, payload);
      Alert.alert('Success', 'Order updated successfully!');
      console.log(response.data);
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error', 'Failed to update order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paiement</Text>

      <View style={styles.exchangeContainer}>
        <Text style={styles.label}>Exchange</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={`${exchangeValue} €`} // Always append "€" and disallow deletion
            keyboardType="numeric"
            onChangeText={(text) => {
              // Remove any non-numeric characters before setting the state
              const numericValue = text.replace(/[^0-9]/g, '');
              setExchangeValue(numericValue || 0); // Default to 0 if input is empty
            }}
            editable={true} // User can only edit numbers, not the "€" symbol
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.paymentOption, selectedPayment === 'cash' && styles.selectedOption]}
        onPress={() => setSelectedPayment('cash')}
      >
        <Text style={styles.paymentText}>Paiement espece</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.paymentOption, selectedPayment === 'card' && styles.selectedOption]}
        onPress={() => setSelectedPayment('card')}
      >
        <Text style={styles.paymentText}>TPE Machine</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.okButton, 
          { backgroundColor: selectedPayment ? '#00C851' : '#cccccc' } // Disable button if no selection
        ]}
        disabled={!selectedPayment} // Button is disabled until a payment method is selected
        onPress={handlePayment}
      >
        <Text style={styles.okText}>{loading ? 'Processing...' : 'Ok'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window'); // Get device width for responsive design

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 50, // Top margin for spacing
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#804000',
    marginBottom: 30,
  },
  exchangeContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: width * 0.6, // Responsive width
    justifyContent: 'center',
  },
  input: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  paymentOption: {
    width: width * 0.8, // Responsive width for buttons
    paddingVertical: 15,
    marginVertical: 10,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  selectedOption: {
    backgroundColor: '#FFFACD',
  },
  paymentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  okButton: {
    position: 'absolute',
    bottom: 50, // Button at the bottom
    width: width * 0.8, // Responsive width
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
