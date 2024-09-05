import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Dimensions, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import io from 'socket.io-client';
import { BASE_URLIO  , BASE_URL} from '@env';
import { getClientId } from '../services/userService';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const ClientChatScreen = ({ navigation }) => {
  const adminId = '66bac40871e4a7ed9e6fc705';  // Static adminId
  const [messages, setMessages] = useState([]);  // Chat messages
  const [newMessage, setNewMessage] = useState('');  // Input message
  const [chatId, setChatId] = useState(null);  // Chat ID obtained after initiation

  const userType = 'Client';
  const socket = useRef(io(BASE_URLIO)).current;  // Initialize socket.io client
  const flatListRef = useRef(null);  // Reference for FlatList


  // UseFocusEffect to mark messages as seen
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
        console.log("gjjgr", data)
        setChatId(data.chatId);

       // Get the last message from the list of messages
  const lastMessage = data.messages.length > 0 ? data.messages[data.messages.length - 1] : null;

  // Check if the last message is from the admin and has already been seen
  if (lastMessage && lastMessage.sender === 'admin' && !lastMessage.seen) {
    console.log("Last message from admin has already been seen. Updating with only unseen messages.");

    // Filter the unseen messages
    const unseenMessages = data.messages.filter(message => !message.seen);

    // Set the chatId and only unseen messages
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
    // Scroll to the bottom of the FlatList when messages change
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
      <Text style={styles.sender}>{item.sender === 'client' ? 'You' : 'Admin'}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
    </View>
  );
  //8888888

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.chatTitle}>Chat {chatId ? 'Active' : 'Connecting...'}</Text>

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
    backgroundColor: '#f7f7f7',
  },
  chatTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 20,
    paddingBottom: 10,
  
    paddingLeft: 20,
    margin: 10,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: height * (Platform.OS === 'ios' ? 0.08 : 0.05),
    alignItems: 'center',
backgroundColor: '#e9ab25',
borderRadius: 20,
    padding: 2,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
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
    padding: 10,
    maxWidth: '75%',
  },
  messageContainerAdmin: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 10,
    padding: 10,
    maxWidth: '75%',
    borderColor: '#ddd',
    borderWidth: 1,
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
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    padding: 14,
    justifyContent: 'space-between',
  },
  textInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#e9ab25',
    paddingVertical: 10,
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

export default ClientChatScreen;
