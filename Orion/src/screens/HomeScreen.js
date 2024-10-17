import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { Card } from 'react-native-elements';
import { LineChart } from 'react-native-chart-kit';
import io from 'socket.io-client';
import axios from 'axios';
import { BASE_URL, BASE_URLIO } from '@env';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('Product');
  const [totalSum, setTotalSum] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [showDriverRevenue, setShowDriverRevenue] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/driver/forChart`)
      .then(response => setDrivers(response.data))
      .catch(error => console.error('Erreur de récupération des chauffeurs :', error.message));
  }, []);

  useEffect(() => {
    const socketInstance = io(BASE_URLIO);
    setSocket(socketInstance);

    socketInstance.emit('getDailyRevenue');
    socketInstance.on('dailyRevenue', (data) => {
      if (data && data.dailyRevenue) {
        setDailyRevenue(data.dailyRevenue);
      }
    });

    socketInstance.emit('getTotalProducts');
    socketInstance.on('totalProducts', (data) => {
      setTotalProducts(data.totalProducts);
    });

    socketInstance.emit('getTotalClients');
    socketInstance.on('totalClients', (data) => {
      setTotalClients(data.totalClients);
    });

    socketInstance.emit('getDeliveredOrdersSummary');
    socketInstance.on('deliveredOrdersSummary', (data) => {
      setTotalSum(data.totalSum);
      setTotalCount(data.totalCount);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleDriverSelect = (driverId) => {
    setSelectedDriver(driverId);
    setDriverModalVisible(false);

    if (socket) {
      socket.emit('getDailyRevenueDriver', driverId);
      socket.on('dailyRevenueDriver', (data) => {
        if (data && data.dailyRevenue) {
          setDailyRevenue(data.dailyRevenue);
        }
      });
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    if (filter === 'Driver') {
      setShowDriverRevenue(true);
    } else {
      setShowDriverRevenue(false);
      if (socket) {
        socket.emit('getDailyRevenue');
      }
    }
  };

  const getChartData = () => {
    const labels = dailyRevenue.map((item) => item._id.slice(5)); // Extract MM-DD for labels
    const data = dailyRevenue.map((item) => item.totalRevenue);

    return {
      labels: labels.length > 0 ? labels : ['Pas de données'],
      datasets: [
        {
          data: data.length > 0 ? data : [0],
          color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`, // Violin color
          strokeWidth: 2,
        },
      ],
    };
  };

  const renderDriverDropdown = () => (
    <Modal
      transparent={true}
      visible={driverModalVisible}
      animationType="fade"
      onRequestClose={() => setDriverModalVisible(false)}
    >
      <View style={styles.driverModalContainer}>
        <View style={styles.driverModalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setDriverModalVisible(false)}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
          <ScrollView>
            {drivers.map(driver => (
              <TouchableOpacity
                key={driver.driver_id}
                style={styles.driverItem}
                onPress={() => handleDriverSelect(driver.driver_id)}
              >
                <Text style={styles.driverName}>{`${driver.firstName} ${driver.lastName}`}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.cardWrapper}>
          <Card containerStyle={[styles.card, styles.card1]}>
            <Text>Menus totaux</Text>
            <Text style={styles.statNumber}>{totalProducts}</Text>
          </Card>
          <Card containerStyle={[styles.card, styles.card2]}>
            <Text>Commandes totales</Text>
            <Text style={styles.statNumber}>{totalCount}</Text>
          </Card>
          <Card containerStyle={[styles.card, styles.card3]}>
            <Text>Clients totaux</Text>
            <Text style={styles.statNumber}>{totalClients}</Text>
          </Card>
          <Card containerStyle={[styles.card, styles.card4]}>
            <Text>Revenu total</Text>
            <Text style={styles.statNumber}>{totalSum} €</Text>
          </Card>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'Product' && styles.activeFilter]}
          onPress={() => handleFilterChange('Product')}
        >
          <Text style={styles.filterText}>Revenu Géneral</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'Driver' && styles.activeFilter]}
          onPress={() => handleFilterChange('Driver')}
        >
          <Text style={styles.filterText}>Revenu des chauffeurs</Text>
        </TouchableOpacity>
      </View>
      {showDriverRevenue && (
        <View>
          <Text style={styles.sectionHeader}>choisir un livreur :</Text>
          <TouchableOpacity
            style={styles.driverSelectButton}
            onPress={() => setDriverModalVisible(true)}
          >
            <Text style={styles.driverSelectText}>
              {selectedDriver
                ? drivers.find(driver => driver.driver_id === selectedDriver)?.firstName
                : 'Sélectionner un chauffeur'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#8A2BE2" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Revenu</Text>
        </View>
        <LineChart
          data={getChartData()}
          width={Dimensions.get('window').width - 40}
          height={250}
          chartConfig={{
            backgroundColor: '#312C63',
            backgroundGradientFrom: '#3A1C71',
            backgroundGradientTo: '#D76D77',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '2',
              strokeWidth: '5',
              stroke: 'black',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      {renderDriverDropdown()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff', // Dark background for violin theme
  },
  header: {
    padding: 20,
    backgroundColor: '#3A1C71',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
  },
  statsContainer: {
    marginBottom: 20,
  },
  cardWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '40%',
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  card1: {
    backgroundColor: '#5D3FD3',
  },
  card2: {
    backgroundColor: '#6A0DAD',
  },
  card3: {
    backgroundColor: '#8A2BE2',
  },
  card4: {
    backgroundColor: '#9370DB',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  filterButton: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: '#5D3FD3',
  },
  activeFilter: {
    backgroundColor: '#8A2BE2',
  },
  filterText: {
    color: '#FFF',
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
  },
  driverSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#5D3FD3',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  driverSelectText: {
    color: '#FFF',
    fontWeight: '600',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: '#ffff',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
  },
  driverModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  driverModalContent: {
    backgroundColor: '#312C63',
    padding: 20,
    borderRadius: 15,
    width: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    backgroundColor: '#5D3FD3',
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  driverItem: {
    padding: 10,
    borderBottomColor: '#8A2BE2',
    borderBottomWidth: 1,
  },
  driverName: {
    color: '#FFF',
  },
});

export default HomeScreen;
