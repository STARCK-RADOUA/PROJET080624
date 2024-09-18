import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const ProductCard = ({ product, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Debug: Logging the image URL to check if it's valid */}

      <Image
        source={{ uri: product.product.image_url }}
        style={styles.productImage}
        onError={(e) => console.log("Error loading image", e.nativeEvent.error)}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{product.product.name}</Text>
        <Text style={styles.productInfo}>
          Nombre d'achats : {product.totalTimesBought}
        </Text>
        <Text style={styles.productInfo}>
          Revenu total : ${product.totalRevenue.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    width: '95%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#e1e4e8', // Fallback color in case the image fails to load
  },
  infoContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productInfo: {
    fontSize: 16,
    color: '#555',
  },
});

export default ProductCard;
