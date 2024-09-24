// src/navigation/Navigation.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import OrderScreen from '../screens/DriverOrdersScreen';
import QrcodeGeneratorDriverScreen from '../screens/QrcodeGeneratorDriverScreen';
import SupportChat from '../screens/SupportChatScreen';
import { navigationRef } from '../utils/navigationRef'; // Import navigationRef
import OrderRoomScreen from '../screens/OrderRoomScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}> 
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Test"
          component={OrderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="QrcodeGeneratorDriverScreen"
          component={QrcodeGeneratorDriverScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="SupportChat"
          component={SupportChat}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="RoomScreen"
          component={OrderRoomScreen}
          options={{ title: 'Room', headerShown: true ,     gestureEnabled: true, // This enables the swipe back gesture
          }} // This will show the header with a back button
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
