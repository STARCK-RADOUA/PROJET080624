import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import styles from '../styles/paymentSuccessStyles';

const ChatButton = ({ openBottomSheet, isChatDisabled }) => (
  <TouchableOpacity onPress={openBottomSheet} disabled={isChatDisabled}>
    <Image
      source={{
        uri: 'https://firebasestorage.googleapis.com/v0/b/deliver-90a33.appspot.com/o/2665038.png?alt=media&token=9d61891a-3fa0-4673-b035-e4d29126563a',
      }}
      style={[styles.chatIcon, isChatDisabled ? styles.disabledChatIcon : null]}
      resizeMode="contain"
    />
  </TouchableOpacity>
);

export default ChatButton;
