import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserSearchModal from './../components/AddChatModal'; // Import the modal component
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import RoomScreen from './RoomScreen'; // Import RoomScreen component

const ChatScreenComponent = ({ navigation }) => {
  const [chats, setChats] = useState([
    { _id: '1', firstName: 'Martin', lastName: 'Randolph', message: "You: What's man!", time: '9:40 AM', avatarColor: '#FF6347' },
    { _id: '2', firstName: 'Andrew', lastName: 'Parker', message: 'You: Ok, thanks!', time: '9:25 AM', avatarColor: '#4682B4' },
    { _id: '3', firstName: 'Karen', lastName: 'Castillo', message: 'You: Ok, See you in To...', time: 'Fri', avatarColor: '#9370DB' },
    { _id: '4', firstName: 'Maisy', lastName: 'Humphrey', message: 'Have a good day, Maisy!', time: 'Fri', avatarColor: '#FFD700' },
    { _id: '5', firstName: 'Joshua', lastName: 'Lawrence', message: 'The business plan loo...', time: 'Thu', avatarColor: '#20B2AA' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);

  const handleAddChat = (user) => {
    const userTypeAbbreviation = user.userType === 'Driver' ? 'D' : 'C';
    setChats([
      { _id: user._id, firstName: user.firstName, lastName: user.lastName, message: 'New chat', time: 'Now', avatarColor: user.avatarColor || '#4682B4' },
      ...chats,
    ]);
    setModalVisible(false);
  };

  const handleChatPress = (chat) => {
    navigation.navigate('RoomScreen', {
      userId: chat._id,
      firstName: chat.firstName,
      lastName: chat.lastName,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={28} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editIcon}>
            <Ionicons name="create-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor="#9ca3af"
      />

      <ScrollView contentContainerStyle={styles.chatList}>
        {chats.map((chat, index) => (
          <TouchableOpacity key={index} style={styles.chatItem} onPress={() => handleChatPress(chat)}>
            <View style={[styles.avatar, { backgroundColor: chat.avatarColor }]}>
              <Text style={styles.avatarText}>{chat.firstName.charAt(0)}</Text>
            </View>
            <View style={styles.chatDetails}>
              <Text style={styles.chatName}>{`${chat.firstName} ${chat.lastName}`}</Text>
              <Text style={styles.chatMessage}>{chat.message}</Text>
            </View>
            <Text style={styles.chatTime}>{chat.time}</Text>
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
  chatMessage: {
    color: '#6e6e6e',
  },
  chatTime: {
    color: '#a6a6a6',
    fontSize: 12,
  },
  roomContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  roomTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  roomInfo: {
    fontSize: 18,
    marginTop: 10,
  },
});

export default ChatScreen;
