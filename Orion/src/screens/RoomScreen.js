import React, { useState, useEffect, useRef  ,} from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import io from 'socket.io-client';
import { BASE_URLIO  , BASE_URL} from '@env';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const RoomScreen = ({ route }) => {
  const { userId, firstName, lastName } = route.params;
  const socketRef = useRef(null);
  const scrollViewRef = useRef(null); // Reference to ScrollView
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const adminId = '66bac40871e4a7ed9e6fc705'; 
  const userType = 'Admin'; 

  // UseFocusEffect to mark messages as seen
  useFocusEffect(
    React.useCallback(() => {
      const markMessagesAsSeen = async () => {
        try {
          if (chatId) {
            await axios.post(`${BASE_URL}/api/chats/mark-seenFA`, {
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
    socketRef.current = io(BASE_URLIO);

    socketRef.current.emit('initiateChat', { adminId, userId, userType });

    socketRef.current.on('chatDetails', ({ chatId, messages }) => {
      setChatId(chatId);
      setMessages(messages);
      scrollToBottom(); // Scroll to bottom when messages are loaded
    });
    

    socketRef.current.on('newMessage', ({ message }) => {
      setMessages(prevMessages => [...prevMessages, message]);
      scrollToBottom(); // Scroll to bottom when a new message arrives
    });


    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const sendMessage = () => {
    if (newMessage.trim() && chatId) {
      const messageData = {
        chatId,
        sender: `admin`,
        content: newMessage,
        senderType: userType,
      };
      
      socketRef.current.emit('sendMessage', messageData);
      setNewMessage('');
    } else {
      console.error("Cannot send message: chatId is missing");
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
              message.sender === 'admin' ? styles.myMessage : styles.theirMessage,
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
  style={[styles.input, !chatId && styles.disabledInput]} // Apply disabled style when chatId is null
  placeholder="Type a message..."
  value={newMessage}
  onChangeText={setNewMessage}
  editable={!!chatId} // Disable the input if chatId is null
/>

       <TouchableOpacity 
  style={[styles.sendButton, !chatId && styles.disabledSendButton]} 
  onPress={sendMessage}
  disabled={!chatId} // Disable the button if chatId is null
>
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
