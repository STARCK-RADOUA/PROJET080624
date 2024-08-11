import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'; // Import the icon libraries
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ServicesScreen from '../screens/ServicesScreen';
import DrawerNavigator from './DrawerNavigator'; // Import the DrawerNavigator
import ReceiptScreen from '../screens/ReceiptScreen';
import ShoppingCartScreen from '../screens/ShoppingCartScreen';
import UserProfileScreen from '../screens/UserProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Services" component={ServicesScreen} />
        <Stack.Screen 
          name="Home" 
          component={TabNavigator} 
          options={{ headerShown: false }}  // Disable header for HomeScreen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen
        name="Home"
        component={DrawerNavigator}
        options={{
          title: 'Home',
          headerShown: false,
          tabBarActiveTintColor: 'orange',
          tabBarInactiveTintColor: 'black',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ReceiptScreen"
        component={ReceiptScreen}
        options={{
          title: 'Receipts',
          headerShown: false,
          tabBarActiveTintColor: 'orange',
          tabBarInactiveTintColor: 'black',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ShoppingCartScreen"
        component={ShoppingCartScreen}
        options={{
          title: 'Orders',
          headerShown: false,
          tabBarActiveTintColor: 'orange',
          tabBarInactiveTintColor: 'black',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="shopping-cart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarActiveTintColor: 'orange',
          tabBarInactiveTintColor: 'black',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
