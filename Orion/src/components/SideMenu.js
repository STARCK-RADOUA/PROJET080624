import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TabButton from './TabButton';  // Import TabButton component

const SideMenu = ({ currentTab, setCurrentTab, onLogin, unreadMessages,unreadAdminMessages ,  warn ,isClientDesactiv , isDriverDesactiv , userDetail , deliveredSeen , inProgressSeen , pendingSeen , spammedSeen , testSeen ,cancelledSeen}) => {
  const hasUnseenOrders = !deliveredSeen || !inProgressSeen || !pendingSeen || !spammedSeen || !testSeen || !cancelledSeen;

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Ionicons name="person-circle" size={60} color="white" style={styles.profileIcon} />
        <Text style={styles.profileName}>{userDetail} </Text>
      </View>

      <ScrollView style={styles.menuScroll}>
        <View style={styles.menuButtons}>
          {TabButton({ currentTab, setCurrentTab, title: "Accueil", iconName: "home-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Notifications", iconName: "notifications-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Clients", iconName: "people-outline" , isClientDesactiv})}
          {TabButton({ currentTab, setCurrentTab, title: "Livreur", iconName: "car-outline" , isDriverDesactiv})}
          {TabButton({ currentTab, setCurrentTab, title: "Produits", iconName: "pricetag-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Commandes", iconName: "clipboard-outline", hasUnseenOrders })}
          {TabButton({ currentTab, setCurrentTab, title: "Services", iconName: "briefcase-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Qr", iconName: "qr-code-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Historique Chat", iconName: "time-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "Chiffre d'affaire", iconName: "cash-outline" })}
          {TabButton({ currentTab, setCurrentTab, title: "invité", iconName: "stats-chart-outline"  , warn})}
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
    backgroundColor: '#333b81',
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
