import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ProductCard = ({ product, onReadMore }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image_url }} style={styles.productImage} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.price}>Prix: ${product.price.toFixed(2)}</Text>
        <View style={styles.optionsContainer}>
          {product.options.map((option, index) => (
            <Text key={index} style={styles.option}>
              {option.name} (+${option.price.toFixed(2)})
            </Text>
          ))}
        </View>
        <TouchableOpacity onPress={() => onReadMore(product)} style={styles.iconButton}>
          <Ionicons name="chevron-forward-outline" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#E2E8F0', // Light grey border
    backgroundColor: '#FFF', // White background for the card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC', // Light background for image container
    borderRadius: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
    fontSize: width * 0.05, // Responsive font size for title
    fontWeight: 'bold',
    color: '#2D3748', // Dark grey text for the title
  },
  description: {
    marginBottom: 10,
    fontSize: width * 0.038, // Slightly smaller font for description
    color: '#4A5568', // Grey for description text
  },
  price: {
    fontSize: width * 0.045, // Medium font for price
    fontWeight: 'bold',
    color: '#1A202C', // Dark grey text for the price
    marginBottom: 10,
  },
  optionsContainer: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  option: {
    fontSize: width * 0.034, // Smaller font for options
    color: '#718096', // Lighter grey for options
  },
  iconButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    padding: 12,
    backgroundColor: '#5A67D8', // Indigo for the action button
    borderRadius: 30,
    elevation: 2,
  },
  icon: {
    fontSize: width * 0.06, // Responsive icon size
    color: '#FFF', // White icon for contrast
  },
});


export default ProductCard;
