import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import from the new package
import { Ionicons } from '@expo/vector-icons'; // Import icon library for modern icons
import { BASE_URLIO } from '@env';
import io from 'socket.io-client';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import OrderRoomScreen from './OrderChatRoom';

const ChatScreenComponent = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all'); // Picker state for order status
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const socket = io(BASE_URLIO);

      // Listen for incoming chat messages from the socket
      socket.on('OrderchatMessagesUpdated', (data) => {
        setChats(data.messages); // Directly set the chats from the received data
      });

      // Emit an event to watch for chat messages
      socket.emit('watchOrderChatMessages');

      return () => {
        socket.disconnect(); // Clean up socket connection when the component is unmounted
      };
    } catch (err) {
      setError(err.message);
      Alert.alert("Erreur", "Échec de la connexion au serveur.");
    }
  }, []);

  // Handle pressing a chat item
  const handleChatPress = (chat) => {
    try {
      console.log('Clicked chat:', chat);

      // Navigate to the OrderRoomScreen and pass chat details
      navigation.navigate('OrderRoomScreen', {
        chatId: chat.chatId, // Pass the chat ID
        orderId: chat.orderId, // Pass the chat ID
        clientFullName: chat.clientFullName, // Pass the client's full name
        driverFullName: chat.driverFullName, 
        clientId : chat.clientId,
        driverId : chat.driverId,
      });
    } catch (err) {
      setError(err.message);
      Alert.alert("Erreur", "Impossible de charger la discussion.");
    }
  };

  // Filter and sort chats based on search input and selected status
  const filteredChats = chats
    .filter(chat => {
      const isOrderStatusMatch = selectedStatus === 'all' || chat.orderStatus === selectedStatus;
      const searchLower = searchText.toLowerCase();
      const name = `${chat.orderId}`.toLowerCase();
      const clientName = chat.clientFullName.toLowerCase();
      const driverName = chat.driverFullName.toLowerCase();
      
      // Check if the search text matches any of orderId, clientFullName, or driverFullName
      return (name.includes(searchLower) || clientName.includes(searchLower) || driverName.includes(searchLower)) 
              && isOrderStatusMatch;
    })
    .sort((a, b) => {
      const aTimestamp = a.lastMessage ? new Date(a.lastMessage.timestamp) : 0;
      const bTimestamp = b.lastMessage ? new Date(b.lastMessage.timestamp) : 0;
      return bTimestamp - aTimestamp;
    }); // Sort by last message timestamp

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discussions de commande</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher par ID de commande, nom du client ou du chauffeur"
        placeholderTextColor="#9ca3af"
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Picker for filtering by order status */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedStatus}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedStatus(itemValue)}
        >
          <Picker.Item label="Tous" value="all" />
          <Picker.Item label="En cours" value="in_progress" />
          <Picker.Item label="Livré" value="delivered" />
        </Picker>
      </View>

      {error && <Text style={styles.errorText}>Erreur: {error}</Text>}

      <ScrollView contentContainerStyle={styles.chatList}>
        {filteredChats.map((chat, index) => (
          <TouchableOpacity key={index} style={styles.chatItem} onPress={() => handleChatPress(chat)}>
            <View style={styles.orderIconContainer}>
              {/* Replace avatar with a modern order icon */}
              <Ionicons name="cart-outline" size={32} color="#4682B4" />
            </View>
            <View style={styles.chatDetails}>
              <Text style={[styles.chatName, chat.unread ? styles.unreadChatName : null]}>
                {chat.orderId}
              </Text>
              <Text style={styles.chatMessage}>
                {chat.lastMessage && chat.lastMessage.content ? chat.lastMessage.content : 'Aucun message'}
              </Text>
            </View>
            <Text style={styles.chatTime}>
              {chat.lastMessage && chat.lastMessage.timestamp 
                ? new Date(chat.lastMessage.timestamp).toLocaleTimeString() 
                : 'Pas de date'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const Stack = createStackNavigator();

const OrderChatHistoriqueScreen = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ChatScreenComponent">
        <Stack.Screen name="ChatScreenComponent" component={ChatScreenComponent} options={{ headerShown: false }} />
        <Stack.Screen name="OrderRoomScreen" component={OrderRoomScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  pickerContainer: {
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
  },
  picker: {
    height: 40,
    color: '#000',
  },
  chatList: {
    paddingHorizontal: 15,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  orderIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  chatDetails: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 3,
  },
  unreadChatName: {
    fontWeight: 'bold',
  },
  chatMessage: {
    color: '#6e6e6e',
  },
  chatTime: {
    color: '#a6a6a6',
    fontSize: 12,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default OrderChatHistoriqueScreen;
