import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ServicesScreen from '../screens/ServicesScreen';
import DrawerNavigator from './DrawerNavigator'; // Importez le DrawerNavigator

const Stack = createStackNavigator();

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
          component={DrawerNavigator} 
          options={{ headerShown: false }}  // Désactive la barre d'en-tête pour HomeScreen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
