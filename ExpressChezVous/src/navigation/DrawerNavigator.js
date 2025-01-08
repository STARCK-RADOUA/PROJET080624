import React, { useEffect, useState } from 'react';
import { View, ImageBackground, Dimensions, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // QR Code icon
import TabNavigator from './TabNavigator';
import SupportChat from '../screens/SupportChatScreen';
import Logout from '../screens/logout';
import { getClientId } from '../services/userService';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as Device from 'expo-device';
import { useFocusEffect } from '@react-navigation/native';
import { io } from 'socket.io-client';
import { BASE_URLIO, BASE_URL } from '@env';

const { width , height} = Dimensions.get('window');

const deviceId = Device.osBuildId;

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

      <TouchableOpacity style={styles.qrButton} onPress={handleQRCodePress}>
        <Icon name="qrcode-scan" size={width*0.09} color="#ada2a2" />
        <Text style={styles.qrText}>   génère un code QR</Text>
      </TouchableOpacity>
      {/* Logout Button at Bottom */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Logout')}>
        <Icon name="logout" size={24} color="#fff" />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {

  
  
  const [deviceId, setDeviceId] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const getDeviceId = React.useCallback(async () => {
    const id = Device.osBuildId; // Ensure this is synchronous
    setDeviceId(id);
  }, []);
  useEffect(() => {

    getDeviceId();

    const deviceId = Device.osBuildId;

    if (deviceId) {
      const socket = io(BASE_URLIO, {
        query: { deviceId },
      });
      socket.emit('watchSupportChatMessagesDriver', deviceId);

      socket.on('SupportchatMessagesUpdatedForDriver', (data) => {
        const filteredMessages = data.messages.filter((message) => message.lastMessage);

        if (filteredMessages.length > 0) {
          setSupportMessages(filteredMessages);

          // Check if there are any unread messages and update the state
          const unread = filteredMessages.some(
            (msg) => !msg.lastMessage.seen && msg.lastMessage.sender !== 'client'
          );
          setHasUnreadMessages(unread);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [deviceId]);
  useFocusEffect(
    React.useCallback(() => {
      getDeviceId();

      if (deviceId) {
        const socket = io(BASE_URLIO, {
          query: { deviceId },
        });
        socket.emit('watchSupportChatMessagesDriver', deviceId);

        socket.on('SupportchatMessagesUpdatedForDriver', (data) => {
          const filteredMessages = data.messages.filter((message) => message.lastMessage);

          if (filteredMessages.length > 0) {
            setSupportMessages(filteredMessages);

            // Check if there are any unread messages and update the state
            const unread = filteredMessages.some(
              (msg) => !msg.lastMessage.seen && msg.lastMessage.sender !== 'client'
            );
            setHasUnreadMessages(unread);
          }
        });

        return () => {
          socket.disconnect();
        };
      }
    }, [deviceId])
  );

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
          drawerIcon: ({ color, size }) => {
            // Check if there are unread messages
            const hasUnread =
              supportMessages?.length > 0 &&
              !supportMessages[0]?.lastMessage?.seen &&
              supportMessages[0]?.lastMessage?.sender !== "client";
  
            return (
              <View style={{ position: 'relative' }}>
                
                {/* Unread Indicator */}
                {hasUnread && (
                  <View style={styles.unreadIndicator}>
                    <View style={styles.redButton} />
                  </View>
                )}
                {/* Chat Icon */}
                <Icon name="chat-outline" color={color} size={size} />
  
              </View>
            );
          },
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
    flexDirection: 'row',
    alignItems: 'center',
    width: width*0.6,
    height: height*0.1,
    marginLeft: "5%",
    borderRadius: 30,
    marginTop: 20,
    padding: 10,
    bottom: height*0.1,
          // Thickness of the border
  },
  qrText: {
    color: '#d1d1ce', // Gold for the QR text
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 10,
    left: "40%",
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
    fontSize: 15,
    fontWeight: 'bold',
  },
  redButton: {
    width: 10,  // size of the red dot
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
});

export default DrawerNavigator;
