import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URLIO } from '@env';
import io from 'socket.io-client';
import UserSearchModal from './../components/AddChatModal';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import RoomScreen from './RoomScreen';

const ChatScreenComponent = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const getRandomColor = () => {
    const colors = ['#FF6347', '#4682B4', '#9370DB', '#FFD700', '#20B2AA', '#FF69B4', '#8A2BE2', '#DC143C', '#FF4500'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    const socket = io(BASE_URLIO);

    socket.on('chatMessagesUpdated', (data) => {
      data.messages.forEach(chat => {
        console.log("jkgkjgjk",JSON.stringify(data))
        handleAddChat({
          _id: chat.clientId,
          firstName: chat.clientFullName.split(' ')[0],
          lastName: chat.clientFullName.split(' ')[1] || '',
          avatarColor: getRandomColor(),
          lastMessage: chat.lastMessage,
          unread: true,  // Mark as unread initially
        });
      });
    });

    socket.emit('watchChatMessages');

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleAddChat = (user) => {
    const newChat = {
      _id: user._id,
      firstName: user.firstName || 'Unknown',
      lastName: user.lastName || 'User',
      lastMessage: user.lastMessage || 'New chat',
      avatarColor: user.avatarColor || getRandomColor(),
      unread: user.unread || false,
    };
  
    setChats((prevChats) => {
      // Filter out the chat if it already exists, then add the new/updated chat
      const updatedChats = [newChat, ...prevChats.filter(chat => chat._id !== user._id)];
  
      // Sort chats by the timestamp of the last message
      updatedChats.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
  
      return updatedChats;
    });
  
    setModalVisible(false);
  };

  const handleChatPress = (chat) => {
    // Mark chat as read
    const updatedChats = chats.map(c => 
      c._id === chat._id ? { ...c, unread: false } : c
    );
    setChats(updatedChats);

    // Navigate to RoomScreen
    navigation.navigate('RoomScreen', {
      userId: chat._id,
      firstName: chat.firstName,
      lastName: chat.lastName,
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
  
    const isToday = date.toDateString() === now.toDateString();
  
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
  
    if (isToday) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `Today, ${hours}:${minutes}`;
    } else {
      return formatDate(date);
    }
  };
  

  const filteredChats = chats.filter(chat => {
    const name = `${chat.firstName} ${chat.lastName}`.toLowerCase();
    return name.includes(searchText.toLowerCase());
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discussions</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={28} color="black" />
          </TouchableOpacity>
       
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Chercher"
        placeholderTextColor="#9ca3af"
        value={searchText}
        onChangeText={setSearchText}
      />

<ScrollView contentContainerStyle={styles.chatList}>
  {filteredChats.map((chat, index) => (
    <TouchableOpacity key={index} style={styles.chatItem} onPress={() => handleChatPress(chat)}>
      <View style={[styles.avatar, { backgroundColor: chat.avatarColor }]}>
        <Text style={styles.avatarText}>
          {chat.firstName ? chat.firstName.charAt(0) : ''}
        </Text>
      </View>
      <View style={styles.chatDetails}>
        <Text style={[styles.chatName, chat.unread ? styles.unreadChatName : null]}>
          {`${chat.firstName || ''} ${chat.lastName || ''}`}
        </Text>
        <Text style={styles.chatMessage}>
          {chat.lastMessage && chat.lastMessage.content ? chat.lastMessage.content : ''}
        </Text>
      </View>
      <Text style={styles.chatTime}>
        {chat.lastMessage && chat.lastMessage.timestamp ? formatTime(chat.lastMessage.timestamp) : ''}
      </Text>
      {chat.unread && chat.lastMessage.sender !== 'admin' && !chat.lastMessage.seen && (
        <View style={styles.unreadDot} />
      )}
    </TouchableOpacity>
  ))}
</ScrollView>

      <UserSearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onUserSelect={handleAddChat}
      />
    </View>
  );
};

const Stack = createStackNavigator();

const ChatScreen = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ChatScreenComponent">
        <Stack.Screen name="ChatScreenComponent" component={ChatScreenComponent} options={{ headerShown: false }} />
        <Stack.Screen name="RoomScreen" component={RoomScreen} options={{ headerShown: false }} />
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
  headerIcons: {
    flexDirection: 'row',
  },
  editIcon: {
    marginLeft: 15,
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    marginLeft: 10,
  },
});

export default ChatScreen;
