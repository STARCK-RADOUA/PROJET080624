import React, { useEffect, useState } from 'react';
import { View, Image, Platform, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URLIO, BASE_URL } from '@env';
import { io } from 'socket.io-client';
const deviceId = Application.applicationId;

const socket = io(BASE_URLIO, {
  query: { deviceId },
});
const { width, height } = Dimensions.get('window');

const Header = ({ navigation }) => {

  const [deviceId, setDeviceId] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const getDeviceId = React.useCallback(async () => {
    const id = Application.applicationId; // Ensure this is synchronous
    setDeviceId(id);
  }, []);
  useEffect(() => {

    getDeviceId();

    const deviceId = Application.applicationId;

    if (deviceId) {
      const socket = io(BASE_URLIO, {
        query: { deviceId },
      });
      socket.emit('watchSupportChatMessagesDriver', deviceId);

      socket.on('SupportchatMessagesUpdatedForDriver', (data) => {
        const filteredMessages = data.messages.filter((message) => message.lastMessage);

        if (filteredMessages.length > 0) {
          setSupportMessages(filteredMessages);

          // Check if there are any unread messages and update the state
          const unread = filteredMessages.some(
            (msg) => !msg.lastMessage.seen && msg.lastMessage.sender !== 'client'
          );
          setHasUnreadMessages(unread);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [deviceId]);
  useFocusEffect(
    React.useCallback(() => {
      getDeviceId();

      if (deviceId) {
        const socket = io(BASE_URLIO, {
          query: { deviceId },
        });
        socket.emit('watchSupportChatMessagesDriver', deviceId);

        socket.on('SupportchatMessagesUpdatedForDriver', (data) => {
          const filteredMessages = data.messages.filter((message) => message.lastMessage);

          if (filteredMessages.length > 0) {
            setSupportMessages(filteredMessages);

            // Check if there are any unread messages and update the state
            const unread = filteredMessages.some(
              (msg) => !msg.lastMessage.seen && msg.lastMessage.sender !== 'client'
            );
            setHasUnreadMessages(unread);
          }
        });

        return () => {
          socket.disconnect();
        };
      }
    }, [deviceId])
  );


  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <MaterialIcons name="menu" size={24} color="#ffffff" />
      </TouchableOpacity>

      <Image source={{ uri: 'https://example.com/logo.png' }} style={styles.logo} />

      <TouchableOpacity onPress={() => navigation.navigate('SupportChat')}>
      {
          (() => {
            // Ensure that supportMessages exists and has at least one message
            const hasUnread = supportMessages?.length > 0 && !supportMessages[0].lastMessage.seen && supportMessages[0].lastMessage.sender !== "client";

            console.log(supportMessages?.[0]?.lastMessage?.seen, "bvbvnbb");  // Added optional chaining to prevent errors

            return (
              hasUnread && (
                <View style={styles.unreadIndicator}>
                  <View style={styles.redButton} />
                </View>
              )
            );
          })()
        }
        <FontAwesome name="send" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 20,
    paddingBottom: 10,
    paddingLeft: 20,
    margin: 10,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: height * (Platform.OS === 'ios' ? 0.06 : 0.05),
    alignItems: 'center',
    backgroundColor: '#e9ab25',
    borderRadius: 20,
    padding: 2,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  logo: {
    width: 150,
    resizeMode: 'contain',
  },
  redButton: {
    width: 10,  // size of the red dot
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
});

export default Header;
