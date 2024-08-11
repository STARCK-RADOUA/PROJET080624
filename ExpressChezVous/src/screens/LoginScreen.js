import React, { useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ImageBackground, Dimensions, ActivityIndicator } from 'react-native';
import * as Device from 'expo-device';  // Pour obtenir l'ID de l'appareil
import io from 'socket.io-client';
import { styles } from './styles/loginstyle';

const { width } = Dimensions.get('window');  // Obtenez la largeur de l'écran

const socket = io('http://192.168.8.131:4000');  // Remplacez par l'URL de votre serveur

const LoginScreen = ({ navigation }) => {

  useEffect(() => {
    

    
  }, [navigation]);
  const autoLogin = async () => {
    const deviceId = Device.osBuildId;  // Récupérez l'ID de l'appareil

    if (deviceId) {
      socket.emit('autoLogin', { deviceId });  // Envoyez l'ID de l'appareil au serveur pour vérification

      socket.on('loginSuccess', () => {
        navigation.replace('Services');  // Connectez l'utilisateur automatiquement
      });

      socket.on('loginFailure', () => {
        navigation.replace('QRScanner');  // Redirigez vers l'écran de création de compte si l'ID n'est pas trouvé
      });
    } else {
      navigation.replace('QRScanner');
    }
  };
  return (
    <ImageBackground source={require('../assets/8498789sd.png')} style={styles.backgroundImage}>
      <View style={styles.container1}>
        
        {/* Conteneur de l'image agrandie */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/8498789.png')}
            style={[styles.image, { width: width, height: width }]}  // Prend toute la largeur de l'écran
          />
        </View>

        <View style={styles.container}>
          <TextInput style={styles.input} placeholder="Nom" />
          <TextInput style={styles.input} placeholder="Numéro de Téléphone" keyboardType="phone-pad" />
          <TouchableOpacity style={styles.button}onPress={autoLogin()}>
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('QRScanner')}>
            <Text style={styles.linkText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;
