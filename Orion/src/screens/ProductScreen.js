import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import AddProductModal from '../components/AddProductModal';
import ProductCard from '../components/ProductCad';
import ProductModal from '../components/ProductModal';
import { BASE_URLIO } from '@env';

const ProductScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    console.log('Attempting to connect to the socket server...');
    const socket = io(BASE_URLIO);

    socket.emit('watchProducts');
    console.log('watchProducts event emitted');

    socket.on('productsUpdated', ({ products }) => {
      console.log('productsUpdated event received:', products);
      setProducts(products);
      setLoading(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('connect', () => {
      console.log('Connected to the socket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from the socket server');
    });

    return () => {
      console.log('Disconnecting from socket server...');
      socket.disconnect();
    };
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.service_type.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenProductModal = (product) => {
    setSelectedProduct(product);
    setProductModalVisible(true);
  };

  const handleCloseProductModal = () => {
    setProductModalVisible(false);
    setSelectedProduct(null);
  };

  const renderSkeleton = () => (
    <>
      {[...Array(3)].map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonDescription} />
        </View>
      ))}
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Products</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or service type..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.cardList}>
        {loading ? (
          renderSkeleton()
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <ProductCard key={index} product={product} onReadMore={() => handleOpenProductModal(product)} />
          ))
        ) : (
          <Text style={styles.noResultsText}>No products found</Text>
        )}
      </ScrollView>

      <AddProductModal modalVisible={addModalVisible} setModalVisible={setAddModalVisible} />

      <ProductModal
        visible={productModalVisible}
        onClose={handleCloseProductModal}
        product={selectedProduct}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f4f4c3',
    paddingTop: 10,
  },
  header: {
    padding: 10,
    backgroundColor: '#6472743e',
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#030e0f',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    height: 40,
    color: '#000',
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f3b13e',
    borderColor: '#f3b13e',
    borderWidth: 1,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#dfe1e6',
    fontSize: 14,
    fontWeight: '500',
  },
  cardList: {
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
    textAlign: 'center',
  },
  skeletonCard: {
    height: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
  },
  skeletonTitle: {
    width: '50%',
    height: 20,
    backgroundColor: '#d4d4d4',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonDescription: {
    width: '80%',
    height: 15,
    backgroundColor: '#d4d4d4',
    borderRadius: 4,
  },
});

export default ProductScreen;
