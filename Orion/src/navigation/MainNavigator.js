import React, { useRef, useState, useEffect } from 'react';
import { Animated, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import socketIOClient from "socket.io-client"; // Import socket.io client
import { BASE_URL } from '@env';

import HomeScreen from '../screens/HomeScreen';
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

const MainNavigator = ({ onLogin }) => {
  const [currentTab, setCurrentTab] = useState("Accueil");
  const [showMenu, setShowMenu] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(false); // Track unread driver messages
  const [unreadAdminMessages, setUnreadAdminMessages] = useState(false); // Track unread admin messages

  const offsetValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const closeButtonOffset = useRef(new Animated.Value(0)).current;

  // Initialize socket
  const socket = socketIOClient(BASE_URL);

  useEffect(() => {
    // Request initial chat messages on connect
    socket.emit('watchChatMessages');

    // Listen for the updated messages when they are received from the server
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

    // Cleanup socket listener
    return () => {
      socket.off('chatMessagesUpdated');
    };
  }, [socket]);

  const handleTabChange = (title) => {
    if (title === "Chat") {
      setUnreadMessages(false); // Remove red dot when Chat is clicked
    }
    if (title === "Chat Livreur") {
      setUnreadAdminMessages(false); // Remove red dot when Admin Chat is clicked
    }
    setCurrentTab(title);
  };

  const renderScreen = () => {
    switch (currentTab) {
      case 'Accueil':
        return <HomeScreen />;
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
      case 'Analyse':
        return <WarnScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Get platform-specific margin
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
              style={[styles.menuIcon, { marginTop: platformSpecificMargin }]} // Apply platform-specific margin
            />
          </TouchableOpacity>

          {renderScreen()}
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10515a',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  menuIcon: {
    // Dynamic marginTop is handled in-line where the Ionicons component is used
  },
});

export default MainNavigator;
