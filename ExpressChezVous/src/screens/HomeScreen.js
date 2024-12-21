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
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const slideAnim = useRef(new Animated.Value(width)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current; // Shimmer animation
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
        setIsLoading(false); // Data loaded
      }
    });

    return () => {
      socket.current.off('activeProducts');
      socket.current.disconnect();
    };
  }, [serviceName]);

  useEffect(() => {
    // Start the shimmer animation loop
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 5500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

 

  const onPress = useCallback((item) => {
    setSelectedItem(item);
    setIsBottomSheetVisible(true);
    bottomSheetRef.current?.scrollTo(-SCREEN_HEIGHT / 2);
  }, []);

  const onClose = () => {
    setIsBottomSheetVisible(false);
  };

  const animateItem = (index) => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
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

  // Shimmer translation
  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView style={styles.menuList}>
        {isLoading ? (
          // Render Skeleton Loader
          Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={styles.menuItem}>
              <View style={styles.imageSkeleton} />
              <View style={styles.textSkeletonContainer}>
                <View style={styles.textSkeletonLineShort} />
                <View style={styles.textSkeletonLineMedium} />
                <View style={styles.textSkeletonLineLong} />
              </View>
              <View style={styles.iconSkeleton} />
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  {
                    transform: [{ translateX }],
                  },
                ]}
              />
            </View>
          ))
        ) : menuItems && Array.isArray(menuItems) && menuItems.length === 0 ? (
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
                  <Text style={styles.menuItemPrice}>
  Jusqu'à {item.quantityJamla || 0} pièces : €{(item.priceJamla || 0).toFixed(2)} par unité
</Text>
                </View>
                <MaterialIcons name="keyboard-arrow-right" size={24} color="#ffa726" />
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>

      <PrductBottomSheetScreen
        ref={bottomSheetRef}
        item={selectedItem}
        isVisible={isBottomSheetVisible}
        onClose={onClose}
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
    overflow: 'hidden', // Ensure shimmer doesn't overflow
  },
  touchableArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    fontWeight: '600',
    color: '#ffa726',
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
  // Skeleton Styles
  imageSkeleton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
  },
  textSkeletonContainer: {
    flex: 1,
    marginLeft: 15,
  },
  textSkeletonLineShort: {
    width: '40%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginBottom: 6,
  },
  textSkeletonLineMedium: {
    width: '60%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginBottom: 6,
  },
  textSkeletonLineLong: {
    width: '80%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  iconSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    marginLeft: 10,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    // Gradient effect can be simulated with linear gradient or animated view
  },
});

export default HomeScreen;
