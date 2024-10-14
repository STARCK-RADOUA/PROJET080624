import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { LineChart } from 'react-native-chart-kit';

const HomeScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');
  const [selectedFilter, setSelectedFilter] = useState('All');

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
        <Text style={styles.title}>Home</Text>
        <Icon name="moon-outline" type="ionicon" color="#81b0ff" />
        <Icon name="person" type="ionicon" color="#81b0ff" />
      </View>

      {/* Stats Cards Section */}
      <View style={styles.statsContainer}>
        <Card containerStyle={styles.card}>
          <Text>Total Menus</Text>
          <Text style={styles.statNumber}>140</Text>
        </Card>
        <Card containerStyle={styles.card}>
          <Text>Total Orders</Text>
          <Text style={styles.statNumber}>175</Text>
        </Card>
        <Card containerStyle={styles.card}>
          <Text>Total Clients</Text>
          <Text style={styles.statNumber}>263</Text>
        </Card>
        <Card containerStyle={styles.card}>
          <Text>Total Revenue</Text>
          <Text style={styles.statNumber}>$13,755</Text>
        </Card>
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
    flexDirection: 'flex-row',
    flexWrap: 'flex-row',
    justifyContent: 'space-between',
  },
  card: {
    width: '45%',
    padding: 20,
    borderRadius: 15,  // Increased rounding for a softer, modern feel
    backgroundColor: '#ffffff',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',  // Subtle shadow for depth
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,  // Elevation for Android shadow
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
