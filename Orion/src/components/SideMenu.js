import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TabButton from './TabButton';  // Import TabButton component

const SideMenu = ({ currentTab, setCurrentTab, onLogin, unreadMessages, unreadAdminMessages }) => {
  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Ionicons name="person-circle" size={60} color="white" style={styles.profileIcon} />
        <Text style={styles.profileName}>Mehdi Saadi</Text>
      </View>

      <ScrollView style={styles.menuScroll}>
        <View style={styles.menuButtons}>
          {TabButton({ currentTab, setCurrentTab, title: "Accueil", iconName: "home-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Notifications", iconName: "notifications-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Clients", iconName: "people-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Livreur", iconName: "car-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Produits", iconName: "pricetag-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Commandes", iconName: "clipboard-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Services", iconName: "briefcase-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Historique Chat", iconName: "time-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Analyse", iconName: "stats-chart-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Chiffre d'affaire", iconName: "cash-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "invité", iconName: "stats-chart-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Chat Client", iconName: "send-outline", unreadMessages })}
          {TabButton({ currentTab, setCurrentTab, title: "Chat Livreur", iconName: "chatbubble-ellipses-outline", unreadMessages: unreadAdminMessages })}
          {TabButton({ currentTab, setCurrentTab, title: "Recherche", iconName: "search-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Paramètres", iconName: "settings-outline" })}
        </View>
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.logoutButtonContainer}>
        {TabButton({ currentTab, setCurrentTab, title: "LogOut", iconName: "log-out-outline", onLogin })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10515a',
    padding: 15,
    flexDirection: 'column',
  },
  profileSection: {
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  profileIcon: {
    marginTop: 30,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d6c6b8',
  },
  menuScroll: {
    flex: 1,
  },
  menuButtons: {
    flexGrow: 1,
  },
  logoutButtonContainer: {
    justifyContent: 'flex-end',
  },
});

export default SideMenu;
