import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';

const ClientChatScreen = () => {
    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const initiateChat = async () => {
            try {
                const response = await axios.post('http://192.168.1.149:4000/api/chats/initiate', {
                    admin_id: '66bac40871e4a7ed9e6fc705',
                    client_id: '66b83857e8ce33ce391313f4',
                });
                setChatId(response.data._id);
                setMessages(response.data.messages);
            } catch (error) {
                console.error('Error initiating chat:', error);
            }
        };

        initiateChat();

        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`http://192.168.1.149:4000/api/chats/${chatId}`);
                setMessages(response.data.messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        }, 300); // Polling every 3 seconds

        return () => clearInterval(interval);
    }, [chatId]);

    const sendMessage = () => {
        if (message.trim()) {
            axios.post('http://192.168.1.149:4000/api/chats/send-message', {
                chatId,
                sender: 'client',
                content: message,
            });
            setMessage('');
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={[styles.messageContainer, item.sender === 'client' ? styles.clientMessage : styles.adminMessage]}>
                        <Text style={styles.messageText}>{item.content}</Text>
                        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
                    </View>
                )}
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
