import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import io from 'socket.io-client';
import NotificationMenu from '../components/NotificationMenu';
import PrductBottomSheetScreen from './PrductBottomSheetScreen';

const socket = io('http://192.168.8.129:4000');
const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [isNotificationMenuVisible, setIsNotificationMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const slideAnim = useRef(new Animated.Value(width)).current;
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

  const toggleNotificationMenu = () => {
    if (isNotificationMenuVisible) {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsNotificationMenuVisible(false));
    } else {
      setIsNotificationMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const onPress = useCallback((item) => {
    setSelectedItem(item);
    bottomSheetRef.current?.scrollTo(-SCREEN_HEIGHT / 2); // Ouvre le bottom sheet
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <MaterialIcons name="menu" size={24} color="black" />
        </TouchableOpacity>
        <Image source={{ uri: 'https://example.com/logo.png' }} style={styles.logo} />
        <TouchableOpacity onPress={toggleNotificationMenu}>
          <FontAwesome name="bell" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.menuList}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={item.id || index} style={styles.menuItem} onPress={() => onPress(item)}>
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
      {isNotificationMenuVisible && (
        <NotificationMenu slideAnim={slideAnim} toggleNotificationMenu={toggleNotificationMenu} />
      )}
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
