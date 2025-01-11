import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ImageBackground, Dimensions, ActivityIndicator, Alert, Animated,  ScrollView } from 'react-native';
import * as Device from 'expo-device';
import io from 'socket.io-client';
import * as Location from 'expo-location';
import { styles } from './styles/loginstyle';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BASE_URL, BASE_URLIO } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../utils/navigationRef'; // Import navigate function

const { width } = Dimensions.get('window');
const deviceId = Device.osBuildId;

const socket = io(BASE_URLIO, {
  query: {
    deviceId: deviceId,  // Pass the unique deviceId
  },
});
const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLocationObtained, setIsLocationObtained] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [location, setLocation] = useState(null);
  const deviceId = Device.osBuildId;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const [phoneError, setPhoneError] = useState('');

  const [hasNavigated, setHasNavigated] = useState(false); // Track if we've already navigated
  useEffect(() => {
    const deviceId = Device.osBuildId;

    const socket1 = io(BASE_URLIO, )

    socket1.emit('checkActivation', { deviceId });

    socket1.on('activationStatus', (status) => {
      console.log('Activation status received:', status);
      if (status.activated === false && status.none === true) {
        navigation.replace('Loading');
      } 
        
    });

    return () => {
      socket1.off('activationStatus');
    };
  }, [navigation]);

  useEffect(() => {
    // Récupérer la localisation en premier
  
if(isLocationObtained == false){
 fetchCurrentLocation();
}


   const validatePhoneNumber = (phone) => {
      const phoneRegex = /^(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}$/;
      return phoneRegex.test(phone);
    };

    if (phone !== '' && !validatePhoneNumber(phone)) {
      setPhoneError('Invalid phone number format.');
    } else {
      setPhoneError('');
    }

    // Fetch the location once the component mounts
   

    Animated.spring(logoAnim, {
      toValue: 1,
      friction: 2,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Connexion au socket
 

    // Écouter l'événement d'activation de l'administrateur
    socket.on('adminActivateClient', () => {
      console.log('Admin activated Client');
      fetchCurrentLocation();
    });

    return () => {
      socket.off('adminActivateClient');
    };
  }, [isLoginSuccess,phone,phoneError]);

  // Fonction pour obtenir la localisation
  const handleGetLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'La permission de localisation est requise pour continuer.');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
    setIsLocationObtained(true);

    // Tenter l'auto-login une fois la localisation obtenue
    autoLogin(currentLocation.coords);
  };
  const fetchCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission Denied', 'You need to allow location access to continue.');
        Alert.alert('Permission refusée', 'La permission de localisation est requise pour continuer.');
        return;
      }
  
      setLoading(true);
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // Try setting high accuracy for better results
        timeout: 10000, // Set a timeout in case the location takes too long to fetch
      });
  
      if (location) {
        console.log('Current Location:', location);
        setLocation(location.coords); // Store the coordinates
        setIsLocationObtained(true);
        setLoading(false);
        autoLogin(location.coords);
        console.log('Location Obtained:', location.coords); // Enable form fields once location is fetched
      } else {
        console.error('Error fetching location. Please try again.');
        Alert.alert('Erreur de localisation', 'Impossible de récupérer la localisation.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error during location fetch:', error);
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la récupération de la localisation.');
      setLoading(false);
    }
  };







  const checkIsScanSuccess = async () => {
    try {
      const registrationData = await AsyncStorage.getItem('registrationTimestamp');
  
      if (registrationData) {
        const parsedData = JSON.parse(registrationData); // Parse l'objet JSON
        const { timestamp, uniqueId } = parsedData;
        console.log('Stored registration  from login value:', timestamp , uniqueId); 

        const now = new Date().getTime();
        const elapsed = now - parseInt(timestamp, 10);
        if (timestamp) {
          const elapsed = now - parseInt(timestamp, 10);
   if (elapsed > 15 * 60 * 1000) { // 15 minutes
            await AsyncStorage.removeItem('registrationTimestamp');
            console.log('Registration timestamp  no more registration removed.');
          
          }

          if (elapsed < 15 * 60 * 1000) { // 15 minutes
           
          console.log('Navigating  from login to registration');
          setHasNavigated(true); // Prevent further navigation
          navigate('Registration');
          console.log('------------------------------------');
          console.log('Elapsed time since from login last registration:', elapsed);
          console.log('------------------------------------');
       
          }

        }
  
     
      } else {
        console.log('No stored order found or already navigated.');
      }
    } catch (error) {
      console.error('Error parsing stored order:', error);  
    }
  };

  useEffect(() => {
    checkIsScanSuccess();

  }, []); // Ensure this runs once when the component is mounted

  // Fonction d'auto-login
  const autoLogin = async (currentLocation) => {
    console.log('Tentative d\'auto-login...');
   
    if (deviceId ) {



      socket.emit('autoLogin', { deviceId, location: currentLocation });

      socket.on('loginSuccess', () => {
        // Rediriger vers la page des services
        navigation.reset({
          index: 0,
          routes: [{ name: 'Services' }],
        });
        setIsLoginSuccess(true);
      });

      socket.on('loginFailure', () => {
      });
    }
  };

  // Fonction de login manuel
  const manualLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Erreur', 'Veuillez remplir les champs requis.');
      return;
    }

    if (!isLocationObtained) {
      await fetchCurrentLocation();
    }

    try {
      setLoading(true);

      const payload = {
        phone: phone.trim(),
        password: password.trim(),
        deviceId,
        location,
      };

      const response = await fetch(`${BASE_URL}/api/clients/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Services' }],
        });
      } else {
        Alert.alert('Échec de la connexion', data.errors ? data.errors.join(', ') : data.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
                         <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>

          <View style={styles.container1}>
          <ImageBackground source={require('../assets/8498789sd.png')} style={styles.backgroundImage}>

<Animated.View style={[styles.imageContainer, { transform: [{ scale: logoAnim }] }]}>
  <Image
    source={require('../assets/images/8498789.png')}
    style={[styles.image, { width: width, height: width }]}
  />
</Animated.View>
</ImageBackground>
            <View style={styles.container}>
         
              <TextInput
                style={styles.input}
                placeholder="Numéro de Téléphone"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
                    {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

              <TextInput
                style={styles.input}
                placeholder="Mot de Passe"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity style={styles.button} onPress={manualLogin}>
                <Text style={styles.buttonText}>Se connecter</Text>
              </TouchableOpacity>

              <View style={styles.horizontalLayout}>
                <TouchableOpacity onPress={() => navigation.navigate('RegistrationLC')}>
                  <Text style={styles.linkText}>Créer un compte</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('QRScanner')}>
                  <Icon name="qrcode-scan" size={40} color="#000" />
                </TouchableOpacity>
                
              </View>
           
              {loading && <ActivityIndicator size="large" color="orange" />}

               
            </View>
        

          </View>
            </ScrollView>

  );
};

export default LoginScreen;
