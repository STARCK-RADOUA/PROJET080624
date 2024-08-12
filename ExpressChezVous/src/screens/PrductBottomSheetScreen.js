import React, { useCallback, useImperativeHandle, useState } from 'react';
import { Dimensions, StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { getUser } from '../services/userService'; // Import the getUser function
import axios from 'axios';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT / 1.5;

const PrductBottomSheetScreen = React.forwardRef(({ item }, ref) => {
  const translateY = useSharedValue(0);
  const active = useSharedValue(false);

  const [quantity, setQuantity] = useState(1);
  const [extras, setExtras] = useState({
    extraBeefPatty: false,
    extraCheeseSlice: false,
    extraFries: false,
  });

  const handleQuantityChange = (type) => {
    if (type === 'increment') {
      setQuantity(quantity + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleExtraChange = (extra) => {
    setExtras((prevState) => ({
      ...prevState,
      [extra]: !prevState[extra],
    }));
  };

  const handleAddToCart = async () => {
    try {
      const selectedItems = Object.keys(extras)
        .filter(extra => extras[extra])
        .map(extra => ({
          name: extra,
          price: item.options.find(opt => opt.name === extra)?.price || 0,
        }));
  
      const userId = await getUser(); // Get the userId from the service
  
      await axios.post('http://192.168.1.35:4000/api/order-items', {
        userId: userId,
        productId: item._id,
        quantity,
        selectedItems,
      });
  
      console.log('Item added to cart successfully');
  
      // Reset quantity and extras to initial state
      setQuantity(1);
      setExtras({
        extraBeefPatty: false,
        extraCheeseSlice: false,
        extraFries: false,
      });
  
      // Close the bottom sheet
      scrollTo(0);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };
  
  const scrollTo = useCallback((destination) => {
    'worklet';
    active.value = destination !== 0;
    translateY.value = withSpring(destination, { damping: 50 });
  }, []);

  const isActive = useCallback(() => {
    return active.value;
  }, []);

  useImperativeHandle(ref, () => ({ scrollTo, isActive }), [scrollTo, isActive]);

  const context = useSharedValue({ y: 0 });
  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
    })
    .onEnd(() => {
      if (translateY.value > -SCREEN_HEIGHT / 4) {
        scrollTo(0);
      } else {
        scrollTo(MAX_TRANSLATE_Y);
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
      [25, 25],
      Extrapolate.CLAMP
    );

    return {
      borderRadius,
      transform: [{ translateY: translateY.value }],
    };
  });

  const rImageStyle = useAnimatedStyle(() => {
    const translateYImage = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y, 0],
      [-100, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY: translateYImage }],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
        {item && item.image_url ? (
          <Animated.Image
            source={{ uri: item.image_url }}
            style={[styles.productImage, rImageStyle]}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.errorText}>Image not available</Text>
        )}
        <View style={styles.line} />
        <View style={styles.contentContainer}>
          <View style={styles.container}>
            <View style={styles.header}>
              {item && (
                <>
                  <Text style={styles.heading}>{item.name}</Text>
                  <Text style={styles.heading}>{item.price}</Text>
                </>
              )}
              <TouchableOpacity>
                <Text style={styles.heart}>❤️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.optionalText}>(Optional)</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={() => handleQuantityChange('decrement')}>
                <Text style={styles.quantityButton}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={() => handleQuantityChange('increment')}>
                <Text style={styles.quantityButton}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.optionContainer}>
              <TouchableOpacity style={styles.border} onPress={() => handleExtraChange('extraBeefPatty')}>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionText}>Extra Beef Patty</Text>
                  <Text style={styles.optionPrice}>+$1.00</Text>
                </View>
                <View style={styles.checkbox}>
                  {extras.extraBeefPatty && <Text style={styles.checkboxChecked}>✔️</Text>}
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.border} onPress={() => handleExtraChange('extraCheeseSlice')}>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionText}>Extra Cheese Slice</Text>
                  <Text style={styles.optionPrice}>+$0.50</Text>
                </View>
                <View style={styles.checkbox}>
                  {extras.extraCheeseSlice && <Text style={styles.checkboxChecked}>✔️</Text>}
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.border} onPress={() => handleExtraChange('extraFries')}>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionText}>Extra Fries</Text>
                  <Text style={styles.optionPrice}>+$1.00</Text>
                </View>
                <View style={styles.checkbox}>
                  {extras.extraFries && <Text style={styles.checkboxChecked}>✔️</Text>}
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
              <Text style={styles.buttonText}>Add to cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: '#f9f3f1',
    position: 'absolute',
    top: SCREEN_HEIGHT,
    borderRadius: 25,
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: 'grey',
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 2,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  productImage: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    borderRadius: 50,
    borderWidth: 5,
    borderColor: '#fff',
  },
  price: {
    fontSize: 18,
    color: 'orange',
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  container: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  heart: {
    fontSize: 24,
    color: '#FF8C00',
  },
  optionalText: {
    color: 'gray',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityButton: {
    fontSize: 20,
    color: '#FF8C00',
    paddingHorizontal: 10,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  optionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
    marginTop: 10,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#8B4513',
    marginRight: 10,
  },
  optionPrice: {
    fontSize: 16,
    color: '#8B4513',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#FF8C00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    fontSize: 18,
    color: '#FF8C00',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#FF8C00',
    paddingVertical: 11,
    borderRadius: 25,
    alignItems: 'center',
    marginLeft: 40,
    marginRight: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default PrductBottomSheetScreen;
