import React, { useContext, useState } from 'react';
import { TouchableOpacity, View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../redux/AuthProvider';
import * as Device from 'expo-device';
import { BASE_URL, BASE_URLIO } from '@env';


const TabButton = ({ currentTab, setCurrentTab, title, iconName, unreadMessages, warn,isClientDesactiv , isDriverDesactiv, hasUnseenOrders, onLogin }) => {
  const [loading, setLoading] = useState(false);
  const { logout } = useContext(AuthContext);


  const handleLogout = async () => {
    setLoading(true);
    const deviceId = Device.osBuildId;

    try {
      const response = await fetch(`${BASE_URL}/api/clients/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();
      if (response.status === 200) {
        await logout();
        onLogin();
        Alert.alert('Déconnexion réussie', 'Vous avez été déconnecté.');
      } else {
        Alert.alert('Logout Failed', data.errors ? data.errors.join(', ') : data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Erreur', 'Une erreur est produite lors de la déconnexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={() => {
      if (title === "Se déconnecter") {
        handleLogout();
      } else {
        setCurrentTab(title);
      }
    }}>
      <View style={[styles.buttonContainer, { backgroundColor: currentTab === title ? 'beige' : 'transparent' }]}>
        {loading ? (
          <ActivityIndicator size="small" color="black" />
        ) : (
          <>
            <Ionicons
              name={iconName}
              size={25}
              color={currentTab === title ? "black" : "white"}
            />
            <Text style={[styles.buttonText, { color: currentTab === title ? "#0a5f6e" : "white" }]}>
              {title}
            </Text>
          </>
        )}

        {/* Show notification icon for unread messages */}
        {(title === "Chat Client" || title === "Chat Livreur") && unreadMessages && (
          <Ionicons
            name="notifications-outline"  // Or choose another notification icon
            size={20}
            color="red"
            style={styles.notificationIcon}
          />
        )}

        {title === "invité" && warn === false && (
         <Ionicons
         name="notifications-outline"  // Or choose another notification icon
         size={20}
         color="red"
         style={styles.notificationIcon}
       />
        )}

         {title === "Clients" && isClientDesactiv === true && (
         <Ionicons
         name="alert-circle-outline"  // Warning icon
         size={20}
         color="red"
         style={styles.notificationIcon}
       />
        )}


        {title === "Livreur" && isDriverDesactiv === true && (
         <Ionicons
         name="alert-circle-outline"  // Warning icon
         size={20}
         color="red"
         style={styles.notificationIcon}
       />
        )}


         {title === "Commandes" && hasUnseenOrders && (
          <Ionicons
            name="notifications-outline"
            size={20}
            color="red"
            style={styles.notificationIcon}
          />)}

      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 13,
    paddingRight: 35,
    borderRadius: 8,
    position: 'relative',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingLeft: 15,
  },
  notificationIcon: {
    position: 'absolute',
    top: 5,
    right: 10,
  },
});

export default TabButton;
