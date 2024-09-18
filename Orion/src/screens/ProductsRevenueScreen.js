import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import io from 'socket.io-client';
import ProductCard from './../components/ProductRevenueCard'; // Assuming you've created this component
import ProductRevenueModal from './../components/ProductRevenueModal'; // Assuming you've created this modal
import { BASE_URLIO } from '@env';

export default function ProductRevenueScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const socket = io(BASE_URLIO);

    // Emit event to get product data
    socket.emit('getProductsRevenue');

    // Listen for the event that returns the product data
    socket.on('productsRevenue', (data) => {
     console.log("data",JSON.stringify(data, null, 2));      setProducts(data);
      setFilteredProducts(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = (query) => {
    setSearchText(query);
    const filtered = products.filter(product =>
      product.product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.product._id.toString().includes(query)
    );
    setFilteredProducts(filtered);
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Liste des produits</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom ou ID..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.cardContainer}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard
              key={product.product._id}
              product={product}
              onPress={() => openModal(product)}
            />
          ))
        ) : (
          <Text>Aucun produit disponible</Text>
        )}
      </ScrollView>

      {/* Render the modal */}
      {selectedProduct && (
        <ProductRevenueModal
          visible={modalVisible}
          onClose={closeModal}
          product={selectedProduct}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f4f4c3',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#030e0f',
    marginBottom: 20,
    textAlign: 'left',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingLeft: 40,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    color: '#111827',
    marginRight: 10,
  },
  cardContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
