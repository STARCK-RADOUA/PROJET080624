import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For modern icons
import { BASE_URLIO } from '@env';
import io from 'socket.io-client';
import { useFocusEffect } from '@react-navigation/native';

const ChatMainScreen = ({ navigation }) => {
  const [unreadClientMessages, setUnreadClientMessages] = useState(false);
  const [unreadDriverMessages, setUnreadDriverMessages] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const socket = io(BASE_URLIO);

      // Listen to updated chat messages
      socket.on('chatMessagesUpdated', (data) => {
        let hasUnreadClientMessages = false;
        let hasUnreadDriverMessages = false;

        data.messages.forEach((chat) => {
          // Check for unread client messages
          if (chat.role === 'client' && chat.lastMessage.seen === false && chat.lastMessage.sender !== 'admin') {
            hasUnreadClientMessages = true;
          }
          // Check for unread driver messages
          if (chat.role === 'driver' && chat.lastMessage.seen === false && chat.lastMessage.sender !== 'admin') {
            hasUnreadDriverMessages = true;
          }
        });

        setUnreadClientMessages(hasUnreadClientMessages);
        setUnreadDriverMessages(hasUnreadDriverMessages);
      });

      socket.emit('watchChatMessages');

      // Cleanup: Disconnect the socket when the screen is unfocused
      return () => {
        socket.disconnect();
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur l'App de Chat</Text>

      {/* Client Chat Button */}
      <TouchableOpacity
        style={styles.chatOption}
        onPress={() => navigation.navigate('ClientChatScreenComponent')}
      >
        <Ionicons name="person-outline" size={50} color="#4682B4" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.chatTitle}>Chat Client</Text>
          <Text style={styles.chatDescription}>Discutez avec les clients à propos de leurs commandes et demandes.</Text>
        </View>
        {/* Unread messages indicator for Client */}
        {unreadClientMessages && (
          <Ionicons name="notifications-outline" size={30} color="red" />
        )}
      </TouchableOpacity>

      {/* Driver Chat Button */}
      <TouchableOpacity
        style={styles.chatOption}
        onPress={() => navigation.navigate('DriverChatScreenComponent')}
      >
        <Ionicons name="bicycle-outline" size={50} color="#32CD32" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.chatTitle}>Chat Livreur</Text>
          <Text style={styles.chatDescription}>Communiquez avec les livreurs pour des mises à jour et la coordination.</Text>
        </View>
        {/* Unread messages indicator for Driver */}
        {unreadDriverMessages && (
          <Ionicons name="notifications-outline" size={30} color="red" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  chatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  icon: {
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  chatDescription: {
    fontSize: 14,
    color: '#6e6e6e',
  },
  unreadIcon: {
    color: 'red',
  },
});

export default ChatMainScreen;
