import React, { useEffect, useState } from 'react';
import { View, ImageBackground, StyleSheet, Text } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import TabNavigator from './TabNavigator';
import SupportChat from '../screens/SupportChatScreen';
import FeedBackScreen from '../screens/FeedBackScreen';
import Logout from '../screens/logout';
import { BASE_URL, BASE_URLIO } from '@env';
import axios from 'axios';
import io from 'socket.io-client';
import { getClientId } from '../services/userService';
const CustomDrawerContent = (props) => {
  const socket = io(BASE_URLIO);
  const [profileData, setProfileData] = useState({
    name: 'Loading...',
    phone: 'Loading...',
    points: 'Loading...',
  });

  // Utilisation de useEffect pour récupérer les données depuis une base de données ou une API
  useEffect(() => {
    const fetchData = async () => {
     



    
        const clientId = await  getClientId() ;

console.log('---------------ddddddddddddddddddddddddddeeeazzzartytuuoukjbjhcv---------------------');
console.log(clientId);
console.log('------------------------------------');
        socket.emit('getUserByClientId', {clientId});


        socket.on('userByClientId', async ({ user }) => {
          try {
            if(user){
              console.log("ghhhhhhhhhhhhhhhhhhhkkkkkkkkkkkkkkkkkkkkkkh")
              console.log(user)
              setProfileData({
                name: user.lastName+' '+user.firstName, // Nom récupéré de la base de données
                phone: user.phone, // Téléphone récupéré de la base de données
                points: user.points_earned,  });
            }
              // Points récupérés de la base de données
             
            
          } catch (error) {
            console.error('Error checking order status:', error);
          }
        });
      
    };

    fetchData();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/8498789sd.png')} // Remplace par ton image
      style={styles.backgroundImage}
    >
      <DrawerContentScrollView {...props}>
        <View style={styles.profileContainer}>
          <View style={styles.profileInfo}>
            {/* Nom et téléphone en disposition verticale */}
            <View style={styles.namePhoneColumn}>
              <Text style={styles.profileName}>{profileData.name}</Text>
              <Text style={styles.profileNumber}>{profileData.phone}</Text>
            </View>
            {/* Points alignés horizontalement avec le bloc nom/téléphone */}
            <Text style={styles.profilePoints}> {profileData.points}</Text>
            <Text style={styles.profileNumber}> points</Text>
          </View>
        </View>

        <DrawerItemList {...props} />
      </DrawerContentScrollView>
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
          backgroundColor: '#a5a2a29e',
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
      <Drawer.Screen name="SupportChat" component={SupportChat} />
      <Drawer.Screen name="FeedBack" component={FeedBackScreen} />
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
    flexDirection: 'row', // Affiche les informations (nom/téléphone et points) horizontalement
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  namePhoneColumn: {
    flexDirection: 'column', // Nom et téléphone alignés verticalement
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4, // Espacement entre le nom et le téléphone
  },
  profileNumber: {
    fontSize: 14,
    color: '#fff',
  },
  profilePoints: {
    fontSize: 45,
    fontWeight: 'bold',
    color: '#0fe668a9',
    marginLeft: 20, // Espacement entre les points et le bloc nom/téléphone
  },
});

export default DrawerNavigator;
