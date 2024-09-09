import { BASE_URL, BASE_URLIO } from '@env';

// App Navigatorimport React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NotificationMenu from './NotificationMenu'; // Importe le composant NotificationMenu
import AdminNotificationScreen from '../screens/AdminNotificationScreen'; // Importe le composant AdminNotificationScreen

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="NotificationMenu">
        <Stack.Screen name="NotificationMenu" component={NotificationMenu} options={{ title: 'Notifications' }} />
        <Stack.Screen name="AdminNotificationScreen" component={AdminNotificationScreen} options={{ title: 'Envoyer Notification' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
