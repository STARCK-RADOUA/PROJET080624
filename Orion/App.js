import React, { useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons'; // Import flat icons

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DriverScreen from './src/screens/DriverScreen';
import ClientScreen from './src/screens/ClientScreen';
import ProductScreen from './src/screens/ProductScreen';



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
      <View style={{ justifyContent: 'flex-start', padding: 15 }}>
        {/* Profile Section */}
        <Ionicons name="person-circle" size={60} color="white" style={styles.profileIcon} />
        <Text style={styles.profileName}>Mehi Saadi</Text>

        <View style={{ flexGrow: 1, marginTop: 50 }}>
          {/* Tab Buttons */}
          {TabButton(currentTab, setCurrentTab, "Home", "home-outline")}
          {TabButton(currentTab, setCurrentTab, "Search", "search-outline")}
          {TabButton(currentTab, setCurrentTab, "Clients", "people-outline")}
          {TabButton(currentTab, setCurrentTab, "Drivers", "car-outline")}
          {TabButton(currentTab, setCurrentTab, "Products", "car-outline")}
          {TabButton(currentTab, setCurrentTab, "Services", "briefcase-outline")}
          {TabButton(currentTab, setCurrentTab, "Orders", "clipboard-outline")}
          {TabButton(currentTab, setCurrentTab, "Notifications", "notifications-outline")}
          {TabButton(currentTab, setCurrentTab, "Settings", "settings-outline")}
        </View>

        {/* Logout Button */}
        <View>
          {TabButton(currentTab, setCurrentTab, "LogOut", "log-out-outline")}
        </View>
      </View>

      <Animated.View style={{
        flex: 1,  // Ensure the screen takes full height
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
          flex: 1,  // Ensures the screen content takes full height
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

const TabButton = (currentTab, setCurrentTab, title, iconName) => {
  return (
    <TouchableOpacity onPress={() => {
      if (title === "LogOut") {
        // Log out actions
      } else {
        setCurrentTab(title);
      }
    }}>
      <View style={{
        flexDirection: "row",
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: currentTab === title ? 'white' : 'transparent',
        paddingLeft: 13,
        paddingRight: 35,
        borderRadius: 8,
        marginTop: 15
      }}>

        {/* Replace image with Ionicons icon */}
        <Ionicons
          name={iconName}
          size={25}
          color={currentTab === title ? "#5359D1" : "white"}
        />

        <Text style={{
          fontSize: 15,
          fontWeight: 'bold',
          paddingLeft: 15,
          color: currentTab === title ? "#5359D1" : "white"
        }}>{title}</Text>

      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,  // Ensures the SafeAreaView takes full height
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
