import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList,Dimensions, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';
import Header from '../components/Header';
const { width, height } = Dimensions.get('window');
const ClientChatScreen = ({ navigation }) => {
  const clientId = '66c10e4d4eac0352b3aec084';  // Static clientId
  const adminId = '66bac40871e4a7ed9e6fc705';  // Static adminId
  const [messages, setMessages] = useState([]);  // Chat messages
  const [newMessage, setNewMessage] = useState('');  // Input message
  const [chatId, setChatId] = useState(null);  // Chat ID obtained after initiation

  const socket = io(BASE_URLIO);  // Adjust to your server IP

  useEffect(() => {
    console.log('Initiating chat between client and admin');
    socket.emit('initiateChat', { adminId, clientId });

    socket.on('chatDetails', (data) => {
      setChatId(data.chatId);  // Set the chatId obtained from the server
      setMessages(data.messages);  // Load only unseen messages from admin
    });

    socket.on('newMessage', (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData.message]);  // Append new message
    });

    return () => {
      socket.off('chatDetails');
      socket.off('newMessage');
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() && chatId) {
      socket.emit('sendMessage', {
        chatId,
        sender: 'client',  // Client is sending the message
        content: newMessage,
      });
      setNewMessage('');  // Clear input after sending
    }
  };

  const renderMessage = ({ item }) => (
    <View style={item.sender === 'client' ? styles.messageContainerClient : styles.messageContainerAdmin}>
      <Text style={styles.sender}>{item.sender === 'client' ? 'You' : 'Admin'}</Text>
      <Text style={styles.content}>{item.content}</Text>
    </View>
  );

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
    alignContent: 'center',
    paddingTop: Platform.OS === 'ios' ? height * 0.08 : height * 0.05,

    color: '#333',
    backgroundColor: '#e9ab25',
    paddingRight: 20,
    paddingBottom: 10,
  
    paddingLeft: 20,
    margin: 10,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: height * (Platform.OS === 'ios' ? 0.07 : 0.05),
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#df942400',
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
    backgroundColor: '#e9ab1182',
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
