import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useCallback, useImperativeHandle, useState, useEffect } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import axios from 'axios';
import { BASE_URL } from '@env'; // Adjust BASE_URL for the backend API
import { getClientId } from '../services/userService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

const BottomSheet = React.forwardRef(({ orderId, clientId }, ref) => {
  const translateY = useSharedValue(0);
  const active = useSharedValue(false);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const scrollTo = useCallback((destination) => {
    'worklet';
    active.value = destination !== 0;
    translateY.value = withSpring(destination, { damping: 50 });
  }, []);

  const isActive = useCallback(() => {
    return active.value;
  }, []);

  useImperativeHandle(ref, () => ({ scrollTo, isActive }), [scrollTo, isActive]);

  useEffect(() => {
    const initiateChat = async () => {
      try {
        if (orderId) {
          const clientId = await getClientId(); // Fetch client ID from your service
          const response = await axios.post(`${BASE_URL}/api/driverChat/initiate`, {
            driver_id: '66bac757e6e3c479f7b35d7e', // Example driver ID
            client_id: clientId,
            order_id: orderId, // Pass order ID for chat initiation
          });
          setChatId(response.data._id);
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error('Error initiating chat:', error);
      }
    };

    initiateChat();

    const interval = setInterval(async () => {
      try {
        if (chatId) {
          const response = await axios.get(`${BASE_URL}/api/driverChat/${chatId}?order_id=${orderId}`);
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [chatId, orderId]);

  const sendMessage = () => {
    if (message.trim()) {
      axios.post(`${BASE_URL}/api/driverChat/send-message`, {
        chatId,
        sender: 'client',
        content: message,
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        { _id: prevMessages.length + 1, content: message, sender: 'client' },
      ]);
      setMessage('');
    }
  };

  const context = useSharedValue({ y: 0 });
  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
    })
    .onEnd(() => {
      if (translateY.value > -SCREEN_HEIGHT / 3) {
        scrollTo(0);
      } else if (translateY.value < -SCREEN_HEIGHT / 1.5) {
        scrollTo(MAX_TRANSLATE_Y);
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
      [25, 5],
      Extrapolate.CLAMP
    );

    return {
      borderRadius,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
        <View style={styles.line} />
        
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.sender === 'client' ? styles.messageRight : styles.messageLeft,
              ]}
            >
              <Text style={styles.messageText}>{item.content}</Text>
            </View>
          )}
          style={styles.messageList}
        />

        {/* Input for Sending Messages */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    top: SCREEN_HEIGHT,
    borderRadius: 25,
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: 'grey',
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 2,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
  },
  messageLeft: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  messageRight: {
    backgroundColor: '#FEA202',
    alignSelf: 'flex-end',
  },
  messageText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F2F2F2',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    bottom: '5%',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#FEA202',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BottomSheet;
