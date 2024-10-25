

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
import ParrainageScreen from '../screens/Parrainage';
import { DataProvider } from './DataContext'
import { navigationRef } from '../utils/navigationRef'; 
import SystemDownScreen from '../screens/SystemDownScreen';

const Stack = createStackNavigator();
const AppNavigator = () => {
  return (
    <DataProvider>
    <NavigationContainer ref={navigationRef}> 
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Registration" component={RegistrationScreen} options={{ headerShown: false }}/>  
        <Stack.Screen name="RegistrationLC" component={RegistrationWithLocationScreen} options={{ headerShown: false }} />  
        <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />  
        <Stack.Screen name="Services" component={ServicesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="feedback" component={FeedBackScreen}  options={{ headerShown: false }}/>

        <Stack.Screen  name="SystemDownScreen"
          component={SystemDownScreen}
          options={{ headerShown: false }}
        />
        {/* Renommer "Home" en "MainDrawerNavigator" pour éviter la redondance */}
        <Stack.Screen 
          name="Home" 
          component={DrawerNavigator} 
          options={{ title: 'Accueil', headerShown: false ,    // This enables the swipe back gesture
          }}  
        /> 
          <Stack.Screen name="Parrainage" component={ParrainageScreen} />
          <Stack.Screen name="ShoppingCartScreen" component={ShoppingCartScreen} />

        <Stack.Screen name="SupportChat" component={SupportChat}   options={{ headerShown: false }}  />
        <Stack.Screen name="AdressForm" options={{ title: 'Nouvelle Adresse', headerShown: true ,    // This enables the swipe back gesture
          }}  component={AdressForm} />
        <Stack.Screen name="PaymentScreen" options={{ title: 'Paiement', headerShown: true ,    // This enables the swipe back gesture
          }}  component={PaymentScreen} />
        <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Logout" component={Logout} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
    </DataProvider>
  );
};


export default AppNavigator;
