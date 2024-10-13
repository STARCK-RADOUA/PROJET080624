import React, { useEffect, useState } from 'react';
import { View, ImageBackground, Dimensions, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // QR Code icon
import TabNavigator from './TabNavigator';
import SupportChat from '../screens/SupportChatScreen';
import Logout from '../screens/logout';
import { BASE_URLIO } from '@env';
import io from 'socket.io-client';
import { getClientId } from '../services/userService';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const CustomDrawerContent = (props) => {
  const socket = io(BASE_URLIO);
  const [profileData, setProfileData] = useState({
    name: 'Loading...',
    phone: 'Loading...',
    points: 'Loading...',
  });
  const navigation = useNavigation();

  const handleQRCodePress = () => {
    navigation.navigate('Parrainage');
  };

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
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <View style={styles.profileCard}>
            <Icon name="account-circle" size={80} color="#fff" style={styles.profileIcon} />
            <View style={styles.namePhoneColumn}>
              <Text style={styles.profileName}>{profileData.name}</Text>
              <Text style={styles.profileNumber}>+33 {profileData.phone}</Text>
            </View>
            <Text style={styles.profilePoints}>{profileData.points}</Text>
            <Text style={styles.pointsLabel}>points</Text>
          </View>
        </View>

        {/* Drawer Items */}
        <DrawerItemList
          {...props}
          labelStyle={{
            color: '#fff', // Set the drawer items to white
            fontSize: 16,
          }}
        />
      </DrawerContentScrollView>

      {/* QR Code Button */}
      <TouchableOpacity style={styles.qrButton} onPress={handleQRCodePress}>
        <Icon name="qrcode-scan" size={200} color="#fff" />
        <Text style={styles.qrText}>génère un code QR</Text>
      </TouchableOpacity>

      {/* Logout Button at Bottom */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Logout')}>
        <Icon name="logout" size={24} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
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
          backgroundColor: '#1a1a1a', // Dark background for the drawer
          height: '100%',
          borderTopRightRadius: 25,
          borderBottomRightRadius: 45,
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
        drawerActiveTintColor: '#d4af37', // Gold color for active item
        drawerInactiveTintColor: '#ccc',  // Light gray for inactive items
        drawerActiveBackgroundColor: '#1f1f1f', // Darker background for active item
        drawerInactiveBackgroundColor: '#1a1a1a', // Dark background for inactive items
        drawerItemStyle: {
          borderRadius: 15, // Rounded corners for drawer items
          marginVertical: 5,
        },
      }}
    >
      <Drawer.Screen
        name="ExpressChezVous"
        component={TabNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="SupportChat"
        component={SupportChat}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="chat-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    height: height * (Platform.OS === 'ios' ? 0.20 : 0.20),
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
    opacity: 0.95,
    backgroundColor: '#1a1a1a', // Dark background for a luxurious feel
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileCard: {
    width: '90%',
    backgroundColor: '#1f1f1f', // Dark background for the card
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
  },
  profileIcon: {
    marginBottom: 10,
    color: '#d4af37', // Gold color for the icon
  },
  namePhoneColumn: {
    alignItems: 'center',
    marginBottom: 10,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d4af37', // Gold for name
    marginBottom: 4,
  },
  profileNumber: {
    fontSize: 16,
    color: '#ccc', // Lighter grey for the phone number
  },
  profilePoints: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2dc453', // Gold for points
  },
  pointsLabel: {
    fontSize: 18,
    color: '#ccc', // Lighter grey for points label
  },
  qrButton: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '90%',
    marginLeft: "5%",
    backgroundColor: '#b49324', // Transparent gold background
    borderRadius: 30,
    marginTop: 20,
    padding: 10,
    bottom: 70,
    shadowColor: '#e2bb2f',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,        // Thickness of the border
    borderColor: '#2dc453', 
  },
  qrText: {
    color: '#313130', // Gold for the QR text
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 10,
    left: "45%",
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4af37', // Gold background for the logout button
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 5,
  },
  logoutText: {
    color: '#1f1f1f', // Dark text on the gold button
    fontSize: 18,
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default DrawerNavigator;
