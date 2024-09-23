import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import { Ionicons } from '@expo/vector-icons'; 
import { BASE_URLIO } from '@env';
import io from 'socket.io-client';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import OrderRoomScreen from './OrderChatRoom';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';


const ChatScreenComponent = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for skeleton
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all'); 
  const [error, setError] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showFilterMenu, setShowFilterMenu] = useState(false);


  useEffect(() => {
    try {
      const socket = io(BASE_URLIO);

      // Listen for incoming chat messages from the socket
      socket.on('OrderchatMessagesUpdated', (data) => {
        setChats(data.messages); // Set chats
        setLoading(false); // Stop loading when data is received
      });

      // Emit an event to watch for chat messages
      socket.emit('watchOrderChatMessages');

      return () => {
        socket.disconnect();
      };
    } catch (err) {
      setError(err.message);
      setLoading(false); // Stop loading in case of error
      Alert.alert("Erreur", "Échec de la connexion au serveur.");
    }
  }, []);

  const handleChatPress = (chat) => {
    try {
      navigation.navigate('OrderRoomScreen', {
        chatId: chat.chatId,
        orderId: chat.orderId,
        clientFullName: chat.clientFullName,
        driverFullName: chat.driverFullName,
        clientId: chat.clientId,
        driverId: chat.driverId,
      });
    } catch (err) {
      setError(err.message);
      Alert.alert("Erreur", "Impossible de charger la discussion.");
    }
  };

  const applyFilters = () => {
    const filteredChats = chats.filter((chat) => {
      const chatDate = new Date(chat.chatCreatedAt); 
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      console.log(formattedStartDate)
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      return chatDate >= new Date(formattedStartDate) && chatDate <= new Date(formattedEndDate);
    });
    setChats(filteredChats);
    setShowFilterMenu(false);
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };
  // Simulated skeleton loading placeholders
  const renderSkeleton = () => {
    return (
      <View style={styles.skeletonContainer}>
        {[...Array(5)].map((_, index) => (
          <View key={index} style={styles.skeletonItem}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonTextContainer}>
              <View style={styles.skeletonText} />
              <View style={styles.skeletonTextSmall} />
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Filter and sort chats based on search input and selected status
  const filteredChats = chats
    .filter(chat => {
      const isOrderStatusMatch = selectedStatus === 'all' || chat.orderStatus === selectedStatus;
      const searchLower = searchText.toLowerCase();
      const name = `${chat.orderId}`.toLowerCase();
      const clientName = chat.clientFullName.toLowerCase();
      const driverName = chat.driverFullName.toLowerCase();

      return (name.includes(searchLower) || clientName.includes(searchLower) || driverName.includes(searchLower)) 
              && isOrderStatusMatch;
    })
    .sort((a, b) => {
      const aTimestamp = a.lastMessage ? new Date(a.lastMessage.timestamp) : 0;
      const bTimestamp = b.lastMessage ? new Date(b.lastMessage.timestamp) : 0;
      return bTimestamp - aTimestamp;
    });

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
          {/* Filter Button */}
          <TouchableOpacity onPress={toggleFilterMenu} style={styles.filterButton}>
          <Ionicons name="filter-outline" size={24} color="#fff" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {showFilterMenu && (
        <View style={styles.filterMenu}>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Start Date: {startDate.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>End Date: {endDate.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={applyFilters} style={styles.applyFilterButton}>
            <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || startDate;
            setShowStartDatePicker(false);
            setStartDate(currentDate);
          }}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || endDate;
            setShowEndDatePicker(false);
            setEndDate(currentDate);
          }}
        />
      )}

      {error && <Text style={styles.errorText}>Erreur: {error}</Text>}

      {loading ? (
        renderSkeleton() // Show skeleton loader while loading
      ) : (
        <ScrollView contentContainerStyle={styles.chatList}>
          {filteredChats.map((chat, index) => (
            <TouchableOpacity key={index} style={styles.chatItem} onPress={() => handleChatPress(chat)}>
              <View style={styles.orderIconContainer}>
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
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
  },
  picker: {
    flex: 1,
    color: '#000',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e27a3f',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  filterButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  filterMenu: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },
  dateButton: {
    backgroundColor: '#1f695a',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  dateButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  applyFilterButton: {
    backgroundColor: '#2e8b57',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  applyFilterButtonText: {
    color: '#fff',
    textAlign: 'center',
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
  // Skeleton loading styles
  skeletonContainer: {
    paddingHorizontal: 15,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  skeletonAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginRight: 15,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonText: {
    width: '50%',
    height: 15,
    backgroundColor: '#e0e0e0',
    marginBottom: 5,
  },
  skeletonTextSmall: {
    width: '30%',
    height: 10,
    backgroundColor: '#e0e0e0',
  },
});

export default OrderChatHistoriqueScreen;
