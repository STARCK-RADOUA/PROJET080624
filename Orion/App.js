// App.js
import React, { useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DriverScreen from './src/screens/DriverScreen';
import ClientScreen from './src/screens/ClientScreen';
import ProductScreen from './src/screens/ProductScreen';
import SideMenu from './src/components/SideMenu'; // Import SideMenu

export default function App() {
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
      case 'Drivers':
        return <DriverScreen />;
      case 'Clients':
        return <ClientScreen />;
      case 'Products':
        return <ProductScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Use SideMenu component */}
      <SideMenu currentTab={currentTab} setCurrentTab={setCurrentTab} styles={styles} />

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
    backgroundColor: '#f3b13e',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  profileIcon: {
    marginTop: 8
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20
  },
  menuIcon: {
    marginTop: 40,
  },
});
