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
    console.log('Tentative de connexion au serveur socket...');
    const socket = io(BASE_URLIO);

    socket.emit('watchProducts');
    console.log('Événement watchProducts émis');

    socket.on('productsUpdated', ({ products }) => {
      console.log('Événement productsUpdated reçu :', products);
      setProducts(products);
      setLoading(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Erreur de connexion :', error);
    });

    socket.on('connect', () => {
      console.log('Connecté au serveur socket');
    });

    socket.on('disconnect', () => {
      console.log('Déconnecté du serveur socket');
    });

    return () => {
      console.log('Déconnexion du serveur socket...');
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
        <Text style={styles.headerText}>Produits</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom ou type de service..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addButtonText}>Ajouter</Text>
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
          <Text style={styles.noResultsText}>Aucun produit trouvé</Text>
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
    backgroundColor: '#F9F9F9', // Light, neutral background
    paddingTop: 10,
  },
  header: {
    padding: 15,
    backgroundColor: '#E5E7EB', // Light grey for header background
    borderRadius: 12, // Rounded corners for a modern look
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748', // Dark grey for header text
  },
  searchInput: {
    flex: 1,
    height: 45,
    backgroundColor: '#FFFFFF', // White background for the input
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    fontSize: 16,
    borderColor: '#E2E8F0', // Subtle grey border
    borderWidth: 1,
    color: '#1A202C', // Darker grey for text input
    shadowColor: '#000', // Subtle shadow for elevation
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#5A67D8', // Indigo color for action button
    borderRadius: 10,
    elevation: 2, // Slight elevation for a raised button look
  },
  addButtonText: {
    color: '#FFFFFF', // White text for contrast
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardList: {
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280', // Grey color for "no results" text
    textAlign: 'center',
    marginTop: 20,
  },
  skeletonCard: {
    height: 100,
    backgroundColor: '#E5E7EB', // Light grey for skeleton loader background
    borderRadius: 12, // Rounded corners to match modern card style
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  skeletonTitle: {
    width: '60%',
    height: 20,
    backgroundColor: '#D1D5DB', // Lighter grey for skeleton title
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonDescription: {
    width: '80%',
    height: 15,
    backgroundColor: '#D1D5DB', // Grey for skeleton description
    borderRadius: 4,
  },
});


export default ProductScreen;
