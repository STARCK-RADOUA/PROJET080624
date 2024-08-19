import { BASE_URL, BASE_URLIO } from '@env';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Animated, StyleSheet } from 'react-native';
import { getDeviceIde } from '../services/userService';
import io from 'socket.io-client';

const socket = io(`${BASE_URLIO}`);

const AnimatedLetter = ({ letter, index }) => {
  const letterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(letterAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100, // Delay each letter progressively
      useNativeDriver: true,
    }).start();
  }, [index]);

  return (
    <Animated.Text
      style={{
        opacity: letterAnim,
        transform: [{ translateY: letterAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FF6F00',
      }}
    >
      {letter}
    </Animated.Text>
  );
};

const AnimatedTitle = ({ text }) => {
  return (
    <View style={styles.titleContainer}>
      {text.split('').map((letter, index) => (
        <AnimatedLetter key={index} letter={letter} index={index} />
      ))}
    </View>
  );
};

const ServicesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const deviceId = await getDeviceIde();

    try {
      const response = await fetch(`${BASE_URL}/api/clients/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();

      if (response.ok) {
        if (socket.connected) {
          socket.disconnect();
        }
        navigation.replace('Login');
      } else {
        Alert.alert('Logout Failed', data.errors ? data.errors.join(', ') : data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong during logout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated title where each letter is animated */}
      <AnimatedTitle text={`°Chaque fin est un nouveau départ. Merci d'avoir été là, à très bientôt pour de nouvelles aventures ! °`} />

      {/* Logout button with animation */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* Loading indicator */}
      {loading && <ActivityIndicator size="large" color="#fff" style={styles.spinner} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  titleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
    width: '80%', // Adjust the width for centering
  },
  button: {
    backgroundColor: '#FF8C00',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    transform: [{ scale: 0.8 }],
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  spinner: {
    marginTop: 20,
  },
});

export default ServicesScreen;
