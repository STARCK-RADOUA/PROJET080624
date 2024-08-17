import { BASE_URLIO } from '@env';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import io from 'socket.io-client';

const PaymentScreen = ({ navigation, route }) => {
  const orderId = "66bea74097d7e61f1d6b3bd7"; // Ton ID de commande
  const orderDetails = route.params; // Les détails de la commande passés depuis un autre écran
  const [selectedPayment, setSelectedPayment] = useState(null); // Par défaut, aucun paiement sélectionné
  const [exchangeValue, setExchangeValue] = useState(0); // Valeur initiale d'échange
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null); // État pour stocker l'instance Socket.IO

  // Initialiser la connexion Socket.IO
  useEffect(() => {
    const socketInstance = io(BASE_URLIO);
    setSocket(socketInstance);

    // Nettoyer la connexion lors du démontage du composant
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

    console.log('Order Details:', orderDetails);

    setLoading(true);

    try {
      const orderData = {
        exchange: exchangeValue, // Envoi de la valeur d'échange
        paymentMethod: selectedPayment === 'cash' ? 'cash' : 'TPE', // Envoi de la méthode de paiement
        orderdetaille: orderDetails, // Détails de la commande
      };
      console.log('------------------------------------');
      console.log('........................................................');
      console.log(orderData);
      console.log('000000000000000000000000000000000000000000000000000000000000');
      console.log('------------------------------------');

      if (socket) {
        // Émission des données vers le serveur via Socket.IO
        socket.emit('addOrder', orderData);

        // Écouter la réponse du serveur pour l'événement 'orderAdded'
        socket.on('orderAdded', (order) => {
          console.log('Order ajouté:', order);
          Alert.alert('Succès', 'Votre commande est en cours de création!');
          const dataToSend = {
            order_id: order,
      
          };
          navigation.replace('PaymentSuccessScreen', { data: dataToSend });
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      Alert.alert('Erreur', 'Échec de la mise à jour de la commande.');
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
            value={`${exchangeValue} €`}
            keyboardType="numeric"
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, '');
              setExchangeValue(numericValue || 0);
            }}
            editable={true}
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
          { backgroundColor: selectedPayment ? '#00C851' : '#cccccc' },
        ]}
        disabled={!selectedPayment}
        onPress={handlePayment}
      >
        <Text style={styles.okText}>{loading ? 'Processing...' : 'Ok'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window'); 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 50,
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
    width: width * 0.6,
    justifyContent: 'center',
  },
  input: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  paymentOption: {
    width: width * 0.8,
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
    bottom: 50,
    width: width * 0.8,
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
