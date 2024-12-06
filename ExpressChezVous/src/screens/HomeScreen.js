import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import io from 'socket.io-client';
import PrductBottomSheetScreen from './PrductBottomSheetScreen';
import { DataContext } from '../navigation/DataContext';
import Header from '../components/Header';
import { BASE_URL, BASE_URLIO } from '@env';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [isNotificationMenuVisible, setIsNotificationMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);  // Visibility state for bottom sheet
  const slideAnim = useRef(new Animated.Value(width)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bottomSheetRef = useRef(null);
  const { sharedData } = useContext(DataContext);
  const serviceName = sharedData.serviceName;

  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(`${BASE_URLIO}`);
    socket.current.emit('requestActiveProducts', serviceName);
    socket.current.on('newactiveProducts', () => {
      socket.current.emit('requestActiveProducts', serviceName);
    });

    socket.current.on('activeProducts', (response) => {
      if (Array.isArray(response.products)) {
        setMenuItems((prevItems) => {
          if (JSON.stringify(prevItems) !== JSON.stringify(response.products)) {
            return response.products;
          }
          return prevItems;
        });
      }
    });

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
    setIsBottomSheetVisible(true);  // Show bottom sheet when an item is selected
    bottomSheetRef.current?.scrollTo(-SCREEN_HEIGHT / 2);
  }, []);

  const onClose = () => {
    setIsBottomSheetVisible(false);  // Close the bottom sheet
  };

  const animateItem = (index) => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        friction: 2,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView style={styles.menuList}>
        {menuItems && Array.isArray(menuItems) && menuItems.length === 0 ? (
          <Text style={styles.noProductsText}>No products available</Text>
        ) : (
          menuItems.map((item, index) => (
            <Animated.View
              key={item.id || index}
              style={[
                styles.menuItem,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
              onLayout={() => animateItem(index)}
            >
              <TouchableOpacity onPress={() => onPress(item)} style={styles.touchableArea}>
                <Image source={{ uri: item.image_url }} style={styles.menuItemImage} />
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                  <Text style={styles.menuItemPrice}>€{item.price.toFixed(2)}</Text>
                </View>
                <MaterialIcons name="keyboard-arrow-right" size={24} color="#ffa726" />
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>

      <PrductBottomSheetScreen
        ref={bottomSheetRef}
        item={selectedItem}  // Pass the selected item to the bottom sheet
        isVisible={isBottomSheetVisible}  // Control visibility of the bottom sheet
        onClose={onClose}  // Close the bottom sheet
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  menuList: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  menuItemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ffa726',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 15,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    fontWeight: '600',
    textShadowColor: '#ffa726',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
    fontWeight: '600',
    textShadowColor: '#221f1b',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 3,
  },
  menuItemPrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffa726',
    fontWeight: '600',
    textShadowColor: '#b46f07',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
  touchableArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HomeScreen;
