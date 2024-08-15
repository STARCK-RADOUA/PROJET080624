import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Image, TextInput, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import io from 'socket.io-client';
import * as Device from 'expo-device';
import Header from '../components/Header';
import useNotificationMenu from '../services/useNotificationMenu';
import NotificationMenu from '../components/NotificationMenu';

const socket = io('http://192.168.8.119:4000');
const { width, height } = Dimensions.get('window');

const UserProfileScreen = ({ navigation }) => {
  const { isNotificationMenuVisible, slideAnim, toggleNotificationMenu } = useNotificationMenu(); 

  return (
    <View style={styles.container}>
      <Header navigation={navigation} toggleNotificationMenu={toggleNotificationMenu} />
      {isNotificationMenuVisible && (
        <NotificationMenu
          slideAnim={slideAnim}
          toggleNotificationMenu={toggleNotificationMenu}
          socket={socket}
        />
      )}
      <View style={styles.profileContainer}>
        <Image
          source={require('../assets/images/8498789-17.png')} // Replace with your image URL
          style={styles.profileImage}
        />
        <Text style={styles.phoneNumber}>+132 1234 58 32</Text>
        <TextInput inputMode='numeric' style={styles.input} placeholder="Enter new number" />
        <TouchableOpacity style={styles.changeNumberButton}>
          <Text style={styles.buttonText}>Change number</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#ccc',
    marginBottom: 50,
  },
  phoneNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  changeNumberButton: {
    backgroundColor: '#FFA500',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UserProfileScreen;
