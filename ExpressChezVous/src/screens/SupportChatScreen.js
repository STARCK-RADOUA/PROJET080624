import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import io from 'socket.io-client';

const ClientChatScreen = () => {
  const clientId = '66c10e4d4eac0352b3aec084';  // Static clientId
  const adminId = '66bac40871e4a7ed9e6fc705';  // Static adminId
  const [messages, setMessages] = useState([]);  // Chat messages
  const [newMessage, setNewMessage] = useState('');  // Input message
  const [chatId, setChatId] = useState(null);  // Chat ID obtained after initiation

  const socket = io('http://192.168.1.149:4000');  // Adjust to your server IP

  useEffect(() => {
    // Initiate chat when the component mounts
    console.log('Initiating chat between client and admin');
    socket.emit('initiateChat', { adminId, clientId });

    // Listen for chat details from the server (only unseen messages)
    socket.on('chatDetails', (data) => {
      console.log('Chat details received:', data);
      setChatId(data.chatId);  // Set the chatId obtained from the server
      setMessages(data.messages);  // Load only unseen messages from admin
    });

    // Listen for new messages in real-time
    socket.on('newMessage', (messageData) => {
      console.log('New message received:', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData.message]);  // Append new message
    });

    // Cleanup on component unmount
    return () => {
      socket.off('chatDetails');
      socket.off('newMessage');
      socket.disconnect();
      console.log('Socket disconnected');
    };
  }, []);

  // Handle sending a message
  const sendMessage = () => {
    if (newMessage.trim() && chatId) {
      socket.emit('sendMessage', {
        chatId,
        sender: 'client',  // Client is sending the message
        content: newMessage
      });
      setNewMessage('');  // Clear input after sending

      // Do NOT clear messages after sending
    }
  };

  // Render each message
  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.sender}>{item.sender}</Text>
      <Text style={styles.content}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.chatTitle}>Chat {chatId ? 'Active' : 'Connecting...'}</Text>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        style={styles.chatList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={sendMessage} disabled={!chatId} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chatList: {
    flex: 1,
    marginBottom: 10,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  sender: {
    fontWeight: 'bold',
  },
  content: {
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 10,
  },
  textInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
});

export default ClientChatScreen;
