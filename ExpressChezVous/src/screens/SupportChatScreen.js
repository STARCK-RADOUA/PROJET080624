import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Dimensions, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import io from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';  // Import for futuristic send icon
import { BASE_URLIO, BASE_URL } from '@env';
import { getClientId } from '../services/userService';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as Application from 'expo-application';


const { width, height } = Dimensions.get('window');

const ClientChatScreen = ({ navigation }) => {
  const adminId = '66bac40871e4a7ed9e6fc705';  // Static adminId
  const [messages, setMessages] = useState([]);  // Chat messages
  const [newMessage, setNewMessage] = useState('');  // Input message
  const [chatId, setChatId] = useState(null);  // Chat ID obtained after initiation
  const [deviceId, setDeviceId] = useState(null);

  const userType = 'Client';
  const socket = useRef(io(BASE_URLIO)).current;  // Initialize socket.io client
  const flatListRef = useRef(null);  // Reference for FlatList

  const getDeviceId = async () => {
    const id = await Application.applicationId
    setDeviceId(id);
  };

  useEffect(() => {
    getDeviceId() ;
  }, [deviceId]);

  useFocusEffect(
    React.useCallback(() => {
      const markMessagesAsSeen = async () => {
        try {
          if (chatId) {
            await axios.post(`${BASE_URL}/api/chats/mark-seenFC`, {
              chatId,
            });
            console.log("Messages marked as seen");
          }
        } catch (error) {
          console.error("Error marking messages as seen:", error);
        }
      };

      markMessagesAsSeen();

      return () => {
        console.log("Cleanup on screen exit");
      };
    }, [chatId])
  );

  useEffect(() => {
    const initiateChat = async () => {
      const userId = await getClientId();
      console.log("Client ID:", userId);
      console.log('Initiating chat between client and admin');

      socket.emit('initiateChat', { adminId, userId, userType });

      socket.on('chatDetails', (data) => {
        setChatId(data.chatId);
        const lastMessage = data.messages.length > 0 ? data.messages[data.messages.length - 1] : null;
        if (lastMessage && lastMessage.sender === 'admin' && !lastMessage.seen) {
          const unseenMessages = data.messages.filter(message => !message.seen && message.sender ==="admin"  );
          setMessages(unseenMessages);
        }
      });

      socket.on('newMessage', (messageData) => {
        setMessages((prevMessages) => [...prevMessages, messageData.message]);  // Append new message
      });
    };

    initiateChat();

    return () => {
      socket.off('chatDetails');
      socket.off('newMessage');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() && chatId) {
      console.log(deviceId , "gj")
      socket.emit('sendMessage', {
        chatId,
        sender: 'client',
        content: newMessage,
        deviceId  : deviceId
      });
      setNewMessage('');
    }
  };

  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    const hours = messageDate.getHours().toString().padStart(2, '0');
    const minutes = messageDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderMessage = ({ item }) => (
    <View style={item.sender === 'client' ? styles.messageContainerClient : styles.messageContainerAdmin}>
      <Text style={styles.sender}>{item.sender === 'client' ? 'You' : 'Admin'}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.chatTitleContainer}>
        <Text style={styles.chatTitleText}>Chat {chatId ? 'Active' : 'Connecting...'}</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        style={styles.chatList}
        contentContainerStyle={styles.chatContentContainer}
        ref={flatListRef}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={!chatId}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  chatTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingRight: 20,
    paddingBottom: 10,
  
    paddingLeft: 20,
    margin: 10,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: height * (Platform.OS === 'ios' ? 0.05 : 0.05),
    alignItems: 'center',
backgroundColor: '#e9ab25',
borderRadius: 20,

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  chatTitleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  chatContentContainer: {
    paddingBottom: 15,
  },
  messageContainerClient: {
    alignSelf: 'flex-end',
    backgroundColor: '#e9ab25',
    borderRadius: 18,
    padding: 12,
    maxWidth: '70%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
  },
  messageContainerAdmin: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    maxWidth: '70%',
    marginBottom: 10,
    borderColor: '#e9ab25',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
  },
  sender: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  content: {
    fontSize: 16,
    color: '#7a663b',
  },
  contentAdmin: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#8f8f8f',
    textAlign: 'right',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  sendButton: {
    backgroundColor: '#e9ab25',
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
});


export default ClientChatScreen;
