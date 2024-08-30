// SideMenu.js
import React from 'react';
import { View, Text,StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TabButton from './TabButton';  // Import TabButton component

const SideMenu = ({ currentTab, setCurrentTab }) => {
  return (
    <View style={{ justifyContent: 'flex-start', padding: 15 }}>
      {/* Profile Section */}
      <Ionicons name="person-circle" size={60} color="white" style={styles.profileIcon} />
      <Text style={styles.profileName}>Mehi Saadi</Text>

      <View style={{ flexGrow: 1, marginTop: 50 }}>
        {/* Tab Buttons */}
        {TabButton({ currentTab, setCurrentTab, title: "Home", iconName: "home-outline" })}
        {TabButton({ currentTab, setCurrentTab, title: "Search", iconName: "search-outline" })}
        {TabButton({ currentTab, setCurrentTab, title: "Clients", iconName: "people-outline" })}
        {TabButton({ currentTab, setCurrentTab, title: "Drivers", iconName: "car-outline" })}
        {TabButton({ currentTab, setCurrentTab, title: "Products", iconName: "pricetag-outline" })}
        {TabButton({ currentTab, setCurrentTab, title: "Services", iconName: "briefcase-outline" })}
        {TabButton({ currentTab, setCurrentTab, title: "Orders", iconName: "clipboard-outline" })}
        {TabButton({ currentTab, setCurrentTab, title: "Notifications", iconName: "notifications-outline" })}
        {TabButton({ currentTab, setCurrentTab, title: "Chat", iconName: "notifications-outline" })}

        {TabButton({ currentTab, setCurrentTab, title: "Settings", iconName: "settings-outline" })}
      </View>

      {/* Logout Button */}
      <View>
        {TabButton({ currentTab, setCurrentTab, title: "LogOut", iconName: "log-out-outline" })}
      </View>
    </View>
  );
};

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

export default SideMenu;
