import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';
import { useNavigation } from '@react-navigation/native';
import RoomScreen from '../screens/RoomScreen';
import ClientChatScreen from '../screens/ClientChatScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
const ClientChatScreenComponent = () => {
  const navigation = useNavigation(); // Hook to get navigation object
  
  const [unreadMessages, setUnreadMessages] = useState(false);

  useEffect(() => {
    const socket = io(BASE_URLIO);
    socket.emit('watchChatMessages');

    socket.on('chatMessagesUpdated', (data) => {
      const hasUnread = data.messages.some(
        (message) => message.role === 'client' && !message.lastMessage.seen && message.lastMessage.sender !== 'admin'
      );
      setUnreadMessages(hasUnread);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat Client</Text>
      <TouchableOpacity
        style={styles.chatOption}
        onPress={() => navigation.navigate('ClientChatScreenComponent')}
      >
        <Ionicons name="person-outline" size={50} color="#4682B4" />
        {unreadMessages && <Ionicons name="notifications-outline" size={30} color="red" />}
      </TouchableOpacity>
    </View>
  );
};
const Stack = createStackNavigator();
export const ClientChatScreenComponentApp = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ClientChatScreen">
        <Stack.Screen name="ClientChatScreen" component={ClientChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RoomScreen" component={RoomScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chatOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ClientChatScreenComponentApp;
