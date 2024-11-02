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
import SystemDownScreen from '../screens/SystemDownScreen';
import SplashScreen from '../screens/SplashScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}> 
      <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={OrderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="QrcodeGeneratorDriverScreen"
          component={QrcodeGeneratorDriverScreen}
          options={{ title: 'Parrainage', headerShown: true ,    // This enables the swipe back gesture
          }} 
        />
        <Stack.Screen
          name="SupportChat"
          component={SupportChat}
          options={{ headerShown: false }}
        />  
         <Stack.Screen
          name="SystemDownScreen"
          component={SystemDownScreen}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="RoomScreen"
          component={OrderRoomScreen}
          options={{ title: 'Room', headerShown: true ,    // This enables the swipe back gesture
          }} // This will show the header with a back button
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
