

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import ShoppingCartScreen from '../screens/ShoppingCartScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import SupportChat from '../screens/SupportChatScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';

import Logout from '../screens/logout';

import TabNavigator from './TabNavigator';
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Home" component={TabNavigator} />
      <Drawer.Screen name="SupportChat" component={SupportChat} />
      

      <Drawer.Screen name="FeedBack" component={FeedBackScreen} />
       <Drawer.Screen name="Logout" component={Logout} />   
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
