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
        <Text style={styles.price}>Price: ${product.price.toFixed(2)}</Text>
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
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    shadowColor: '#b4b4b4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: '#b4b4b4',
    borderColor: '#FFF6E9',
  },
  imageContainer: {
    width: 120,
    height: 120,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEFAF6',
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
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#1f695a',
  },
  description: {
    marginBottom: 12,
    fontSize: width * 0.033,
    color: '#2d2e30',
  },
  price: {
    fontSize: width * 0.046,
    fontWeight: '700',
    color: '#554c3c',
    marginBottom: 10,
  },
  optionsContainer: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  option: {
    fontSize: width * 0.03,
    color: '#66748d',
  },
  iconButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    padding: 10,
    backgroundColor: '#da9820',
    borderRadius: 50,
  },
  icon: {
    fontSize: width * 0.06,
    color: 'white',
  },
});

export default ProductCard;
