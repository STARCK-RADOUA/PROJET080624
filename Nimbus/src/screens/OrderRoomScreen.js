import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet,   Keyboard,  ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import des icônes
import io from 'socket.io-client';
import { BASE_URL, BASE_URLIO } from '@env';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const RoomScreen = ({ route }) => {
  const { clientName, orderId, clientId, driverId } = route.params;
  const scrollViewRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const socket = io(BASE_URLIO);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      const markMessagesAsSeen = async () => {
        try {
          if (chatId) {
            await axios.post(`${BASE_URL}/api/chat/mark-seenFD`, { chatId });
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
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    const initiateChat = async () => {
      try {
        if (orderId && driverId) {
          socket.emit('initiateChats', { orderId, clientId, driverId });
        }
      } catch (error) {
        console.error('Error initiating chat:', error);
      }
    };

    initiateChat();

    // Listen for chat details
    socket.on('chatDetailss', (data) => {
      setChatId(data.chatId);
      setMessages(data.messages);
      scrollToBottom(); // Scroll to the bottom when chat details are loaded
    });

    // Real-time message listener
    socket.on('newMessages', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage.message]);
      scrollToBottom(); // Scroll to the bottom when a new message is added
    });

    return () => {
      socket.off('chatDetailss'); // Clean up listeners
      socket.off('newMessages');
    };
  }, [orderId, driverId]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const sendMessage = () => {
    if (newMessage.trim() && chatId) {
      socket.emit('sendMessages', { chatId, sender: 'driver', content: newMessage });
      setNewMessage('');
    }
  };

  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();

    const isToday = messageDate.toDateString() === now.toDateString();

    if (isToday) {
      const hours = String(messageDate.getHours()).padStart(2, '0');
      const minutes = String(messageDate.getMinutes()).padStart(2, '0');
      return `Today, ${hours}:${minutes}`;
    } else {
      const year = messageDate.getFullYear();
      const month = String(messageDate.getMonth() + 1).padStart(2, '0');
      const day = String(messageDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef} 
        contentContainerStyle={styles.messagesContainer}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageWrapper,
              message.sender === 'driver' ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{message.sender === 'driver' ? 'D' : clientName.charAt(0)}</Text>
            </View>
            <View style={[
              styles.messageContent,
              message.sender === 'driver' ? styles.myMessageContent : styles.theirMessageContent,
            ]}>
              <View style={styles.messageHeader}>
                <Text style={styles.senderName}>
                  {message.sender === 'driver' ? 'You' : `${clientName}`}
                </Text>
                <Text style={styles.messageTime}>{formatTimestamp(message.timestamp)}</Text>
              </View>
              <Text style={styles.messageText}>{message.content}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Adjust offset for iOS
          style={[styles.inputContainer, { marginBottom: keyboardHeight*0.01 }]} // Add keyboard height for Android
        >
        <TextInput
          style={[styles.input, !chatId && styles.disabledInput]}
          placeholder="Ecrire un message..."
          value={newMessage}
          onChangeText={setNewMessage}
          editable={!!chatId}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !chatId && styles.disabledSendButton]} 
          onPress={sendMessage}
          disabled={!chatId}
        >
          <Ionicons name="send" size={24} color="white" /> 
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginVertical: 18,
    alignItems: 'flex-start',
  },
  myMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
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
    backgroundColor: '#007AFF',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messageContent: {
    maxWidth: '78%',
    padding: 10,
    borderRadius: 20,
  },
  myMessageContent: {
    backgroundColor: '#DCF8C6',
  },
  theirMessageContent: {
    backgroundColor: '#F1F0F0',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  messageTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  messageText: {
    fontSize: 15,
    color: '#212529',
  },
  inputContainer: {
    
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#0e3a10',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingVertical: 20,
    paddingRight: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,

  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#a0a0a0',
  },
  disabledSendButton: {
    backgroundColor: '#cccccc',
  },
});

export default RoomScreen;
