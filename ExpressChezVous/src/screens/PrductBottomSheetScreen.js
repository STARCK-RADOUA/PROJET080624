import React, { useState, useEffect, useContext, forwardRef } from 'react';
import { Modal, Dimensions, StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { DataContext } from '../navigation/DataContext';
import { getClientId } from '../services/userService';
import axios from 'axios';
import { BASE_URL } from '@env';
import { TouchableWithoutFeedback } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const PrductBottomSheetScreen = (props, ref) => {
  const { item, isVisible, onClose } = props;  // Destructure props here
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
      onClose();  // Close modal after adding to cart
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  if (!item) return null;

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>

      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.productImage} resizeMode="contain" />
          ) : (
            <Text style={styles.errorText}>Image not available</Text>
          )}

          <View style={styles.contentContainer}>
            <Text style={styles.heading}>{item.name}</Text>

            <View style={styles.quantityContainer2}>


            <Text style={styles.price}>${totalPrice.toFixed(2)}</Text>
 <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={() => handleQuantityChange('decrement')}>
                <Text style={styles.quantityButton}>-  </Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={() => handleQuantityChange('increment')}>
                <Text style={styles.quantityButton}> +</Text>
              </TouchableOpacity>
            </View>
            </View>


            <Text style={styles.menuItemDescription}>
              {item.description}
            </Text>

           

            <Text style={styles.extrasLabel}>Select Extras:</Text>
            {item.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleExtraChange(option.name)}
                disabled={isAddedToCart}
              >
                <Text style={styles.optionText}>{option.name}</Text>
                <Text style={styles.optionPrice}>+${option.price.toFixed(2)}</Text>
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

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
  productImage: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.4,
    alignSelf: 'center',
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

  },  quantityContainer2: {
    flexDirection: 'row',
alignItems: 'center',
  justifyContent: 'space-between',

  },
  quantityButton: {
    fontSize: 26,
    color: '#e9ab25',
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
