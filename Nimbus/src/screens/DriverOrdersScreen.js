import React, { useState, useContext,useRef, useEffect } from 'react';
import { View, AppState, Text, FlatList, TouchableOpacity, Switch, Image, Alert, Linking } from 'react-native';
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
import { fetchDriverId, updateDriverAvailability,getDistance,updateDriverPause, openGoogleMaps, openWaze, getDeviceId } from '../utils/driverOrderUtils';
import styles from './styles/styles';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';

const DriverOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deviceId1, setDeviceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState(null);
  const [driverInfo, setDriverInfo] = useState({ firstName: '', lastName: '' });
  const [point, setPoint] = useState({ points_earned: ''});
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnabledPause, setIsEnabledPause] = useState(false);
  const [isSwitchDisabled, setIsSwitchDisabled] = useState(false);
  const [isSwitchDisabledPause, setIsSwitchDisabledPause] = useState(false);
  const [activeStatusMessage, setActiveStatusMessage] = useState('Fetching status...');
  const { startTracking, stopTracking, isTracking } = useContext(LocationContext);
  const [currentLocation, setCurrentLocation] = useState(null); // Ajout d'un état pour la localisation actuelle
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const [messages, setMessages] = useState([]); // State for messages
  const [supportMessages, setsupportMessages] = useState([]); // State for messages
  const socketRef = useRef(null);
  const deviceId = Device.osBuildId;
const [hasInitialRefreshRun, setHasInitialRefreshRun] = useState(false);

useEffect(() => {
  if (orders.length > 0 && !hasInitialRefreshRun) {
    refreshDistances(); // Exécuter une fois immédiatement si des commandes sont présentes
    setHasInitialRefreshRun(true); // Empêche l'exécution répétée
  }
}, [orders]);

  useEffect(() => {
    // Initialisation du socket si ce n'est pas déjà fait
    if (!socketRef.current) {
      socketRef.current = io(BASE_URLIO, {
        query: { deviceId },
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', deviceId);
        socketRef.current.emit('driverConnected', deviceId);
      });

      socketRef.current.on('orderInprogressUpdatedForDriver',async (data) => {
        console.log('Order data received:', data);
         setOrders(data.orders || []);
        setLoading(false);
        setIsEnabled(data.active);
        setIsEnabledPause(data.ispause);
      });


    

     
    }

    // Nettoyage du socket lors du démontage du composant
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setTimeout(() =>   refreshDistances(), 5000);

      }
    };
  }, [deviceId]);
  useEffect(() => {
    if (deviceId) {

      fetchDriverId(deviceId, setDriverId, setDriverInfo,setPoint, setActiveStatusMessage);
    }
  }, [deviceId]);


  useFocusEffect(
    React.useCallback(() => {

      if (deviceId) {
        const socket = io(BASE_URLIO, {
          query: { deviceId },
        });

        socket.emit('watchChatMessagesDriver', deviceId);
        socket.on('OrderchatMessagesDriverUpdated', (data) => {
          const filteredMessages = data.messages.filter(message => message.lastMessage);
          if (filteredMessages.length > 0) {
            setMessages(filteredMessages);
          }
        });
  
        
        if (!isTracking ) {
          
          startTracking(deviceId);
        }

        socket.emit('watchSupportChatMessagesDriver', deviceId);

        socket.on('SupportchatMessagesUpdatedForDriver', (data) => {
          const filteredMessages = data.messages.filter((message) => message.lastMessage);

          if (filteredMessages.length > 0) {
            setsupportMessages(filteredMessages);

            // Check if there are any unread messages and update the state
            const unread = filteredMessages.some(
              (msg) => !msg.lastMessage.seen && msg.lastMessage.sender !== 'client'
            );
          }
        });

        return () => {
          socket.disconnect();
        };
      }
    }, [deviceId])
  );
  useEffect(() => {
    // Gérer les changements d'état de l'application
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App is back to foreground - refreshing data');
        if (!socketRef.current) {
          socketRef.current = io(BASE_URLIO, {
            query: { deviceId },
          });
    
          socketRef.current.on('connect', () => {
            console.log('Socket connected:', deviceId);
            socketRef.current.emit('driverConnected', deviceId);
          });
        } 
        setTimeout(() =>   refreshDistances(), 5000);

      }
      setAppState(nextAppState);
    });
  
    // Cleanup the subscription on component unmount
    return () => {
      subscription?.remove(); // Properly remove the subscription
    };
  }, [appState]);
  
  const subscribeToLocation = async () => {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 15000, // 10 secondes
        distanceInterval: 1000, // Met à jour toutes les 10 mètres
      },
      async (location) => {
        const { latitude, longitude } = location.coords;
        const updatedOrders = await Promise.all(
          orders.map(async (order) => {
            if (latitude && longitude && order.location) {
              const [lat, lng] = order.location.split(',').map(coord => parseFloat(coord.trim()));


              console.log('------------------------------------');
              console.log("####################################");
              console.log('------------------------------------');
              console.log("currentLocation.latitude, currentLocation.longitude", latitude, longitude)
              console.log("order.location", lat, lng)
              const distanceData = await getDistance(latitude, longitude, lat, lng);
              return { ...order, distance: distanceData.distance };
            }
            return order;
          })
        );
        if(updatedOrders){

                    setOrders(updatedOrders);

          setOrders((prevOrders) => sortOrdersByDistanceAscending([...prevOrders]));

       console.log(`Updated location: Latitude: ${latitude}, Longitude: ${longitude}`);
       console.log('------------sub------------------------');
       console.log(locationSubscription);
       const socket = io(BASE_URLIO, { query: { deviceId: Device.osBuildId } });
  //    console.log('Sending background ping');
     // socket.emit('driverPing', { deviceId: Device.osBuildId });
     // socket.emit('driverLocationUpdate', { deviceId: Device.osBuildId, latitude, longitude });

       }
      
      },
      (error) => {
        console.error('Location error:', error);
      }
    );
    setLocationSubscription(subscription);
  };
  const sortOrdersByDistanceAscending = (orders) => {
    return orders.sort((a, b) => {
      if (a.livred_2min && !b.livred_2min) {
        return 1;  
      }
      if (!a.livred_2min && b.livred_2min) {
        return -1;
      }
  
      return (a.distance || 0) - (b.distance || 0); 
    });
  };
  
  
  
  const refreshDistances = async () => {

    await subscribeToLocation();


  };

  

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
    console.log('------------------------------------');
    console.log('Logging out...', deviceId);
    console.log('------------------------------------');

    try {
      const response = await fetch(`${BASE_URL}/api/driver/logout`, {
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



  

  useEffect(() => {

    const intervalId = setInterval(async () => {
      console.log("yooo")

   
      refreshDistances();
      console.log("refrech distance")
      startTracking(deviceId);
      
    }, 20 * 1000);



    return () => clearInterval(intervalId); // Nettoie l'intervalle lors du démontage
  }, [orders, currentLocation]); // Dépend des commandes et de la localisation actuelle



  const toggleSwitch = () => {

    if (orders.length === 0) {
      const newIsEnabled = !isEnabled;
      setIsEnabled(newIsEnabled);
      updateDriverAvailability(driverId, newIsEnabled);
      return;
    }
    Alert.alert('Attendez !', 'Vous ne pouvez pas quitter tant que les commandes n\'est pas livrée.');

  };
  const toggleSwitchPause = () => {

   
      const newIsEnabled = !isEnabledPause;
      setIsEnabledPause(newIsEnabled);
      updateDriverPause(driverId, newIsEnabled);
      return;
   
  };

  const handleCardPress = (order) => setSelectedOrder(order);
  const handleCloseModal = () => setSelectedOrder(null);

  return (
    <View style={styles.container}>
      <View style={[styles.headerh, {
        shadowColor: !isEnabled ? '#7a2424' : '#28919b', 
      }]}>
        <View style={styles.headerv}>
          <TouchableOpacity style={styles.qr} onPress={() => navigate('QrcodeGeneratorDriverScreen')}>


            <Icon name="qrcode-scan" size={45} color="#fff" />

          </TouchableOpacity>
          {isEnabled ? (
            <>
          <Text style={styles.headerText}>  Livraison : On Fire 🔥</Text>
          </>
           ) : (
          <Text style={styles.headerText}>     Hors Service 😴 </Text>
           )}
           <Text style={styles.statusText3}>{`${point.points_earned}  `}</Text>

            <Switch
            trackColor={{ false: '#7a2424', true: '#1c7745' }}
            thumbColor={isEnabled ? '#36d815' : '#ca6411'}
            onValueChange={toggleSwitch}
            value={isEnabled}
            disabled={isSwitchDisabled}
          />
        </View>
        
        <View style={styles.headerv}>
        <Text style={styles.statusText}>{`${driverInfo.firstName} ${driverInfo.lastName}`}</Text>
        <View style={styles.headerv11}>
        <Text style={styles.statusText1}>  I   enPause  </Text>
        <Switch
            trackColor={{ false: '#7a2424', true: '#b9a80e' }}
            thumbColor={isEnabledPause ? '#696008' : '#ca6411'}
            onValueChange={toggleSwitchPause}
            value={isEnabledPause}
            disabled={isSwitchDisabledPause}
          /> 
            
          </View>
      </View>
      </View>

      {isEnabled ? (
        <>
          <View style={styles.container2}>
            <FlatList
              data={loading ? Array.from({ length: 3 }) : orders}
              keyExtractor={(item, index) => item?._id || index.toString()}
              initialNumToRender={10}
              windowSize={5}
              renderItem={({ item }) =>
                loading ? (
                  <>
                    <View style={styles.shimmerContainer} />
                  </>
                ) : (
                  <TouchableOpacity onPress={() => handleCardPress(item)}>
                    <View style={item.livred_2min ? styles.card : styles.cardLivred}>
                      <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/order-history.png' }}
                        style={styles.orderIcon}
                      />
                      <View style={styles.cardContent}>
                        <Text style={styles.orderNumber}>Client #
                          <Text style={{ color: item.client_name ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                            {item.client_name ?? 'N/A'}
             -             </Text>
                        </Text>
                        <Text style={styles.distance}>Adresse:  {"\n"}
                          <Text style={{ color: item.building ? '#1ca5a5' : '#dc3545', fontWeight: 'bold' }}>
                            {item.building ?? 'Aucune adresse fournie'}
                          </Text>
                        </Text>
                        <Text style={styles.distance}>Distance:
                          <Text style={{ color: item.distance ? '#1ca5a5' : '#dc3545', fontWeight: 'bold' }}>
                            {item.distance ? `${item.distance} km` : 'Calcul en cours...'}
                          </Text>
                        </Text>



                        <View style={styles.fieldRow}>
                          <TouchableOpacity style={styles.navigateButtonGoogle} onPress={() => openGoogleMaps(item.location)}>
                            <Ionicons name="navigate-outline" size={24} color="white" />
                            <Text style={styles.navigateText}>Google </Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.navigateButtonWaze} onPress={() => openWaze(item.location)}>
                            <Ionicons name="navigate-outline" size={24} color="white" />
                            <Text style={styles.navigateText}>Waze </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
  style={styles.navigateButtonChat}
  onPress={() => navigate('RoomScreen', {
    clientName: item.client_name,
    orderId: item.order_number,
    clientId: item.client_id,
    driverId: item.driver_id
  })}
>
  <Ionicons name="send-outline" size={24} color="white" />
  {messages.some(message => 
    message.orderId === item.order_number && 
    !message.lastMessage.seen && 
    message.lastMessage.sender !== "driver"
  ) && (
    <View style={styles.unreadIndicator}>
      <View style={styles.redButton} />
    </View>
  )}
</TouchableOpacity>


                        </View>
                        <Text style={styles.date}>
                        Date  d’affectation : {moment(item.delivery_time).format('YYYY-MM-DD HH:mm') || 'No Delivery Time'}
                        </Text>
                         <Text style={styles.date}>
                         Date  de création   : {moment(item.created_at).format('YYYY-MM-DD HH:mm') || 'No Delivery Time'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              }
            />

          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.navigateButtonSupportChat} onPress={() => confirmLogout()}>
              <Ionicons name="log-out-outline" size={24} color="white" />
              <Text style={styles.navigateText}>Quiter   </Text>
              <Ionicons name="log-out-outline" size={24} color="white" />

            </TouchableOpacity>
            <TouchableOpacity style={styles.navigateButtonStop} onPress={() => navigate('SupportChat')}>
              <Ionicons name="send-outline" size={30} color="white" />
              {
                (() => {
                  const hasUnread = supportMessages?.length > 0 && !supportMessages[0].lastMessage.seen && supportMessages[0].lastMessage.sender !== "client";

                  console.log(supportMessages?.[0]?.lastMessage?.seen, "bvbvnbb"); 

                  return (
                    hasUnread && (
                      <View  style={styles.unreadIndicator}>
                        <View style={styles.redButton} />
                      </View>
                    )
                  );
                })()
              }
            </TouchableOpacity>

          </View>
        </>



      ) : (
        <View style={styles.disabledView}>
  <Text style={styles.disabledText}>Veuillez activer la disponibilité .</Text>
  <TouchableOpacity style={styles.navigateButton} onPress={() => navigate('SupportChat')}>
    <Text style={styles.navigateButtonText}>Aller au CHAT SUPPORT</Text>
  </TouchableOpacity>
</View>

      )}

      {selectedOrder && <OrderDetailModal visible={!!selectedOrder} onClose={handleCloseModal} order={selectedOrder} />}
    </View>
  );
};

export default DriverOrdersScreen;
