import React, { useCallback, useContext, useImperativeHandle, useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text , TouchableOpacity, Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler'; // Import ScrollView from gesture-handler

import axios from 'axios';
import { getClientId } from '../services/userService'; // Import the getClient function
import { DataContext } from '../navigation/DataContext';
import { BASE_URL } from '@env';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT / 1.45;
const { width, height } = Dimensions.get('window');

const PrductBottomSheetScreen = React.forwardRef(({ item }, ref) => {
  const translateY = useSharedValue(0);
  const active = useSharedValue(false);
  const { sharedData } = useContext(DataContext);
  const serviceName  = sharedData.serviceName;
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [extras, setExtras] = useState({
    extraBeefPatty: false,
    extraCheeseSlice: false,
    extraFries: false,
  });

  const [totalPrice, setTotalPrice] = useState(item?.price || 0);

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
      translateY.value+100,
      [MAX_TRANSLATE_Y + 10, MAX_TRANSLATE_Y],
      [400, 5],
      Extrapolate.CLAMP
    );

    return {
      borderRadius,
      transform: [{ translateY: translateY.value -80}],
    };
  });

  const rImageStyle = useAnimatedStyle(() => {
    const scaleImage = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y, 0],
      [1.5, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale: scaleImage }],
    };
  });

  useEffect(() => {
    const checkIfItemIsInCart = async () => {
      try {
        const clientId = await getClientId();
        const url = `${BASE_URL}/api/order-items/${clientId}/${serviceName}/order-items`;

        const response = await axios.get(url);
        const addedItem = response.data.find(orderItem => orderItem.product_id._id === item?._id);

        if (addedItem) {
          setIsAddedToCart(true);
        } else {
          setIsAddedToCart(false);
        }
      } catch (error) {
        console.error('Error checking if item is in cart:', error);
      }
    };

    if (item) {
      checkIfItemIsInCart();
    }
  }, [item]);

  useEffect(() => {
    if (item) {
      const basePrice = item.price;
      const extraPrice = Object.keys(extras)
        .filter(extra => extras[extra])
        .reduce((sum, extra) => {
          const extraCost = item.options?.find(opt => opt.name === extra)?.price || 0;
          return sum + extraCost;
        }, 0);

      setTotalPrice((basePrice + extraPrice) * quantity);
    }
  }, [quantity, extras, item]);

  const handleQuantityChange = (type) => {
    if (type === 'increment') {
      setQuantity(quantity + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleExtraChange = (extra) => {
    if (!isAddedToCart) {
      setExtras((prevState) => ({
        ...prevState,
        [extra]: !prevState[extra],
      }));
    }
  };

  const handleAddToCart = async () => {
    try {
      const selectedItems = Object.keys(extras)
        .filter(extra => extras[extra])
        .map(extra => ({
          name: extra,
          price: item.options?.find(opt => opt.name === extra)?.price || 0,
        }));

      const clientId = await getClientId();

      await axios.post(`${BASE_URL}/api/order-items`, {
        clientId,
        productId: item?._id,
        quantity,
        selectedItems,
        serviceName: serviceName,
      });

      setIsAddedToCart(true);
      setQuantity(1);
      setExtras({
        extraBeefPatty: false,
        extraCheeseSlice: false,
        extraFries: false,
      });
      scrollTo(0);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  if (!item) {
    return null;
  }

 return (
  <GestureDetector gesture={gesture}>
    <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
      {item.image_url ? (
        <Animated.Image
          source={{ uri: item.image_url }}
          style={[styles.productImage, rImageStyle]}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.errorText}>Image not available</Text>
      )}
      <View style={styles.line} />
      <View style={styles.contentContainer}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.heading}>{item.name}</Text>
              <Text style={styles.price}>${totalPrice.toFixed(2)}</Text>
            </View>

            <Text style={styles.menuItemDescription}>{item.description}</Text>

            <View style={styles.quantityAndLabelContainer}>
              <Text style={styles.extrasLabel}>Select Extras:</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => handleQuantityChange('decrement')}>
                  <Text style={styles.quantityButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => handleQuantityChange('increment')}>
                  <Text style={styles.quantityButton}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>

            <View style={styles.optionContainer}>
              {item.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.border,
                    isAddedToCart && styles.borderDisabled,
                  ]}
                  onPress={() => handleExtraChange(option.name)}
                  disabled={isAddedToCart}
                >
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionText}>{option.name}</Text>
                    <Text style={styles.optionPrice}>+${option.price.toFixed(2)}</Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      extras[option.name] && styles.checkboxChecked,
                      isAddedToCart && styles.checkboxDisabled,
                    ]}
                  >
                    {extras[option.name] && <Text style={styles.checkboxTick}>✔️</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
                    </ScrollView>
                    <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              isAddedToCart && styles.buttonDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={isAddedToCart}
          >
            <Text style={styles.buttonText}>
              {isAddedToCart ? 'Added to Cart' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>


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
    backgroundColor: '#f7c049ef',
    position: 'absolute',
    top: SCREEN_HEIGHT,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: '#8f53531',
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  contentContainer: {
    paddingHorizontal: 40,
    paddingTop: 30,
  },
  productImage: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.4,
    alignSelf: 'center',
    borderRadius: 15, // Rounded corners for the image
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    paddingBottom: 190,
    elevation: 8,
  },
  scrollContainer: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.4,
    alignSelf: 'center',
    borderWidth: 1.5,
    backgroundColor: '#cfcdcd37',
    borderColor: '#ffffff50',

    shadowColor: '#3f3b3b',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 9, 
   borderBottomLeftRadius: 50,
   borderBottomRightRadius: 50,
   paddingHorizontal: width * 0.12,
  },

  menuItemDescription: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
    fontWeight: '600',
    textShadowColor: '#221f1b',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1.9,
  },
  price: {
    fontSize: 22,
    color: '#ce7100',
    fontWeight: 'bold',
    color: '#f3ebebfd',
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d37604',
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  container: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height*0.008,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF8C00',
    
  },
  heart: {
    fontSize: 24,
    color: '#FF8C00',
  },
  quantityAndLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: '#cfcdcd37',
    borderColor: '#ffffff50',
marginBottom: height*0.008,
padding:height*0.008,
    shadowColor: '#3f3b3b',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 9, 
borderRadius:50,
   paddinVertical: width * 0.1,
   paddingHorizontal: width * 0.12,
  },
  extrasLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    fontWeight: '600',
    textShadowColor: '#d8d2d2',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  quantityButton: {
    fontSize: 22,
    color: '#FF8C00',
  },
  quantityText: {
    fontSize: 20,
    marginHorizontal: 10,
    
  },
  optionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',


  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  borderDisabled: {
    opacity: 0.5,
  },
  optionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    color: '#8B4513',
    marginRight: 10,
    fontWeight: '600',
    textShadowColor: '#daaa0f',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  optionPrice: {
    fontSize: 18,
    color: '#8B4513',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#FF8C00',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  checkboxChecked: {
    backgroundColor: '#FF8C00',
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkboxTick: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#FF8C00',
    paddingVertical: 11,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
});

export default PrductBottomSheetScreen;
