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


  const stcASH = () => {
    setSelectedPayment('cash') ;
    if (parseFloat(exchangeValue) < orderDetails.data.newOrder.newOrder.totalPrice) {
      Alert.alert('Erreur', `L'échange est insuffisant. Vous devez fournir au moins le prix du commande qui :  ${orderDetails.data.newOrder.newOrder.totalPrice}€.`);
      setExchangeValue(0) ; 
      setSelectedPayment(null) ;
    }
    };

  const handlePayment = async () => {
    if (!selectedPayment) {
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
      <Text style={styles.label}>Échange</Text>

      {/* Modern Label for Total Price */}
      <View style={styles.totalPriceContainer}>
        <Text style={styles.paymentText}>     Total à Payer</Text>
        <Text style={styles.totalPriceValue}>
          {orderDetails.data.newOrder.newOrder.totalPrice.toFixed(2)} €
        </Text>

      </View>


      <View style={styles.exchangeContainer}>
        <View style={styles.inputContainer}>
       <TextInput
  style={styles.input}
  value={`${exchangeValue}`}
  keyboardType="decimal-pad"
  onChangeText={(text) => {
    // Votre logique de traitement
    let normalizedText = text.replace(',', '.');

// Autoriser uniquement les chiffres et un seul point décimal
normalizedText = normalizedText.replace(/[^0-9.]/g, '');

// Empêcher plusieurs points décimaux
const parts = normalizedText.split('.');
if (parts.length > 2) {
  normalizedText = parts[0] + '.' + parts.slice(1).join('');
}

setExchangeValue(normalizedText || '');
setSelectedPayment(null);
  }}
  editable={true}
/>

                  <Text style={styles.label22}>€</Text>

        </View>
      </View>

      <TouchableOpacity
        style={[styles.paymentOption, selectedPayment === 'cash' && styles.selectedOption]}
        onPress={() =>{ 
          stcASH() ;
        }  }
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
    marginBottom: 5,
    textAlign: 'center',
    color: '#e9ab25',
    fontWeight: '900',
    textShadowColor: '#312a1f',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  exchangeContainer: {
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
   
  },
  label: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    fontWeight: '600',
    textShadowColor: '#ffa726',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  // Bright orange for label
  }, label22: {
    fontSize: 25,
    color: '#db9e57',
  // Bright orange for label
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262e315a', // Dark background for input container
    borderRadius: 12,
    paddingHorizontal: 15,
    marginVertical: 10,
    width: width * 0.5,
    justifyContent: 'center',
  },
  input: {
    fontSize: 28,
    fontWeight: 'bold',
    width: width * 0.2,

    color: '#f0b330', // Futuristic orange for input text
    textAlign: 'center',
  },
  paymentOption: {
    width: width * 0.8,
    paddingVertical: 15,
    marginVertical: 5,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ab25', // Bright orange for border
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#527a7a', // Dark background for option
    elevation: 5,
  },
  selectedOption: {
    backgroundColor: '#0f4e3b', // Darker shade for selected
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
  totalPriceContainer: {
    backgroundColor: '#0f4e3b', // Dark background for the price label
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    width: width * 0.8,
    elevation: 5,
  },
  totalPriceText: {
    color: '#f39c12', // Bright gold color for price text
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  } ,
    totalPriceValue: {
    color: '#ffffff', // White color for the value
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 5, // Adds some space between the label and the value
  },
});

export default PaymentScreen;
