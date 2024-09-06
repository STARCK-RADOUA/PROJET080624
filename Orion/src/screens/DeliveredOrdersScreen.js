import React, { useState, useEffect } from 'react';
import { BASE_URLIO } from '@env';

import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { io } from 'socket.io-client';
import moment from 'moment';
import DeliveredOrderModal from '../components/DeliverdOrderModal';

const DeliveredOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io(BASE_URLIO);
         
    socket.emit('getDeliveredOrders') ;
    socket.on('orderDeliverredUpdated', (data) => {
      setOrders(data.orders);
      setFilteredOrders(data.orders); // Show all orders by default
      setLoading(false); // Stop loading once data is fetched
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err.message);
      setLoading(false); // Stop loading if there's an error
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filterOrdersByDate = (selectedDate) => {
    const filtered = orders.filter(order =>
      moment(order.delivery_time).isSame(selectedDate, 'day')
    );
    setFilteredOrders(filtered);
  };

  const filterOrdersBySearch = (query) => {
    setSearchQuery(query);
    const filtered = orders.filter(order => {
      const clientName = order.client_name ? order.client_name.toLowerCase() : '';
      const driverName = order.driver_name ? order.driver_name.toLowerCase() : '';
      const productNames = order.products
        .map(p => p.product?.name ? p.product.name.toLowerCase() : '')
        .join(' ');
      const searchText = query.toLowerCase();
      return (
        clientName.includes(searchText) ||
        driverName.includes(searchText) ||
        productNames.includes(searchText)
      );
    });
    setFilteredOrders(filtered);
  };

  const handleShowAll = () => {
    setFilteredOrders(orders); // Show all orders when "Show All" is pressed
  };

  const handleCardPress = (order) => {
    setSelectedOrder(order); // Set the selected order to display in the modal
  };

  const handleCloseModal = () => {
    setSelectedOrder(null); // Close the modal
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
      <Text style={styles.header}>Delivered Orders</Text>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by client, driver, or product name..."
        value={searchQuery}
        onChangeText={filterOrdersBySearch}
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
          <Ionicons name="calendar-outline" size={24} color="black" />
          <Text style={styles.filterText}>{moment(filterDate).format('YYYY-MM-DD')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.showAllButton} onPress={handleShowAll}>
          <Text style={styles.showAllText}>Show All</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={filterDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFilterDate(selectedDate);
              filterOrdersByDate(selectedDate); // Filter orders when a new date is selected
            }
          }}
        />
      )}

      <FlatList
        data={loading ? Array.from({ length: 3 }) : filteredOrders}
        keyExtractor={(item, index) => item?._id || index.toString()}
        renderItem={({ item }) => (
          loading ? (
            renderSkeleton()
          ) : (
            <TouchableOpacity onPress={() => handleCardPress(item)}>
              <View style={styles.card}>
                <Image
                  source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/order-history.png' }}
                  style={styles.orderIcon}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.orderNumber}>Order #{item.order_number ?? 'N/A'}</Text>
                  <Text style={styles.location}>{item.address_line}</Text>
                  <View style={styles.rightContainer}>
                    <Text style={styles.price}>€{item.total_price.toFixed(2)}</Text>
                    <Text style={styles.date}>{moment(item.delivery_time).format('YYYY-MM-DD HH:mm')}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )
        )}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Total in Euros: €
          {filteredOrders.reduce((total, order) => total + order.total_price, 0).toFixed(2)}
        </Text>
      </View>

      {selectedOrder && (
        <DeliveredOrderModal
          visible={!!selectedOrder}
          onClose={handleCloseModal}
          order={selectedOrder}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f3f4f6',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  showAllButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f3b13e',
    borderRadius: 8,
    marginLeft: 10,
  },
  showAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 5,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  orderIcon: {
    width: '15%',
    height: '85%',
    resizeMode: 'contain',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  totalContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
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

export default DeliveredOrdersScreen;
