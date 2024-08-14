import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { useCart } from './CartContext';

const ShoppingCartIcon = ({ color, size }) => {
  const { hasNewItem } = useCart();

  return (
    <View>
      <FontAwesome name="shopping-cart" color={color} size={size} />
      {hasNewItem && (
        <View
          style={{
            position: 'absolute',
            right: -6,
            top: -3,
            backgroundColor: 'red',
            borderRadius: 6,
            width: 12,
            height: 12,
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'flashing 1s infinite', // Create flashing animation
          }}
        >
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>•</Text>
        </View>
      )}
    </View>
  );
};

export default ShoppingCartIcon;
