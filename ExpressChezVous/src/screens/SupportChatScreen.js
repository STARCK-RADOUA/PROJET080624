import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Dimensions, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import io from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';  // Import for futuristic send icon
import { BASE_URLIO, BASE_URL } from '@env';
import { getClientId } from '../services/userService';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as Device from 'expo-device';


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
    const id = await Device.osBuildId
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
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  chatContentContainer: {
    paddingBottom: 20,
  },
  messageContainerClient: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderRadius: 20,
    marginBottom: 10,
    padding: 15,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  messageContainerAdmin: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 10,
    padding: 15,
    maxWidth: '75%',
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  sender: {
    fontWeight: 'bold',
    color: '#555',
  },
  content: {
    fontSize: 16,
    marginTop: 5,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    marginRight: 10,
    color: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  sendButton: {
    backgroundColor: '#e9ab25',
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
});

export default ClientChatScreen;
