

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import RegistrationWithLocationScreen from '../screens/RegistrationWithLocationScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ServicesScreen from '../screens/ServicesScreen';
import DrawerNavigator from './DrawerNavigator';
import ReceiptScreen from '../screens/ReceiptScreen';
import ShoppingCartScreen from '../screens/ShoppingCartScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import AdressForm from '../screens/AddressFormScreen';
import SupportChat from '../screens/SupportChatScreen';
import Logout from '../screens/logout';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import FeedBackScreen from '../screens/FeedBackScreen';
import QrcodeGeneratorScreenScreen from '../screens/QrcodeGeneratorScreen';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Registration" component={RegistrationScreen} />  
        <Stack.Screen name="RegistrationLC" component={RegistrationWithLocationScreen} options={{ headerShown: false }} />  
        <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />  
        <Stack.Screen name="Services" component={ServicesScreen} />
        <Stack.Screen name="feedback" component={FeedBackScreen} />


        {/* Renommer "Home" en "MainDrawerNavigator" pour éviter la redondance */}
        <Stack.Screen 
          name="Home" 
          component={DrawerNavigator} 
          options={{ headerShown: false }}  
        /> 
          <Stack.Screen name="QrcodeGeneratorScreen" component={QrcodeGeneratorScreenScreen} />

        <Stack.Screen name="SupportChat" component={SupportChat} />
        <Stack.Screen name="AdressForm" component={AdressForm} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Logout" component={Logout} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default AppNavigator;
