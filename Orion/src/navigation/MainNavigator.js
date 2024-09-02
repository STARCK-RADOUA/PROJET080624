// src/navigation/MainNavigator.js
import React, { useRef, useState } from 'react';
import { Animated, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationScreen from '../screens/NotificationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DriverScreen from '../screens/DriverScreen';
import ClientScreen from '../screens/ClientScreen';
import ProductScreen from '../screens/ProductScreen';
import SideMenu from '../components/SideMenu';
import ServiceScreen from '../screens/ServiceScreen'; // Import SideMenu
import ChatHomeScreen from '../screens/ChatHomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
export default function MainNavigator({}) {
  const [currentTab, setCurrentTab] = useState("Home");
  const [showMenu, setShowMenu] = useState(false);

  const offsetValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const closeButtonOffset = useRef(new Animated.Value(0)).current;

  const renderScreen = () => {
    switch (currentTab) {
      case 'Home':
        return <HomeScreen />;
      case 'Search':
        return <SearchScreen />;
      case 'Notifications':
        return <NotificationScreen />;
      case 'Settings':
        return <SettingsScreen />;
         case 'Services':
        return <ServiceScreen />;
      case 'Drivers':
        return <DriverScreen />;
      case 'Clients':
        return <ClientScreen />;
      case 'Products':
        return <ProductScreen />;
        case 'Orders':
        return <OrdersScreen />;
    case 'Chat':
        return <ChatHomeScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SideMenu   currentTab={currentTab} setCurrentTab={setCurrentTab} styles={styles} />

      <Animated.View style={{
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
        transform: [
          { scale: scaleValue },
          { translateX: offsetValue }
        ]
      }}>
        <Animated.View style={{
          flex: 1,
          transform: [{
            translateY: closeButtonOffset
          }]
        }}>
          <TouchableOpacity onPress={() => {
            Animated.timing(scaleValue, {
              toValue: showMenu ? 1 : 0.88,
              duration: 300,
              useNativeDriver: true
            }).start();

            Animated.timing(offsetValue, {
              toValue: showMenu ? 0 : 230,
              duration: 300,
              useNativeDriver: true
            }).start();

            Animated.timing(closeButtonOffset, {
              toValue: !showMenu ? -30 : 0,
              duration: 300,
              useNativeDriver: true
            }).start();

            setShowMenu(!showMenu);
          }}>
            <Ionicons name={showMenu ? "close-outline" : "menu-outline"} size={30} color="black" style={styles.menuIcon} />
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
  profileIcon: {
marginTop: 30,
marginLeft: 15
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d6c6b8',
 
  },
  menuIcon: {
    marginTop: 40,
  },
});
