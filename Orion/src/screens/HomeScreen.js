import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { LineChart } from 'react-native-chart-kit';
import { BASE_URLIO } from '@env';
import io from 'socket.io-client';

const HomeScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [totalSum, setTotalSum] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState('');
  const [totalClients, setTotalClients] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState([]);

  useEffect(() => {
    const socket = io(BASE_URLIO);

    // Emit the event to get daily revenue
    socket.emit('getDailyRevenue');

    // Listen for daily revenue response
    socket.on('dailyRevenue', (data) => {
      setDailyRevenue(data.dailyRevenue);
      console.log(data)
    });

    // Listen for errors
    socket.on('error', (message) => {
      setError(message);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    const socket = io(BASE_URLIO);

    // Emit the event to get total products
    socket.emit('getTotalProducts');

    // Listen for total products response
    socket.on('totalProducts', (data) => {
      setTotalProducts(data.totalProducts);
    });

    // Listen for errors
    socket.on('error', (message) => {
      setError(message);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    const socket = io(BASE_URLIO);

    // Emit the event to get total clients
    socket.emit('getTotalClients');

    // Listen for total clients response
    socket.on('totalClients', (data) => {
      setTotalClients(data.totalClients);
    });

    // Listen for errors
    socket.on('error', (message) => {
      setError(message);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const socket = io(BASE_URLIO);

    // Fetch delivered orders summary when the component mounts
    socket.emit('getDeliveredOrdersSummary');

    // Listen for delivered orders summary
    socket.on('deliveredOrdersSummary', (data) => {
      console.log('data' , data)
      setTotalSum(data.totalSum);
      setTotalCount(data.totalCount);
    });

    // Listen for errors
    socket.on('error', (message) => {
      setError(message);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []); // Empty depend

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>tableau de bord</Text>
        
      </View>

      {/* Stats Cards Section */}
      <View style={styles.statsContainer}>
        <View style={styles.cardWrapper}>
          <Card containerStyle={[styles.card, styles.card1]}>
            <Text>Total Menus</Text>
            <Text style={styles.statNumber}>{totalProducts}</Text>
          </Card>
          <Card containerStyle={[styles.card, styles.card2]}>
            <Text>Total Orders</Text>
            <Text style={styles.statNumber}>{totalCount}</Text>
          </Card>
          <Card containerStyle={[styles.card, styles.card3]}>
            <Text>Total Clients</Text>
            <Text style={styles.statNumber}>{totalClients}</Text>
          </Card>
          <Card containerStyle={[styles.card, styles.card4]}>
            <Text>Total Revenue</Text>
            <Text style={styles.statNumber}>{totalSum} €</Text>
          </Card>
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'All' && styles.activeFilter]}
          onPress={() => handleFilterChange('All')}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'Product' && styles.activeFilter]}
          onPress={() => handleFilterChange('Product')}
        >
          <Text style={styles.filterText}>Product Revenue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'Driver' && styles.activeFilter]}
          onPress={() => handleFilterChange('Driver')}
        >
          <Text style={styles.filterText}>Driver Revenue</Text>
        </TouchableOpacity>
      </View>

      {/* Revenue Chart Section */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Revenue</Text>
          <View style={styles.periodContainer}>
            <TouchableOpacity onPress={() => handlePeriodChange('Weekly')}>
              <Text style={[styles.periodText, selectedPeriod === 'Weekly' && styles.activePeriod]}>
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePeriodChange('Monthly')}>
              <Text style={[styles.periodText, selectedPeriod === 'Monthly' && styles.activePeriod]}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <LineChart
          data={{
            labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            datasets: [
              {
                data: selectedFilter === 'All' || selectedFilter === 'Product'
                  ? [5000, 10000, 7500, 15000, 12000, 17000, 14000]
                  : [0, 0, 0, 0, 0, 0, 0],
                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Product Revenue
                strokeWidth: 2,
              },
              {
                data: selectedFilter === 'All' || selectedFilter === 'Driver'
                  ? [4000, 8000, 6000, 12000, 10000, 14000, 13000]
                  : [0, 0, 0, 0, 0, 0, 0],
                color: (opacity = 1) => `rgba(66, 194, 244, ${opacity})`, // Driver Revenue
                strokeWidth: 2,
              },
            ],
          }}
          width={Dimensions.get('window').width - 40} // from react-native
          height={250}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#f5f5f5',
            backgroundGradientTo: '#f5f5f5',
            decimalPlaces: 0, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#81b0ff',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',  // Light background for a modern look
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,  // Slightly larger for modern headings
    fontWeight: '700',  // Bolder font for emphasis
    color: '#333',  // Dark gray text for modern contrast
  },
  statsContainer: {
    marginBottom: 20,
  },
  cardWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allows the cards to wrap into multiple lines
    justifyContent: 'space-between', // Aligns cards with space between them
  },
  card: {
    width: '43%',  // Each card takes up 48% of the width
    padding: 20,
    borderRadius: 15,  // Increased rounding for a softer, modern feel
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',  // Subtle shadow for depth
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,  // Elevation for Android shadow
  },
  card1: {
    backgroundColor: '#ffe4e1', // Soft red/pink tone
  },
  card2: {
    backgroundColor: '#e0f7fa', // Soft cyan/blue tone
  },
  card3: {
    backgroundColor: '#fff9c4', // Soft yellow tone
  },
  card4: {
    backgroundColor: '#d1c4e9', // Soft lavender tone
  },
  statNumber: {
    fontSize: 24,  // Bigger font for better emphasis
    fontWeight: 'bold',
    marginTop: 12,
    color: '#81b0ff',  // Theme color accent for consistency
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,  // Consistent rounding across components
    backgroundColor: '#f0f0f0',  // Flat, minimal background for inactive buttons
    marginHorizontal: 6,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#81b0ff',  // Active filter color matches the theme
  },
  filterText: {
    color: '#333',  // Modern, dark gray text for better contrast
    fontWeight: '500',  // Medium weight for modern buttons
  },
  chartContainer: {
    marginTop: 30,  // Increased spacing for better structure
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 20,  // Slightly larger title for clarity
    fontWeight: '700',
    color: '#333',  // Dark gray for modern look
  },
  periodContainer: {
    flexDirection: 'row',
  },
  periodText: {
    fontSize: 16,
    marginHorizontal: 12,
    color: '#81b0ff',  // Period color consistent with theme
    fontWeight: '500',
  },
  activePeriod: {
    fontWeight: 'bold',
    color: '#333',  // Active period has dark gray for readability
  },
});

export default HomeScreen;
