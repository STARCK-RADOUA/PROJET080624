import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';

const RoomScreen = ({ route }) => {
  const { userId, firstName, lastName } = route.params;
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null); // Store chatId here
  const adminId = '66bac40871e4a7ed9e6fc705'; // Replace with your actual static admin ID
  const userType = 'Admin'; // Assuming this is an admin

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(BASE_URLIO);

    // Join the chat room
    socketRef.current.emit('initiateChat', { adminId, userId, userType });

    // Listen for chat details including chatId
    socketRef.current.on('chatDetails', ({ chatId, messages }) => {
      setChatId(chatId); // Save chatId
      setMessages(messages);
    });

    // Listen for new messages
    socketRef.current.on('newMessage', ({ message }) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Clean up on component unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  const sendMessage = () => {
    if (newMessage.trim() && chatId) { // Ensure chatId is available before sending a message
      const messageData = {
        chatId, // Use stored chatId
        sender: `admin`,
        content: newMessage,
        senderType: userType,
      };
      
      // Emit the message
      socketRef.current.emit('sendMessage', messageData);
      setNewMessage(''); // Clear input field
    } else {
      console.error("Cannot send message: chatId is missing");
    }
  };

  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const timeDifference = now - messageDate;
    const minutes = Math.floor(timeDifference / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    if (weeks < 4) return `${weeks} weeks ago`;
    if (months < 12) return `${months} months ago`;
    return `${years} years ago`;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageWrapper,
              message.sender === 'admin' ? styles.myMessage : styles.theirMessage, // Adjusting based on sender
            ]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{message.sender === 'admin' ? 'A' : firstName.charAt(0)}</Text>
            </View>
            <View style={[
              styles.messageContent,
              message.sender === 'admin' ? styles.myMessageContent : styles.theirMessageContent,
            ]}>
              <View style={styles.messageHeader}>
                <Text style={styles.senderName}>
                  {message.sender === 'admin' ? 'You' : `${firstName} ${lastName}`}
                </Text>
                <Text style={styles.messageTime}>{formatTimestamp(message.timestamp)}</Text>
              </View>
              <Text style={styles.messageText}>{message.content}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 15,
    paddingHorizontal : '0%' ,
    paddingVertical : '0%'
  },
  messagesContainer: {
    paddingVertical: 10,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-start',
  },
  myMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse', // Avatar on the right side for admin's messages
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: '#4682B4',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messageContent: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  myMessageContent: {
    backgroundColor: '#D1E7DD', // Light green for admin's messages
  },
  theirMessageContent: {
    backgroundColor: '#F8D7DA', // Light red for other messages
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  messageTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  messageText: {
    fontSize: 15,
    color: '#212529',
    marginVertical: 5,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#4682B4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default RoomScreen;
