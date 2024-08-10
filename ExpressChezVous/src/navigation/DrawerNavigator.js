import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Cart" component={HomeScreen} />
      <Drawer.Screen name="Orders" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={HomeScreen} />
      <Drawer.Screen name="Logout" component={HomeScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
