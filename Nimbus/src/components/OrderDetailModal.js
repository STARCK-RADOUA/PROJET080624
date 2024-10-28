import React, { useState, useEffect } from 'react';
import { Modal, View,Switch, Text,Alert,TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { BASE_URLIO, BASE_URL } from '@env';
import * as Device from 'expo-device';
import { MaterialIcons } from '@expo/vector-icons';
import io from 'socket.io-client';

const OrderDetailModal = ({ visible, onClose, order }) => {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [comment, setComment] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showLivredModal, setShowLivredModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  if (!order) return null;

  const displayedProducts = showAllProducts ? order.products : order.products.slice(0, 3);

  // Animation pour l'entrée du modal
  const scaleAnim = new Animated.Value(0);

  const animateIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 0,
      friction: 7,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  // Récupérer les chauffeurs disponibles lorsque le modal est affiché

  // Affiche une alerte de confirmation avant la livraison
  const confirmLivraison = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir confirmer la livraison de cette commande ?',
      [
        { text: 'Annuler', onPress: () => console.log('livraison annulée'), style: 'cancel' },
        { text: 'Livrer', onPress: () => setShowLivredModal(true), style: 'default' },
      ],
      { cancelable: true }
    );
  }; 

  // Affiche une alerte de confirmation avant l'annulation de la commande
  const cancelLivraison = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir annuler cette commande ?',
      [
        { text: 'Annuler', onPress: () => console.log('Commande non annulée'), style: 'cancel' },
        { text: 'Annuler la commande', onPress: () => setShowCancelModal(true), style: 'destructive' },
      ],
      { cancelable: true }
    );
  }; 
   const redestlLivraison = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir redestiner cette commande à un autre livreur ?',
      [
        { 
          text: 'Non', 
          onPress: () => console.log('Commande non redistribuée'), 
          style: 'cancel' 
        },
        { 
          text: 'Redistribuer la commande', 
          onPress: () => {
            // Replace this with the actual function to reassign or redistribute the order.
            commandeRedestrubier();
          }, 
          style: 'destructive' 
        },
      ],
      { cancelable: true }
    );
  };
  const commandeLivree = async () => {
    
    const order_number = order.order_number ;
    console.log('------------------------------------');
    console.log(' trying livred...', order_number);
    console.log('------------------------------------');
  
    try {
      const response = await fetch(`${BASE_URL}/api/driver/commandeLivree`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_number,comment }),
      });
  
      const l = await response.json();
  
      if (response.ok) {
        console.log('------------------------------------');
        console.log('livred successful');
        console.log('------------------------------------');

        setTimeout(() => {
const deviceId = Device.osBuildId;
        const socket = io(BASE_URLIO, {
          query: { deviceId },
        });

                 socket.emit('driverConnected', deviceId);

        }, 2 * 60 * 1000); // 50 secondes
  
     
      } else {
        Alert.alert('Confirmation échouée', data.errors ? data.errors.join(', ') : data.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue pendant la déconnexion.');
    } finally {  
      setShowLivredModal(false);
      animateOut();
    }
  };
  
  const commandeRedestrubier = async () => {
    const deviceId = Device.osBuildId;

    const order_number = order.order_number ;
    console.log('------------------------------------');
    console.log(' trying destrubier...', order_number,deviceId);
    console.log('------------------------------------');
  
    try {
      const response = await fetch(`${BASE_URL}/api/driver/commandeRedestrubier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_number,deviceId}),
      });
  
      const l = await response.json();
  
      if (response.ok) {
        console.log('------------------------------------');
        console.log('redestrubier  successful');
        console.log('------------------------------------');




        const socket = io(BASE_URLIO, {
          query: { deviceId },
        });

        socket.emit('driverConnected', deviceId);

  
     
      } else {
        Alert.alert(' échouée', data.errors ? data.errors.join(', ') : data.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue pendant la redestrubition.');
    } finally {  
      setShowLivredModal(false);
      animateOut();
    }
  };
  
  const commandeCancled = async () => {
    if (reportReason.trim() === '' || comment.trim() === '') {
      Alert.alert('Erreur', 'Veuillez fournir un motif et un commentaire pour annuler la commande.');
      return;  // Ne pas procéder à l'annulation si les champs sont vides
    }
    const order_number = order.order_number ;
    console.log('------------------------------------');
    console.log(' trying livred...', order_number);
    console.log('------------------------------------');
  
    try {
      const response = await fetch(`${BASE_URL}/api/driver/commandeCanceled`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_number, reportReason, comment,isChecked }),
      });
  
      const l = await response.json();
  
      if (response.ok) {
        console.log('------------------------------------');
        console.log('comande canceled successful');
        console.log('------------------------------------');
const deviceId = Device.osBuildId;
        const socket = io(BASE_URLIO, {
          query: { deviceId },
        });
        socket.emit('driverConnected', deviceId);
  
     
      } else {
        Alert.alert('Confirmation échouée', data.errors ? data.errors.join(', ') : data.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue pendant la déconnexion.');
    } finally {  
      setShowCancelModal(false);
            animateOut();

    }
  };
  
console.log('------------------------------------');
console.log(order);
console.log('------------------------------------');



  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onShow={animateIn}
      onRequestClose={animateOut}
    >
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.modalView, { transform: [{ scale: scaleAnim }] }]}>
          {/* Bouton de fermeture */}
          <TouchableOpacity style={styles.closeButton} onPress={animateOut}>
            <Ionicons name="close-circle" size={37} color="#ff5c5c" />
          </TouchableOpacity>

            {/* Infos sur la commande */}
            <View style={styles.orderInfo}>
              <Text style={styles.label}><MaterialIcons name="receipt" size={16} color="#ffbf00" /> Commande #{order.order_number ?? 'N/A'}</Text>
              <Text style={styles.label}><Ionicons name="person" size={16} color="#ffbf00" /> Client : {order.client_name}</Text>
              <Text style={styles.label}><Ionicons name="car" size={16} color="#ffbf00" /> Chauffeur : {order.driver_name}</Text>
              <Text style={styles.label}><Ionicons name="card" size={16} color="#ffbf00" /> Paiement : {order.payment_method}</Text>
              <Text style={styles.label}><Ionicons name="cash" size={16} color="#ffbf00" /> Prix Total : €{order.total_price.toFixed(2)}</Text>
              <Text style={styles.label}><Ionicons name="swap-horizontal" size={16} color="#ffbf00" /> Échange : €{order.exchange.toFixed(2)}</Text>
              <Text style={styles.label}><Ionicons name="home" size={16} color="#ffbf00" /> Adresse : {order.address_line}</Text>
              <Text style={styles.label}><Ionicons name="time" size={16} color="#ffbf00" /> Date de creation : {moment(order.delivery_time).format('YYYY-MM-DD HH:mm')}</Text>
            </View>

            {/* Produits */}
            <Text style={styles.sectionHeader}>Produits :</Text>
            <ScrollView>

            <View style={styles.productsContainer}>
              {displayedProducts.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => toggleExpand(index)} style={styles.productContainer}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri: item.product?.image_url || 'https://via.placeholder.com/150',
                      }}
                      style={styles.productImage}
                    />
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.product?.name || 'Indisponible'}</Text>
                    <Text style={styles.productQuantity}>Quantité : {item.quantity}</Text>
                        <Text style={styles.productPrice}>€{!item.isFree ? item.price.toFixed(2) : "Gratuit     €" + item.price.toFixed(2)}</Text>


                    {expanded === index && (
                      <View>
                      <Text style={styles.productQuantity}>Type de service :{item.service_type }</Text>

                      </View>
                    )}
                  </View>
                  <Ionicons name={expanded === index ? "chevron-up" : "chevron-down"} size={20} color="#ffbf00" />
                </TouchableOpacity>
              ))}

              {/* Bouton pour afficher plus de produits */}
              {order.products.length > 3 && !showAllProducts && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllProducts(true)}
                >
                  <Text style={styles.showMoreText}>Afficher plus de produits...</Text>
                </TouchableOpacity>
              )}
            </View>



            {/* Prix Total */}
            
          </ScrollView>
          <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total : €{order.total_price.toFixed(2)}</Text>
            </View>
            <View style={styles.totalContainer11}>

          <TouchableOpacity style={styles.affectButton} onPress={() => confirmLivraison()} >
                <Text style={styles.affectButtonText}>Commande Livrée</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.affectButton334} onPress={() => redestlLivraison()} >
              <Ionicons name={"reload"} size={20} color="#1f1e1d" />
              </TouchableOpacity>
               <TouchableOpacity style={styles.affectButton33} onPress={() => cancelLivraison()} >
                <Text style={styles.affectButtonText}>Cancel</Text>
              </TouchableOpacity>
              </View>
              <Modal
  animationType="slide"
  transparent={true}
  visible={showCancelModal}
  onRequestClose={() => setShowCancelModal(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalView}>
      <Text style={styles.sectionHeader}>Annuler la commande</Text>

      <Text style={styles.label}>Motif d'annulation :</Text>
      <TextInput
        style={styles.input}
        placeholder="Motif"
        value={reportReason}
        onChangeText={setReportReason}
      />

      <Text style={styles.label}>Commentaire :</Text>
      <TextInput
        style={styles.input}
        placeholder="Commentaire"
        value={comment}
        onChangeText={setComment}
      />
      <View style={styles.switchContainer}>
        <Switch
          value={isChecked}
          onValueChange={setIsChecked}
        />
        <Text style={styles.switchLabel}>Signaler</Text>
      </View>


      <TouchableOpacity
        style={styles.affectButton}
        onPress={commandeCancled}
      >
        <Text style={styles.affectButtonText}>Envoyer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.affectButton33}
        onPress={() => setShowCancelModal(false)}
      >
        <Text style={styles.affectButtonText}>Annuler</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>  
 <Modal
  animationType="slide"
  transparent={true}
  visible={showLivredModal}
  onRequestClose={() => setShowLivredModal(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalView}>
      <Text style={styles.sectionHeader}>Livrer la commande</Text>

      

      <Text style={styles.label}>Commentaire :</Text>
      <TextInput
        style={styles.input}
        placeholder="Commentaire"
        value={comment}
        onChangeText={setComment}
      />

      <TouchableOpacity
        style={styles.affectButton}
        onPress={commandeLivree}
      >
        <Text style={styles.affectButtonText}>Envoyer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.affectButton33}
        onPress={() => setShowLivredModal(false)}
      >
        <Text style={styles.affectButtonText}>Annuler</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalView: {
    width: '90%',
    maxHeight: '92%',
    backgroundColor: '#f2f4f5', // Light background
    borderRadius: 30, // Rounded corners
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Deeper shadow for floating effect
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  orderInfo: {
    paddingTop: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#1f2f16', // Dark green text
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#21b64a', // Light green for headers
  },
  productsContainer: {
    marginTop: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf7eb', // Soft green background for items
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 15,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#21b64a',
  },
  productQuantity: {
    fontSize: 14,
    color: '#1f2f16',
  },
  productPrice: {
    fontSize: 14,
    color: '#21b64a',
  },
  showMoreButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  showMoreText: {
    color: '#21b64a', // Green for "show more" text
    fontSize: 16,
  },
  input: {
    borderColor: '#21b64a',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    color: '#1f2f16',
  },
  
  pickerContainer: {
    marginTop: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
  },
  picker: {
    height: 50,
    color: '#fff',
  },
 affectButton33: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ac3838',
    borderRadius: 10,
    alignItems: 'center',
  }, affectButton334: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eccd3f',
    borderRadius: 10,
    alignItems: 'center',
  },
  affectButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#21b64a', // Green button background
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  affectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#5a4f4fc3',
    borderRadius: 10,
    alignItems: 'center',
  }, 
   totalContainer11: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,

    justifyContent: 'space-between',
    borderRadius: 30,
  
    flexDirection: 'row',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffbf00',
  },
});

export default OrderDetailModal;
