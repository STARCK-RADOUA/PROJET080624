

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import ShoppingCartScreen from '../screens/ShoppingCartScreen';
import UserProfileScreen from '../screens/UserProfileScreen';

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
  return (
    <Tab.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarActiveTintColor: 'orange',
          tabBarInactiveTintColor: 'black',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" color={color} size={size} />
          ),
        }}
      />
     
      <Tab.Screen
        name="ShoppingCartScreen"
        component={ShoppingCartScreen}
        options={{
          title: 'Orders',
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

export default TabNavigator;
