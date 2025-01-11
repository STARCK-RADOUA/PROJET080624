import { BASE_URL } from '@env';

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { getClient } from '../services/userService'; // Assuming this function gets the client/user ID

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const userId = await getClient();
        const url = `${BASE_URL}/api/order-items/${userId}/order-items`;
        const response = await axios.get(url);
        setCartItems(response.data);
      } catch (error) {
        console.error('Failed to fetch cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, setCartItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
