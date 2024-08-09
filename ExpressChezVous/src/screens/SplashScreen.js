// src/screens/SplashScreen.js

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const SplashScreen = ({ navigation }) => {
  React.useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login');
    }, 3000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/8498789-23.png')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundImage: require('../assets/8498789sd.png'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;
