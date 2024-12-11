import { BASE_URLIO } from '@env';
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import io from 'socket.io-client';
import { DataContext } from '../navigation/DataContext';

const PaymentScreen = ({ navigation, route }) => {
  const orderDetails = route.params; // Order details passed from another screen
  const [selectedPayment, setSelectedPayment] = useState(null); // No payment selected by default
  const [exchangeValue, setExchangeValue] = useState(""); // Initial exchange value
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
      'Êtes-vous sûr de vouloir confirmer la commande ?',
      
      [
        {
          text: 'Annuler',
          onPress: () => console.log('comande annulée'),
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


  const stTPe = () => {
    setExchangeValue('0');
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      return;
    }
   
    if (selectedPayment === 'cash' && parseFloat(exchangeValue) < orderDetails.data.newOrder.newOrder.totalPrice) {
      Alert.alert('Erreur', `L'échange est insuffisant. Vous devez fournir au moins le prix du commande qui :  ${orderDetails.data.newOrder.newOrder.totalPrice}€.`);
      return;
    }
  
    // If selected payment method is card, set exchange value to 0
    if (selectedPayment === 'TPE') {
      setExchangeValue('0'); // Automatically set exchange to 0 for card payment
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
            Alert.alert('Succès', 'Votre commande est en cours de création !');
          }
          const dataToSend = {
            order_id: order,
          };
          if (serviceTest) {
            Alert.alert('Échec', 'Service indisponible pour le moment');
            navigation.replace('Home');
          }
          if (!serviceTest) {
            navigation.replace('PaymentSuccessScreen', { data: dataToSend });
          }
        });
      }
    } catch (error) {
      Alert.alert('Erreur', "Échec de la mise à jour de la commande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Type de Paiement</Text>

      <View style={styles.exchangeContainer}>
        <Text style={styles.label}>Échange</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={`${exchangeValue}`}
            keyboardType="numeric"
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, '');
              setExchangeValue(numericValue || '');
            }}
            editable={true}
          />
                  <Text style={styles.label22}>€</Text>

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
        onPress={() => {
          setSelectedPayment('card');
          setExchangeValue('0'); // Set exchange value to 0
        }}
              >
        <Text style={styles.paymentText}>TPE Machine</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.okButton, !selectedPayment && styles.disabledButton]}
        disabled={!selectedPayment}
        onPress={confirmLogout}
      >
<Text style={styles.okText}>{loading ? 'Traitement en cours...' : 'Confirmer le paiement'}</Text>
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
    fontSize: 37,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#e9ab25',
    fontWeight: '900',
    textShadowColor: '#312a1f',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  exchangeContainer: {
    marginBottom: 30,
    alignItems: 'center',
    width: '100%',
   
  },
  label: {
    fontSize: 20,
    marginBottom: 10,
    color: '#271917',
  // Bright orange for label
  }, label22: {
    fontSize: 25,
    color: '#db9e57',
  // Bright orange for label
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
    width: width * 0.2,

    color: '#f0b330', // Futuristic orange for input text
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
    color: '#e6dbc5', 
    fontWeight: '900',
    textShadowColor: '##271e0d',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,// Futuristic orange for payment text
  },
  okButton: {
    width: width * 0.8,
    marginVertical: 20,
    paddingVertical: 15,
    backgroundColor: '#e9ab25', // Solid orange button
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 10,
    elevation: 12,
   
  },
  disabledButton: {
    backgroundColor: '#cccccc', // Grey background when disabled
  },
  okText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontWeight: '900',
    textShadowColor: '#312a1f',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
    
  },
});

export default PaymentScreen;
