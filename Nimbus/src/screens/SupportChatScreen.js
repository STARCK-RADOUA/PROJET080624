import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Dimensions, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import io from 'socket.io-client';
import { BASE_URLIO, BASE_URL } from '@env';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import {getDriverId} from '../redux/driverSerice'
const { width, height } = Dimensions.get('window');

const SupportChatScreen = ({ navigation }) => {
  const adminId = '66bac40871e4a7ed9e6fc705';  // Static adminId
  const [messages, setMessages] = useState([]);  // Chat messages
  const [newMessage, setNewMessage] = useState('');  // Input message
  const [chatId, setChatId] = useState(null);  // Chat ID obtained after initiation

  const userType = 'Driver';
  const socket = useRef(io(BASE_URLIO)).current;  // Initialize socket.io client
  const flatListRef = useRef(null);  // Reference for FlatList

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
      const userId = await getDriverId();
      console.log("Driver ID:", userId);
      console.log('Initiating chat between client and admin');

      socket.emit('initiateChat', { adminId, userId, userType });

      socket.on('chatDetails', (data) => {
        setChatId(data.chatId);

        const lastMessage = data.messages.length > 0 ? data.messages[data.messages.length - 1] : null;

        if (lastMessage && lastMessage.sender === 'admin' && !lastMessage.seen) {
          const unseenMessages = data.messages.filter(message => !message.seen);
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
      socket.emit('sendMessage', {
        chatId,
        sender: 'client',
        content: newMessage,
      });
      setNewMessage('');  // Clear input after sending
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
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.chatTitle}>Support Chat</Text>

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
          placeholder="Type a message"
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={!chatId}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  chatTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF',
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingTop: 39,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatList: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 15,
  },
  chatContentContainer: {
    paddingBottom: 20,
  },
  messageContainerClient: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    marginBottom: 10,
    padding: 10,
    maxWidth: '75%',
    borderRadius: 30,
    shadowColor: '#2379e9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 5,
    color: '#fff',
    elevation: 3,
  },
  messageContainerAdmin: {
    alignSelf: 'flex-start',
    backgroundColor: '#747171',
    borderRadius: 20,
    marginBottom: 10,
    padding: 10,
    maxWidth: '75%',
    elevation: 3,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 5,
  },
  content: {
    fontSize: 16,
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#D3D3D3',
    marginTop: 5,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#CCC',
    backgroundColor: '#FFF',
    padding: 10,
    marginBottom: 25,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 5,
  },
  textInput: {
    flex: 1,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#ffffff',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 5,
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 5,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SupportChatScreen;
