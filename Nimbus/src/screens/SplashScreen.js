
// src/screens/SplashScreen.js

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const SplashScreen = ({ navigation }) => {
  React.useEffect(() => {
    setTimeout(() => {
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/sffff.webp')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b3b1fb3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;
