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
  Keyboard,
} from 'react-native';
import React, { useCallback, useImperativeHandle, useState, useEffect, useRef } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { io } from 'socket.io-client';
import { BASE_URL } from '@env';
import { getClientId } from '../services/userService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

const socket = io(BASE_URL); // Initialize socket globally

const BottomSheet = React.forwardRef(({ orderId, clientId, driverId }, ref) => {
  const translateY = useSharedValue(0);
  const active = useSharedValue(false);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const flatListRef = useRef(null); // Reference to the FlatList
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef(null);

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
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    const initiateChat = async () => {
      try {
        if (orderId && driverId) {
          const clientId = await getClientId();
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

  // Function to scroll to the bottom of the FlatList
  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const sendMessage = () => {
    if (message.trim() && chatId) {
      // Emit sendMessages event through Socket.IO
      socket.emit('sendMessages', {
        chatId,
        sender: 'client',
        content: message,
      });
      // Do not optimistically add the message to the UI. The real-time listener will do that when confirmed by the server.
      setMessage('');
    }
  };

  // Listeners for Android to handle keyboard height manually
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

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
      if (translateY.value > -SCREEN_HEIGHT / 1) {
        scrollTo(0);
      } else if (translateY.value < -SCREEN_HEIGHT / 1.5) {
        scrollTo(MAX_TRANSLATE_Y);
      }
    });
    const handleInputClick = () => {
      inputRef.current?.focus();
    };
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
          ref={flatListRef} // Reference the FlatList to use scrollToEnd
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
          onContentSizeChange={scrollToBottom} // Scroll to bottom when content changes
          onLayout={scrollToBottom} // Scroll to bottom when layout changes
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? undefined : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Adjust offset for iOS
          style={[styles.inputContainer, { marginBottom: keyboardHeight }]} // Add keyboard height for Android
        >
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            onFocus={handleInputClick}
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
    height: SCREEN_HEIGHT * 0.75, // Set the max height to 70% of the screen
    width: '90%',
    backgroundColor: '#f7f5f3ef',
    position: 'absolute',
    top: SCREEN_HEIGHT * 1.18,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: '#e2b41b',
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 20,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: '5%',
    paddingVertical: 7,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 11,
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
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  
    backgroundColor: '#F2F2F2',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  input: {
    flex: 1,
    height: 50,
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
