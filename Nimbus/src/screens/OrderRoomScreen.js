import React, { useState, useEffect, useRef  } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import io from 'socket.io-client';
import { BASE_URLIO  , BASE_URL} from '@env';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const RoomScreen = ({ route }) => {
  const { clientName, orderId , clientId  , driverId} = route.params;
  const scrollViewRef = useRef(null); // Reference to ScrollView
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const socket = io(BASE_URL); // Initialize socket globally

  useFocusEffect(
    React.useCallback(() => {
      const markMessagesAsSeen = async () => {
        try {
          if (chatId) {
            await axios.post(`${BASE_URL}/api/chat/mark-seenFD`, {
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
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    const initiateChat = async () => {
      try {
        if (orderId && driverId) {
          socket.emit('initiateChats', {
            orderId,
            clientId,
            driverId,
          });
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
      // Emit sendMessages event through Socket.IO
      socket.emit('sendMessages', {
        chatId,
        sender: 'driver',
        content: newMessage,
      });
      // Do not optimistically add the message to the UI. The real-time listener will do that when confirmed by the server.
      setNewMessage('');
    }
  };

  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
  
    const isToday = messageDate.toDateString() === now.toDateString();
  
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
  
    if (isToday) {
      const hours = String(messageDate.getHours()).padStart(2, '0');
      const minutes = String(messageDate.getMinutes()).padStart(2, '0');
      return `Today, ${hours}:${minutes}`;
    } else {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
  
      return formatDate(messageDate);
    }
  };
  

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef} // Assign the reference to ScrollView
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

      <View style={styles.inputContainer}>
      <TextInput
  style={[styles.input, !chatId && styles.disabledInput]} // Apply disabled style when chatId is null
  placeholder="Ecrire un message..."
  value={newMessage}
  onChangeText={setNewMessage}
  editable={!!chatId} // Disable the input if chatId is null
/>

       <TouchableOpacity 
  style={[styles.sendButton, !chatId && styles.disabledSendButton]} 
  onPress={sendMessage}
  disabled={!chatId} // Disable the button if chatId is null
>
  <Text style={styles.sendButtonText}>Envoyer</Text>
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
    backgroundColor: '#D1E7DD',
  },
  theirMessageContent: {
    backgroundColor: '#F8D7DA',
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
  },disabledInput: {
    backgroundColor: '#f0f0f0', // Lighter background for the disabled input
    color: '#a0a0a0', // Change text color to grey to indicate disabled state
  },
  disabledSendButton: {
    backgroundColor: '#cccccc', // Greyed-out color for the disabled state
  },
    
});

export default RoomScreen;
