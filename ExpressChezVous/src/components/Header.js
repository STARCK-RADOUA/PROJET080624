

// Header.js
import React from 'react';
import { View, Image,Platform, StyleSheet,Dimensions, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');
const Header = ({ navigation }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.openDrawer()}>
      <MaterialIcons name="menu" size={24} color="#ffffff" />
    </TouchableOpacity>
    <Image source={{ uri: 'https://example.com/logo.png' }} style={styles.logo} />
    <TouchableOpacity   onPress={() => navigation.navigate('SupportChat')}>
      <FontAwesome name="send" size={24} color="black" />
    </TouchableOpacity>
  </View>
);

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
    paddingTop: height * (Platform.OS === 'ios' ? 0.08 : 0.05),
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
});

export default Header;
