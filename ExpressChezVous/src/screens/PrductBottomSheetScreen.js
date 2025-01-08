import React, { useState, useEffect,useCallback, useContext, forwardRef } from 'react';
import { Modal, Dimensions, StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator  , Alert} from 'react-native';
import { DataContext } from '../navigation/DataContext';
import { getClientId } from '../services/userService';
import axios from 'axios';
import { BASE_URL, BASE_URLIO } from '@env';
import { TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const PrductBottomSheetScreen = (props, ref) => {
  const { item, isVisible, onClose } = props;
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [extras, setExtras] = useState({
    extraBeefPatty: false,
    extraCheeseSlice: false,
    extraFries: false,
  });
  const [totalPrice, setTotalPrice] = useState(item?.price || 0);
  const { sharedData } = useContext(DataContext);
  const serviceName = sharedData.serviceName;
  const [isImageLoading, setIsImageLoading] = useState(true); // Image loading state
  useFocusEffect(
    useCallback(() => {
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
      return () => {
        // Actions à effectuer lorsque l'écran perd le focus, si nécessaire
      };
    }, [item, serviceName])
  );
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
  }, [item, serviceName]);


  useEffect(() => {
    if (item) {
      const isWholesale = quantity >= item.quantityJamla;
      const basePrice = isWholesale ? item.priceJamla : item.price;
      const extraPrice = Object.keys(extras)
        .filter(extra => extras[extra])
        .reduce((sum, extra) => {
          const extraCost = item.options?.find(opt => opt.name === extra)?.price || 0;
          return sum + extraCost;
        }, 0);
  
      setTotalPrice((basePrice + extraPrice) * quantity);
  
      // Show alert when wholesale price starts being applied
      if (isWholesale && quantity === item.quantityJamla) {
        Alert.alert(
          'Prix Jamla Activé',
          `Vous commencez à acheter au prix de gros (€${item.priceJamla.toFixed(2)} par unité).`
        );
      }
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
      onClose(); // Close modal after adding to cart
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  if (!item) return null;

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.imageContainer}>
              {isImageLoading && (
                <ActivityIndicator size="large" color="#e9ab25" style={styles.activityIndicator} />
              )}
              <Image
                source={{ uri: item.image_url, cache: 'force-cache' }}
                style={styles.productImage}
                resizeMode="contain"
                onLoadStart={() => setIsImageLoading(true)}
                onLoadEnd={() => setIsImageLoading(false)}
              />
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.heading}>{item.name}</Text>

              <View style={styles.quantityContainer2}>
              
                <Text style={styles.price}>€{totalPrice.toFixed(2)}</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity onPress={() => handleQuantityChange('decrement')}>
                    <Text style={styles.quantityButton2}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity onPress={() => handleQuantityChange('increment')}>
                    <Text style={styles.quantityButton}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.menuItemPrice}>
  Jusqu'à {item.quantityJamla || 0} pièces : €{(item.priceJamla || 0).toFixed(2)} par unité
</Text>

              <Text style={styles.menuItemDescription}>
                {item.description}
              </Text>

              <Text style={styles.extrasLabel}>Sélectionnez les extras :</Text>
              {item.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionButton}
                  onPress={() => handleExtraChange(option.name)}
                  disabled={isAddedToCart}
                >
                  <Text style={styles.optionText}>{option.name}</Text>
                  <Text style={styles.optionPrice}>+€{option.price.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.button, isAddedToCart && styles.buttonDisabled]}
                onPress={handleAddToCart}
                disabled={isAddedToCart}
              >
                <Text style={styles.buttonText}>
                  {isAddedToCart ? 'Ajouté au Panier' : 'Ajouter au Panier'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
  onPress={() => {
    setQuantity(1);  // Reset quantity to 1
    onClose();       // Call the onClose function
  }} 
  style={styles.closeButton}
>
  <Text style={styles.closeButtonText}>Fermer</Text>
</TouchableOpacity>

          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: SCREEN_WIDTH * 0.8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: SCREEN_WIDTH * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIndicator: {
    position: 'absolute',
    zIndex: 1,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  contentContainer: {
    paddingTop: 20,
    
    
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f08a17',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  menuItemDescription: {
    fontSize: 16,
    color: '#777',
    marginVertical: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  quantityContainer2: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    

    marginTop: 10,
  },
  quantityButton: {
    fontSize: 30,
    color: '#e9ab25',
    fontWeight: 'bold',

  }, quantityButton2: {
    fontSize: 38,
    color: '#e9ab25',
    fontWeight: 'bold',

  },
  quantityText: {
    fontSize: 20,
    marginHorizontal: 10,
  },
   
  extrasLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionPrice: {
    fontSize: 16,
    color: '#1c880d',
  },
  button: {
    backgroundColor: '#e9ab25',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#e9ab25',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default forwardRef(PrductBottomSheetScreen);
