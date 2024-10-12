import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, SafeAreaView ,TouchableOpacity } from 'react-native';
import io from 'socket.io-client';
import ProductCard from './../components/ProductRevenueCard'; // Assuming you've created this component
import ProductRevenueModal from './../components/ProductRevenueModal'; // Assuming you've created this modal
import { BASE_URLIO } from '@env';
import { format } from 'date-fns';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; 
import DateTimePicker from '@react-native-community/datetimepicker';


export default function ProductRevenueScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    const socket = io(BASE_URLIO);

    // Emit event to get product data
    socket.emit('getProductsRevenue');

    // Listen for the event that returns the product data
    socket.on('productsRevenue', (data) => {
     console.log("data",JSON.stringify(data, null, 2));      
     setProducts(data);
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

  
  const applyFilters  = async() => {
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    console.log("data",formattedEndDate);  
    console.log(formattedStartDate)
    try {
      const response = await axios.get(`${BASE_URLIO}/api/products/all-revenue-between-dates`, {
        params: {
          startDate: formattedStartDate, // Example start date
          endDate: formattedEndDate    // Example end date
        }
      });
  
      setFilteredProducts(response.data);
       setShowFilterMenu(false);
    } catch (error) {
      console.error('Error fetching driver stats:', error);
    }
};

const toggleFilterMenu = () => {
  setShowFilterMenu(!showFilterMenu);
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
      <TouchableOpacity onPress={toggleFilterMenu} style={styles.filterButton}>
          <Ionicons name="filter-outline" size={24} color="#fff" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
        {showFilterMenu && (
        <View style={styles.filterMenu}>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Start Date: {startDate.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>End Date: {endDate.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={applyFilters} style={styles.applyFilterButton}>
            <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || startDate;
            setShowStartDatePicker(false);
            setStartDate(currentDate);
          }}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || endDate;
            setShowEndDatePicker(false);
            setEndDate(currentDate);
          }}
        />
      )}


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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e27a3f',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  filterButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  filterMenu: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },
  dateButton: {
    backgroundColor: '#1f695a',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  dateButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  applyFilterButton: {
    backgroundColor: '#2e8b57',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  applyFilterButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});
