import React, { useContext, useState } from 'react';
import { TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../redux/AuthProvider';
import * as Device from 'expo-device';

const TabButton = ({ currentTab, setCurrentTab, title, iconName, unreadMessages, onLogin }) => {
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
        Alert.alert('Logout Successful', 'You have been logged out.');
      } else {
        Alert.alert('Logout Failed', data.errors ? data.errors.join(', ') : data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Something went wrong during logout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={() => {
      if (title === "LogOut") {
        handleLogout();
      } else {
        setCurrentTab(title);
      }
    }}>
      <View style={{
        flexDirection: "row",
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: currentTab === title ? 'beige' : 'transparent',
        paddingLeft: 13,
        paddingRight: 35,
        borderRadius: 8,
        position: 'relative', // Ensure the dot is positioned correctly
      }}>
        {loading ? (
          <ActivityIndicator size="small" color="black" />
        ) : (
          <>
            <Ionicons
              name={iconName}
              size={25}
              color={currentTab === title ? "black" : "white"}
            />
            <Text style={{
              fontSize: 15,
              fontWeight: 'bold',
              paddingLeft: 15,
              color: currentTab === title ? "#0a5f6e" : "white"
            }}>{title}</Text>
          </>
        )}

        {/* Show red dot for unread messages in Chat */}
        {title === "Chat" && unreadMessages && (
          <View style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: 'red',
            position: 'absolute',
            top: 0,
            right: 10,
          }} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default TabButton;
