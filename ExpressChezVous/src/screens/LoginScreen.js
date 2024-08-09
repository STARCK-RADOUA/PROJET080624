import React from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { styles } from './styles/loginstyle';

const { width } = Dimensions.get('window');  // Obtenez la largeur de l'écran

const LoginScreen = ({ navigation }) => {
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
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('QRScanner')}>
            <Text style={styles.linkText}>Crée un account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;
