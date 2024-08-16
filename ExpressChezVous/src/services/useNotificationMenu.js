import { BASE_URL, BASE_URLIO } from '@env';

// useNotificationMenu.js
import { useState, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const useNotificationMenu = () => {
  const [isNotificationMenuVisible, setIsNotificationMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

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

  return { isNotificationMenuVisible, slideAnim, toggleNotificationMenu };
};

export default useNotificationMenu;
