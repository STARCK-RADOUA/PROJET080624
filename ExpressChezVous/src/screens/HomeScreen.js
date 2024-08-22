import { BASE_URLIO } from '@env';
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import io from 'socket.io-client';
import NotificationMenu from '../components/NotificationMenu';
import PrductBottomSheetScreen from './PrductBottomSheetScreen';
import { DataContext } from '../navigation/DataContext';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [isNotificationMenuVisible, setIsNotificationMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const bottomSheetRef = useRef(null);
  const { sharedData } = useContext(DataContext);
  const serviceName = sharedData.serviceName;
  
  // Socket reference
  const socket = useRef(null);

  useEffect(() => {
    // Establish socket connection
    socket.current = io(`${BASE_URLIO}`);

    // Request and listen for active products from the server
    socket.current.emit('requestActiveProducts', serviceName);

    // Real-time product updates
    socket.current.on('activeProducts', (products) => {
      setMenuItems((prevItems) => {
        // Only update if the product list has changed
        if (JSON.stringify(prevItems) !== JSON.stringify(products)) {
          return products;
        }
        return prevItems;
      });
    });

    // Cleanup on unmount
    return () => {
      socket.current.off('activeProducts');
      socket.current.disconnect();
    };
  }, [serviceName]);

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
    bottomSheetRef.current?.scrollTo(-SCREEN_HEIGHT / 2); // Open bottom sheet
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
        {menuItems.length === 0 ? (
          <Text style={styles.noProductsText}>No products available</Text>
        ) : (
          menuItems.map((item, index) => (
            <TouchableOpacity key={item.id || index} style={styles.menuItem} onPress={() => onPress(item)}>
              <Image source={{ uri: item.image_url }} style={styles.menuItemImage} />
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
                <Text style={styles.menuItemPrice}>€{item.price.toFixed(2)}</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="orange" />
            </TouchableOpacity>
          ))
        )}
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
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  menuItemText: {
    flex: 1,
    marginLeft: 15,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  menuItemDescription: {
    color: '#777',
    marginTop: 5,
  },
  menuItemPrice: {
    color: 'orange',
    fontWeight: 'bold',
    marginTop: 5,
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;
