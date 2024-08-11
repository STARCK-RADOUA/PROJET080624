import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import io from 'socket.io-client';
import PrductBottomSheetScreen from './PrductBottomSheetScreen';

const socket = io('http://192.168.1.147:4000');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // State to hold the selected item
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    socket.on('activeProducts', (products) => {
      setMenuItems(products);
    });

    socket.emit('requestActiveProducts');

    return () => {
      socket.off('activeProducts');
    };
  }, []);

  const onPress = useCallback((item) => {
    setSelectedItem(item); // Set the selected item with all details
    bottomSheetRef.current?.scrollTo(-SCREEN_HEIGHT / 2); // Open the bottom sheet
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <MaterialIcons name="menu" size={24} color="black" />
        </TouchableOpacity>
        <Image source={{ uri: 'https://example.com/logo.png' }} style={styles.logo} />
        <TouchableOpacity onPress={() => {}}>
          <FontAwesome name="bell" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.menuList}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => onPress(item)}>
            <Image source={{ uri: item.image_url }} style={styles.menuItemImage} />
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
              <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="orange" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <PrductBottomSheetScreen ref={bottomSheetRef} item={selectedItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  menuList: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  menuItemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  menuItemText: {
    flex: 1,
    marginLeft: 10,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuItemDescription: {
    color: '#777',
  },
  menuItemPrice: {
    color: 'orange',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
