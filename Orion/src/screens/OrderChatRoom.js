import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env'; // Make sure BASE_URL is set in your environment

// Global socket instance
const socket = io(BASE_URLIO); // Reuse the same socket globally

const OrderRoomScreen = ({ route }) => {
  const { chatId, clientFullName, driverFullName } = route.params; // Get the passed params
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef(); // Reference for ScrollView

  useEffect(() => {
    // Emit joinExistingChat instead of initiateChats
    socket.emit('joinExistingChat', { chatId });
    console.log('Joining existing chat room with chatId:', chatId);

    // Listen for the existing chat details
    socket.on('chatDetailss', (data) => {
      console.log('Received chat details:', data); // Log received data
      if (data && data.messages) {
        setMessages(data.messages); // Set messages for this chat
        console.log('Messages set:', data.messages); // Log to verify messages are set
        scrollToBottom(); // Scroll to the bottom when messages are set
      } else {
        console.log('No messages found or invalid data structure:', data);
      }
    });

    // Real-time message listener
    socket.on('newMessages', (newMessage) => {
      console.log('New message received:', newMessage); // Log the new message
      setMessages((prevMessages) => [...prevMessages, newMessage.message]);
      scrollToBottom(); // Scroll to bottom when a new message arrives
    });

    // Cleanup listeners when component is unmounted
    return () => {
      socket.off('chatDetailss');
      socket.off('newMessages');
    };
  }, [chatId]);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderMessage = (message, index) => {
    const isClient = message.sender === 'client'; // Check if the message is from the client
    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          isClient ? styles.clientMessage : styles.driverMessage, // Style message based on sender
        ]}
      >
        <Text style={styles.senderName}>
          {isClient ? clientFullName : driverFullName} {/* Display full name */}
        </Text>
        <Text style={styles.messageContent}>{message.content}</Text>
        <Text style={styles.messageTime}>
          {message.timestamp
            ? (() => {
              const dateObj = new Date(message.timestamp);
              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
              const day = String(dateObj.getDate()).padStart(2, '0');
              const hours = String(dateObj.getHours()).padStart(2, '0');
              const minutes = String(dateObj.getMinutes()).padStart(2, '0');
              const seconds = String(dateObj.getSeconds()).padStart(2, '0');

              return `${year}-${month}-${day}  ${hours}:${minutes}`;
            })()
            : 'No timestamp'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.messagesContainer}
        ref={scrollViewRef} // Attach the ref to ScrollView
        onContentSizeChange={scrollToBottom} // Automatically scroll to bottom when content changes
      >
        {messages.length > 0 ? (
          messages.map((message, index) => renderMessage(message, index))
        ) : (
          <Text>No messages available</Text> // Display this if there are no messages
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  messagesContainer: {
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: '70%',
  },
  clientMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  driverMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageContent: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
    color: '#666',
  },
});

export default OrderRoomScreen;
