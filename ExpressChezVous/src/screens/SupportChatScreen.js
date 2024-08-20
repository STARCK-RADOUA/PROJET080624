import { BASE_URL, BASE_URLIO } from '@env';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { getClientId } from '../services/userService';
import Header from '../components/Header';
import useNotificationMenu from '../services/useNotificationMenu'; // Import the custom hook
import NotificationMenu from '../components/NotificationMenu';
import io from 'socket.io-client';

const ClientChatScreen = ({ navigation }) => {
    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]); // Store all messages
    const [adminMessages, setAdminMessages] = useState([]); // Store only admin messages
    const [message, setMessage] = useState('');
    const socket = io(`${BASE_URLIO}`);
    const flatListRef = useRef(null); // Create a ref for the FlatList
    const [lastFetchedMessageCount, setLastFetchedMessageCount] = useState(0); // Track how many messages we have fetched so far

    const { isNotificationMenuVisible, slideAnim, toggleNotificationMenu } = useNotificationMenu();

    useEffect(() => {
        const initiateChat = async () => {
            try {
                const clientId = await getClientId();
                const response = await axios.post(`${BASE_URL}/api/chats/initiate`, {
                    admin_id: '66bac40871e4a7ed9e6fc705',
                    client_id: clientId,
                });
                setChatId(response.data._id);

                const messagesData = response.data.messages;
                if (messagesData.length > 0) {
                    // Filter admin messages that came after the last client message
                    const lastClientMessageIndex = messagesData
                        .map((msg) => msg.sender)
                        .lastIndexOf('client');
                    
                    const adminNewMessages = messagesData.slice(lastClientMessageIndex + 1).filter(
                        (msg) => msg.sender === 'admin'
                    );
                    
                    if (adminNewMessages.length > 0) {
                        setAdminMessages(adminNewMessages); // Store admin messages
                    }

                    // Display only the last client message or the last admin message
                    const lastMessage = messagesData[messagesData.length - 1];
                    if (lastMessage.sender === 'client') {
                        setMessages([lastMessage]); // Show only the last client message
                    } else {
                        setMessages([messagesData[messagesData.length - 1]]); // Last admin message
                    }
                    setLastFetchedMessageCount(messagesData.length);
                }
            } catch (error) {
                console.error('Error initiating chat:', error);
            }
        };

        initiateChat();
    }, []);

    // Polling for new messages
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                if (chatId) {
                    const response = await axios.get(`${BASE_URL}/api/chats/${chatId}`);
                    const fetchedMessages = response.data.messages;

                    // Add new messages that haven't been fetched yet
                    if (fetchedMessages.length > lastFetchedMessageCount) {
                        const newMsgs = fetchedMessages.slice(lastFetchedMessageCount);
                        setMessages((prev) => [...prev, ...newMsgs]);
                        setLastFetchedMessageCount(fetchedMessages.length);
                    }
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        }, 3000); // Polling every 3 seconds

        return () => clearInterval(interval);
    }, [chatId, lastFetchedMessageCount]);

    useEffect(() => {
        // Scroll to the end when new messages are added
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const sendMessage = () => {
        if (message.trim()) {
            axios.post(`${BASE_URL}/api/chats/send-message`, {
                chatId,
                sender: 'client',
                content: message,
            })
            .then(() => {
                setMessage('');
            })
            .catch((error) => console.error('Error sending message:', error));
        }
    };

    return (
        <View style={styles.container}>
            <Header navigation={navigation} toggleNotificationMenu={toggleNotificationMenu} />
            {isNotificationMenuVisible && (
                <NotificationMenu
                    slideAnim={slideAnim}
                    toggleNotificationMenu={toggleNotificationMenu}
                    socket={socket} // Pass the socket instance
                />
            )}
            <FlatList
                ref={flatListRef} // Assign ref to FlatList
                data={[...adminMessages, ...messages]} // Combine admin messages and regular messages
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={[styles.messageContainer, item.sender === 'client' ? styles.clientMessage : styles.adminMessage]}>
                        <Text style={styles.messageText}>{item.content}</Text>
                        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
                    </View>
                )}
                onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })} // Scroll to the last message
            />
            <View style={styles.inputContainer}>
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type a message..."
                    style={styles.input}
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    messageContainer: {
        marginVertical: 5,
        padding: 10,
        borderRadius: 10,
        maxWidth: '80%',
    },
    clientMessage: {
        backgroundColor: '#dcf8c6',
        alignSelf: 'flex-end',
    },
    adminMessage: {
        backgroundColor: '#ffffff',
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 10,
        color: 'gray',
        marginTop: 5,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#ffffff',
    },
    input: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#25D366',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    sendButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
});

export default ClientChatScreen;
