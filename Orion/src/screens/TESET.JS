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
        <Icon name="moon-outline" type="ionicon" color="#000" />
        <Icon name="person" type="ionicon" color="#000" />
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
              stroke: '#ffa726',
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '45%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#1976d2',
  },
  filterText: {
    color: '#fff',
  },
  chartContainer: {
    marginTop: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  periodContainer: {
    flexDirection: 'row',
  },
  periodText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#1976d2',
  },
  activePeriod: {
    fontWeight: 'bold',
    color: '#000',
  },
});

export default HomeScreen;