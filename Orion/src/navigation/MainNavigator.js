import React, { useRef, useState, useEffect } from 'react';
import { Animated, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import socketIOClient from "socket.io-client"; // Import socket.io client
import { BASE_URL } from '@env';
import DriverRevenueScreen from '../screens/DriverRevenueScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationMenu from '../components/NotificationMenu';
import SettingsScreen from '../screens/SettingsScreen';
import DriverScreen from '../screens/DriverScreen';
import ClientScreen from '../screens/ClientScreen';
import ProductScreen from '../screens/ProductScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ServiceScreen from '../screens/ServiceScreen'; 
import ChatHomeScreen from '../screens/ClientChatScreen';
import OrderChatHistoriqueScreen from '../screens/OrderChatHistoriqueScreen';
import WarnScreen from '../screens/WarnScreen';
import SideMenu from '../components/SideMenu';
import DriverChatScreenComponent from '../screens/DriverChatScreen';
import RevenueScreen from '../screens/RevenueScreen';
import QrScreen from '../screens/QrScreen';
import HomeScreenApp from '../screens/HomeScreenApp';
import axios from 'axios';
import * as Device from 'expo-device';
// Move socket initialization outside the component to avoid re-initialization
const socket = socketIOClient(BASE_URL);

const MainNavigator = ({ onLogin }) => {
  const [currentTab, setCurrentTab] = useState("Accueil");
  const [showMenu, setShowMenu] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(false);
  const [unreadAdminMessages, setUnreadAdminMessages] = useState(false);
  const [warn, setWarn] = useState();
  const [isClientDesactiv, setIsClientDesactiv] = useState();
  const [isDriverDesactiv, setIsDriverDesactiv] = useState();
  const [userDetail, setUserDetail] = useState();
  const [cancelledSeen, setCancelledSeen] = useState(true);
  const [deliveredSeen, setDeliveredSeen] = useState(true);
  const [inProgressSeen, setInProgressSeen] = useState(true);
  const [pendingSeen, setPendingSeen] = useState(true);
  const [spammedSeen, setSpammedSeen] = useState(true);
  const [testSeen, setTestSeen] = useState(true);
  const offsetValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const closeButtonOffset = useRef(new Animated.Value(0)).current;

  // Helper function for device ID
  const getDeviceId = async () => {
    return Device.osBuildId;
  };

  const getUserDetails = async () => {
    try {
      const deviceId = await getDeviceId();
      const response = await axios.post(`${BASE_URL}/api/sessions/get-user-details`, {
        deviceId: deviceId,
      });
      const clientDetails = response.data;
      console.log('User details:', clientDetails);
      setUserDetail(clientDetails.firstName + " " + clientDetails.lastName);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  useEffect(() => {
    // Emit necessary events and set up listeners only once
    socket.emit('requestLatestOrders');
    socket.emit('watchChatMessages');
    socket.emit('watchLatestWarn');
    socket.emit('checkActivationStatus');

    socket.on('latestOrders', (zita) => {
      const { latestOrders } = zita;

      // Update each status only if it's not null
      if (latestOrders.cancelled && latestOrders.cancelled.seen !== null) {
        setCancelledSeen(latestOrders.cancelled.seen);

        console.log(zita , 'zita')
        console.log(cancelledSeen) ; 
      }
      if (latestOrders.delivered && latestOrders.delivered.seen !== null) {
        setDeliveredSeen(latestOrders.delivered.seen);
      }
      if (latestOrders.in_progress && latestOrders.in_progress.seen !== null) {
        setInProgressSeen(latestOrders.in_progress.seen);
      }
      if (latestOrders.pending && latestOrders.pending.seen !== null) {
        setPendingSeen(latestOrders.pending.seen);
      }
      if (latestOrders.spammed && latestOrders.spammed.seen !== null) {
        setSpammedSeen(latestOrders.spammed.seen);
      }
      if (latestOrders.test && latestOrders.test.seen !== null) {
        setTestSeen(latestOrders.test.seen);
      }


    });

    socket.on('activationStatus', (data) => {
      if (data.clients !== isClientDesactiv) setIsClientDesactiv(data.clients);
      if (data.drivers !== isDriverDesactiv) setIsDriverDesactiv(data.drivers);
    });

    socket.on('chatMessagesUpdated', (data) => {
      const hasUnreadDriver = data.messages.some(message =>
        message.lastMessage.sender !== 'admin' && !message.lastMessage.seen && message.role === "client"
      );
      setUnreadMessages(hasUnreadDriver);

      const hasUnreadAdmin = data.messages.some(message =>
        message.lastMessage.sender !== 'admin' && !message.lastMessage.seen && message.role === "driver"
      );
      setUnreadAdminMessages(hasUnreadAdmin);
    });

    socket.on('newWarning', (data) => {
      setWarn(data.seen);
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off('latestOrders');
      socket.off('activationStatus');
      socket.off('chatMessagesUpdated');
      socket.off('newWarning');
    };
  }, []);

  const handleTabChange = (title) => {
    if (title === "Chat") setUnreadMessages(false);
    if (title === "Chat Livreur") setUnreadAdminMessages(false);
    setCurrentTab(title);
  
    // Close the menu when a tab is clicked
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  
    Animated.timing(offsetValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  
    Animated.timing(closeButtonOffset, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  
    setShowMenu(false);
  };
  
  const renderScreen = () => {
    switch (currentTab) {
      case 'Accueil':
        return <HomeScreenApp />;
      case 'Recherche':
        return <SearchScreen />;
      case 'Notifications':
        return <NotificationMenu />;
      case 'Paramètres':
        return <SettingsScreen />;
      case 'Services':
        return <ServiceScreen />;
      case 'Livreur':
        return <DriverScreen />;
      case 'Clients':
        return <ClientScreen />;
      case 'Historique Chat':
        return <OrderChatHistoriqueScreen />;
      case 'Produits':
        return <ProductScreen />;
      case 'Commandes':
        return <OrdersScreen />;
      case 'Chat Client':
        return <ChatHomeScreen />;
      case 'Chat Livreur':
        return <DriverChatScreenComponent />;
      case 'invité':
        return <WarnScreen />;
      case 'Qr':
        return <QrScreen />;
      case "Chiffre d'affaire":
        return <RevenueScreen />;
      default:
        return <HomeScreenApp />;
    }
  };

  const platformSpecificMargin = showMenu
    ? (Platform.OS === 'ios' ? 40 : 40)
    : (Platform.OS !== 'ios' ? 40 : 20);
   
  return (
    <SafeAreaView style={styles.container}>
      <SideMenu
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onLogin={onLogin}
        unreadMessages={unreadMessages}
        unreadAdminMessages={unreadAdminMessages}
        warn={warn}
        isClientDesactiv={isClientDesactiv}
        isDriverDesactiv={isDriverDesactiv}
        userDetail={userDetail}
        deliveredSeen={deliveredSeen} 
        inProgressSeen={inProgressSeen}
        pendingSeen={pendingSeen}
        spammedSeen={spammedSeen}
        testSeen={testSeen}
        cancelledSeen={cancelledSeen}
      />
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'white',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 9,
          paddingVertical: 7,
          borderRadius: showMenu ? 15 : 0,
          transform: [{ scale: scaleValue }, { translateX: offsetValue }],
        }}
      >
        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateY: closeButtonOffset }],
          }}
        >
          <TouchableOpacity
            onPress={() => {
              Animated.timing(scaleValue, {
                toValue: showMenu ? 1 : 0.88,
                duration: 300,
                useNativeDriver: true,
              }).start();

              Animated.timing(offsetValue, {
                toValue: showMenu ? 0 : 230,
                duration: 300,
                useNativeDriver: true,
              }).start();

              Animated.timing(closeButtonOffset, {
                toValue: !showMenu ? -30 : 0,
                duration: 300,
                useNativeDriver: true,
              }).start();

              setShowMenu(!showMenu);
            }}
          >
            <Ionicons
              name={showMenu ? "close-outline" : "menu-outline"}
              size={30}
              color="black"
              style={[styles.menuIcon, { marginTop: platformSpecificMargin }]}
            />
          </TouchableOpacity>
          {renderScreen()}
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333b81',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  menuIcon: {},
});

export default MainNavigator;
