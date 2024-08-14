// Header.js
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const Header = ({ navigation, toggleNotificationMenu }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.openDrawer()}>
      <MaterialIcons name="menu" size={24} color="black" />
    </TouchableOpacity>
    <Image source={{ uri: 'https://example.com/logo.png' }} style={styles.logo} />
    <TouchableOpacity onPress={toggleNotificationMenu}>
      <FontAwesome name="bell" size={24} color="black" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
  },
});

export default Header;
