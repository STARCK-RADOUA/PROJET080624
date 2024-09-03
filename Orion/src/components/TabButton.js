import React, { useContext, useState } from 'react';
import { TouchableOpacity, View, Text, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '@env';
import * as Device from 'expo-device';
import { AuthContext,AuthProvider } from '../redux/AuthProvider'; // Import AuthContext
import LoginScreen from '../screens/LoginScreen';
const TabButton = ({ currentTab, setCurrentTab, title, iconName, socket,onLogin }) => {
  const [loading, setLoading] = useState(false);
  const { logout } = useContext(AuthContext);
  // Use the logout function from AuthContext

  const handleLogout = async () => {
    setLoading(true);
    const deviceId =  Device.osBuildId;
    console.log('------------------------------------');
    console.log('Logging out...', deviceId);
    console.log('------------------------------------');

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
        if (socket && socket.connected) {
          socket.disconnect();
        }
   await logout();
   
   onLogin()  // Clear authentication state
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
        handleLogout(); // Call the logout function when LogOut is pressed
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
      </View>
    </TouchableOpacity>
    
  );
};

export default TabButton;
