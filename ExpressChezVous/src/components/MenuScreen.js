import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MenuComponent = ({ isVisible, toggleMenu }) => {
  const slideAnim = React.useRef(new Animated.Value(-width * 0.6)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width * 0.6,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  return (
    <>
      {isVisible && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={toggleMenu}>
          <Animated.View style={[styles.sideMenu, { transform: [{ translateX: slideAnim }] }]}>
            <Text style={styles.menuOptionText}>Accueil</Text>
            <Text style={styles.menuOptionText}>Orders</Text>
            <Text style={styles.menuOptionText}>Cart</Text>
            <Text style={styles.menuOptionText}>Profile</Text>
          </Animated.View>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // léger fond transparent
    zIndex: 2,
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '60%',
    height: '100%',
    backgroundColor: 'orange',
    padding: 20,
    zIndex: 3, // Menu doit être au-dessus de tout le reste
  },
  menuOptionText: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 15,
  },
});

export default MenuComponent;
