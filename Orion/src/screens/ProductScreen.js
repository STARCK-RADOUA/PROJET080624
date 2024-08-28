import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import axios from 'axios';
import AddProductModal from '../components/AddProductModal';
import ProductCard from '../components/ProductCad';
import ProductModal from '../components/ProductModal';

const ProductScreen = () => {
  const [products, setProducts] = useState([]);      // List of products fetched from the backend
  const [loading, setLoading] = useState(true);      // Loading state for skeleton placeholder
  const [searchText, setSearchText] = useState('');  // Search text for filtering products
  const [addModalVisible, setAddModalVisible] = useState(false);  // State for Add Product modal visibility
  const [productModalVisible, setProductModalVisible] = useState(false);  // State for Product Details modal visibility
  const [selectedProduct, setSelectedProduct] = useState(null);   // State for the selected product details

  // Fetch products from the backend when the component is mounted
  useEffect(() => {
    axios.get('http://192.168.1.11:4000/api/products/get')
      .then(response => {
        setProducts(response.data);  // Update products state with data from API
        setLoading(false);  // Set loading to false once data is fetched
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);  // Stop loading in case of an error
      });
  }, []);

  // Filter products based on search input (by name or service type)
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.service_type.toLowerCase().includes(searchText.toLowerCase())
  );

  // Open the product details modal
  const handleOpenProductModal = (product) => {
    setSelectedProduct(product);
    setProductModalVisible(true);
  };

  // Close the product details modal
  const handleCloseProductModal = () => {
    setProductModalVisible(false);
    setSelectedProduct(null);
  };

  // Render custom skeleton loader for loading state
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
    <View style={styles.appContainer}>
      {/* Header with Search Input */}
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Products</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or service type..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}  // Update search text state
          />
          <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable List of Products */}
      <ScrollView contentContainerStyle={styles.cardList}>
        {loading ? (
          renderSkeleton()  // Render custom skeleton during loading
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <ProductCard key={index} product={product} onReadMore={() => handleOpenProductModal(product)} />
          ))
        ) : (
          <Text style={styles.noResultsText}>No products found</Text>
        )}
      </ScrollView>

      {/* Add Product Modal */}
      <AddProductModal modalVisible={addModalVisible} setModalVisible={setAddModalVisible} />

      {/* Product Details Modal */}
      <ProductModal
        visible={productModalVisible}
        onClose={handleCloseProductModal}
        product={selectedProduct}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  headerContainer: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f3b13e',
    borderColor: '#f3b13e',
    borderWidth: 1,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#1f2937',
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
