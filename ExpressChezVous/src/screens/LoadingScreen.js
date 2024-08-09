// src/screens/LoadingScreen.js

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Votre compte est en cours d'activation</Text>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 20,
  },
});

export default LoadingScreen;
