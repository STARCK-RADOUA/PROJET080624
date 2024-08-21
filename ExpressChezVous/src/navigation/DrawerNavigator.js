import React, { useEffect, useState } from 'react';
import { View, ImageBackground, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Importer l'icône QR
import TabNavigator from './TabNavigator';
import SupportChat from '../screens/SupportChatScreen';


import Logout from '../screens/logout';
import { BASE_URLIO } from '@env';
import io from 'socket.io-client';
import { getClientId } from '../services/userService';
import { useNavigation } from '@react-navigation/native';
import Another from '../screens/Another';

const CustomDrawerContent = (props) => {
  const socket = io(BASE_URLIO);
  const [profileData, setProfileData] = useState({
    name: 'Loading...',
    phone: 'Loading...',
    points: 'Loading...',
  });
  const navigation = useNavigation();

  const handleQRCodePress = () => {
    navigation.navigate('QrcodeGeneratorScreen'); // Navigue vers l'écran de génération de QR code
  };

  // Utilisation de useEffect pour récupérer les données depuis une base de données ou une API
  useEffect(() => {
    const fetchData = async () => {
      const clientId = await getClientId();
      socket.emit('getUserByClientId', { clientId });
      socket.on('userByClientId', async ({ user }) => {
        if (user) {
          setProfileData({
            name: user.lastName + ' ' + user.firstName,
            phone: user.phone,
            points: user.points_earned,
          });
        }
      });
    };
    fetchData();
  }, []);

  return (
    <ImageBackground source={require('../assets/8498789sd.png')} style={styles.backgroundImage}>
      <DrawerContentScrollView {...props}>
        <View style={styles.profileContainer}>
          <View style={styles.profileInfo}>
            <View style={styles.namePhoneColumn}>
              <Text style={styles.profileName}>{profileData.name}</Text>
              <Text style={styles.profileNumber}>{profileData.phone}</Text>
            </View>
            <Text style={styles.profilePoints}>{profileData.points}</Text>
            <Text style={styles.profileNumber}> points</Text>
          </View>
        </View>

        <DrawerItemList {...props} />
        {/* Icône QR et texte */}
      
      </DrawerContentScrollView>
        <TouchableOpacity style={styles.qrButton} onPress={handleQRCodePress}>
          <Icon name="qrcode-scan" size={200} color="#fff" />
          <Text style={styles.qrText}>génère un code QR </Text>
        </TouchableOpacity>
    </ImageBackground>
  );
};

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
  

    <Drawer.Navigator
      initialRouteName="ExpressChezVous"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#868383b7',
          height: '100%',
          borderTopRightRadius: 25,
          borderBottomRightRadius: 25,
          borderBottomLeftRadius: 25,
          width: 280,
        },
        overlayColor: 'rgba(0, 0, 0, 0.9)',
      }}
    >
      <Drawer.Screen name="ExpressChezVous"  component={TabNavigator} />
      <Drawer.Screen name="Client" screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#860383b7',
          height: '100%',
          borderTopRightRadius: 25,
          borderBottomRightRadius: 25,
          borderBottomLeftRadius: 25,
          width: 280,
        }, overlayColor: 'rgba(0, 0, 0, 0.9)',}} component={SupportChat} />
  
  <Drawer.Screen name="Admin" component={Another} />

      <Drawer.Screen name="Logout" component={Logout} />
    </Drawer.Navigator>
  
  );
};

// Styles améliorés pour l'image d'arrière-plan, profil et éléments du menu
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    height: '15%',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  namePhoneColumn: {
    flexDirection: 'column',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileNumber: {
    fontSize: 14,
    color: '#fff',
  },
  profilePoints: {
    fontSize: 45,
    fontWeight: 'bold',
    color: '#0fe668a9',
    marginLeft: 20,
  },
  qrButton: {
    flexDirection: 'column', // Aligner en ligne
    alignItems: 'center', // Centrer verticalement
    backgroundColor: '#ffbf4800', // Couleur du fond
   padding: 10,
    borderRadius: 30,
    marginTop: 20,
    
    bottom: 30,
  },
  qrText: {
    color: '#fff', // Couleur du texte
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10 // Espace entre l'icône et le texte
  },
});

export default DrawerNavigator;
