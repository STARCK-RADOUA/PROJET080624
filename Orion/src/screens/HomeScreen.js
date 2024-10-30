import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { Card } from 'react-native-elements';
import { LineChart } from 'react-native-chart-kit';
import io from 'socket.io-client';
import axios from 'axios';
import { BASE_URL, BASE_URLIO } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ProdScreen from './ProductScreen';
import {OrdersScreen} from './OrdersScreen';
import DeliveredOrdersScreen from './DeliveredOrdersScreen';
import CanceledOrderScreen from './CanceledOrderScreen';
import OngoingOrdersScreen from './PendingOrdersScreen';
import InProgreesgOrdersScreen from './InProgressOrderScreen';
import TestOrdersScreen from './TestOrdersScreen'; // Import the new screen
import SpamOrdersScreen from './SpamOrdersScreen'; // I
import ClientScreen from './ClientScreen';
import { RevenueScreen } from './RevenueScreen';
import DriversRevenueScreen from './DriversRevenueScreen';
import ProductsRevenueScreen from './ProductsRevenueScreen';


const HomeScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('Product');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('Daily');
  const [totalSum, setTotalSum] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [alltotalCount, setAllTotalCount] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [showDriverRevenue, setShowDriverRevenue] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const [socket, setSocket] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [showProductRevenue, setShowProductRevenue] = useState(false);
  const [spammedOrdersNumber, setSpammedOrdersNumber] = useState(0);

  const [commendesStats, setCommendesStats] = useState([]);


  useEffect(() => {
    axios.get(`${BASE_URL}/api/driver/forChart`)
      .then(response => setDrivers(response.data))
      .catch(error => console.error('Erreur de récupération des chauffeurs :', error.message));
  }, []);


  useEffect(() => {
    axios.get(`${BASE_URL}/api/products/getList`)
      .then(response => setProducts(response.data))
      .catch(error => console.error('Erreur de récupération des produis :', error.message));

  }, []);


  useEffect(() => {
    axios.get(`${BASE_URL}/api/orders/order-status-counts`)
      .then(response => setCommendesStats(response.data[0]))
      .catch(error => console.error('Erreur de récupération des produis :', error.message));

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


    socketInstance.emit('getAllOrdersSummary');
    socketInstance.on('AllOrdersSummary', (data) => {
      console.log("fegfe" , data.totalCount);
      setAllTotalCount(data.totalCount);
    });


    socketInstance.emit('getTotalSpamOrdersNumber');
    socketInstance.on('spamCountResponse', (data) => {
      console.log("zfzfzsd" , data);
      setSpammedOrdersNumber(data);
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
        console.log("dadad", data)
        if (data && data.dailyRevenue) {
          setDailyRevenue(data.dailyRevenue);
        }
      });

    }
  };


  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    setProductModalVisible(false);

    if (socket) {
      socket.emit('getDailyRevenueProduct', productId);
      socket.on('dailyRevenueProduct', (data) => {
        console.log("dadad", data)
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
      setShowProductRevenue(false); // Ensure Product revenue is hidden when 'Driver' is selected
    } else if (filter === 'ProductRevenue') {
      setShowDriverRevenue(false); // Ensure Driver revenue is hidden when 'Product' is selected
      setShowProductRevenue(true);
    } else {
      // When neither 'Driver' nor 'Product' is selected
      setShowDriverRevenue(false);
      setShowProductRevenue(false);

      if (socket) {
        socket.emit('getDailyRevenue');
      }
    }
  };


  const handleTimeFilterChange = (filter) => {
    setSelectedTimeFilter(filter);
  };

  const getChartData = () => {
    const aggregatedData = aggregateRevenueData(dailyRevenue, selectedTimeFilter);
    const labels = aggregatedData.map(item => item.label);
    const data = aggregatedData.map(item => item.totalRevenue);

    return {
      labels: labels.length > 0 ? labels : ['Pas de données'],
      datasets: [
        {
          data: data.length > 0 ? data : [0],
          color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`,
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


  const renderProductDropDown = () => (

    <Modal

      transparent={true}

      visible={productModalVisible}

      animationType="fade"

      onRequestClose={() => setProductModalVisible(false)}

    >

      <View style={styles.driverModalContainer}>

        <View style={styles.driverModalContent}>

          <TouchableOpacity style={styles.closeButton} onPress={() => setProductModalVisible(false)}>

            <Text style={styles.closeButtonText}>Fermer</Text>

          </TouchableOpacity>

          <ScrollView>

            {products.map(product => (

              <TouchableOpacity

                key={product._id}

                style={styles.driverItem}

                onPress={() => handleProductSelect(product._id)}

              >

                <Text style={styles.driverName}>{product.name}</Text>

              </TouchableOpacity>

            ))}

          </ScrollView>

        </View>

      </View>

    </Modal>


  );

  const aggregateRevenueData = (data, filter) => {
    const groupedData = {};

    data.forEach(item => {
      const date = new Date(item._id);
      let label;

      if (filter === 'Weekly') {
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      } else if (filter === 'Monthly') {
        label = `${date.getFullYear()}-${date.getMonth() + 1}`;
      } else {
        label = item._id.slice(5); // MM-DD
      }

      if (!groupedData[label]) {
        groupedData[label] = 0;
      }
      groupedData[label] += item.totalRevenue;
    });

    return Object.entries(groupedData).map(([label, totalRevenue]) => ({
      label,
      totalRevenue,
    }));
  };



  
  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord</Text>
      </View>

      <ScrollView >
        <View style={styles.statsContainer}>

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
              <Text style={styles.filterText}>Revenu des livreurs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'ProductRevenue' && styles.activeFilter]}
              onPress={() => handleFilterChange('ProductRevenue')}
            >
              <Text style={styles.filterText}>Revenu des produitss</Text>
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



          {showProductRevenue && (

            <View>

              <Text style={styles.sectionHeader}>choisir un Product :</Text>

              <TouchableOpacity

                style={styles.driverSelectButton}

                onPress={() => setProductModalVisible(true)}

              >

                <Text style={styles.driverSelectText}>

                  {selectedProduct

                    ? products.find(product => product._id === selectedProduct)?.name

                    : 'Sélectionner un produit'}

                </Text>

                <Ionicons name="chevron-down" size={20} color="#8A2BE2" />

              </TouchableOpacity>

            </View>

          )}




          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <View style={styles.filterContainerTime}>
                <TouchableOpacity
                  style={[styles.filterButtonTime, selectedTimeFilter === 'Daily' && styles.activeFilterTime]}
                  onPress={() => handleTimeFilterChange('Daily')}
                >
                  <Text style={styles.filterTextTime}>Jour</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterButtonTime, selectedTimeFilter === 'Weekly' && styles.activeFilterTime]}
                  onPress={() => handleTimeFilterChange('Weekly')}
                >
                  <Text style={styles.filterTextTime}>Hebdo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterButtonTime, selectedTimeFilter === 'Monthly' && styles.activeFilterTime]}
                  onPress={() => handleTimeFilterChange('Monthly')}
                >
                  <Text style={styles.filterTextTime}>Mens</Text>
                </TouchableOpacity>
              </View>
            </View>
            <LineChart
              data={getChartData()}
              width={Dimensions.get('window').width - 20}
              height={300}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#FFF5E4',
                backgroundGradientTo: '#FFF5E4',
                decimalPlaces: 0, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,

                },
                propsForLabels: {
                  fontSize: 9.5,
                  rotation: 60, // Rotate the labels by 90 degrees
                  anchor: 'middle', // Adjust anchor point to align better
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

          <View style={styles.cardWrapper}>

            <Card containerStyle={[styles.card, styles.card1]}   >
              <TouchableOpacity onPress={() => navigation.navigate('ProductScreen')}>
                <Text>Menus totaux</Text>
                <Text style={styles.statNumber}>{totalProducts}</Text>
              </TouchableOpacity >
            </Card>

            <Card containerStyle={[styles.card, styles.card2]}>
              <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
                <Text>Commandes totales</Text>
                <Text style={styles.statNumber}>{alltotalCount}</Text>
              </TouchableOpacity >
            </Card>

            <Card containerStyle={[styles.card, styles.card3]}>
              <TouchableOpacity onPress={() => navigation.navigate('ClientScreen')}>
                <Text>Clients totaux</Text>
                <Text style={styles.statNumber}>{totalClients}</Text>
              </TouchableOpacity >
            </Card>

            <Card containerStyle={[styles.card, styles.card4]}>
              <TouchableOpacity  onPress={() => navigation.navigate('RevenuScren')}>
                <Text>Revenu total</Text>
                <Text style={styles.statNumber}>{totalSum} €</Text>
              </TouchableOpacity >
            </Card>
          </View>
          <View style={styles.cardWrapper}>

            <Card containerStyle={[styles.card, styles.card5]}>
              <TouchableOpacity onPress={() => navigation.navigate('OngoingOrders')}>
                <Text>Comms . En attentes </Text>
                <Text style={styles.statNumber}>{commendesStats.find(item => item.pending)?.pending.count || 0}</Text>
              </TouchableOpacity >
            </Card>

            <Card containerStyle={[styles.card, styles.card6]}>
              <TouchableOpacity onPress={() => navigation.navigate('InProgressOrders')}  >
                <Text>Comms . En cours</Text>
                <Text style={styles.statNumber}>{commendesStats.find(item => item.in_progress)?.in_progress.count || 0}</Text>
              </TouchableOpacity >
            </Card>

            <Card containerStyle={[styles.card, styles.card7]}>
              <TouchableOpacity onPress={() => navigation.navigate('DeliveredOrders')}>
                <Text>Comms . Livrés</Text>
                <Text style={styles.statNumber}>{commendesStats.find(item => item.delivered)?.delivered.count || 0}</Text>
              </TouchableOpacity >
            </Card>

            <Card containerStyle={[styles.card, styles.card8]}>
              <TouchableOpacity onPress={() => navigation.navigate('UndeliveredOrders')}>
                <Text>Comms . Annulés  </Text>
                <Text style={styles.statNumber}> {commendesStats.find(item => item.cancelled)?.cancelled.count || 0}
                </Text>
              </TouchableOpacity >
            </Card>

            <Card containerStyle={[styles.card, styles.card9]}>
              <TouchableOpacity onPress={() => navigation.navigate('TestOrders')}>
                <Text>Comms . du Test  </Text>
                <Text style={styles.statNumber}>{commendesStats.find(item => item.test)?.test.count || 0}</Text>
              </TouchableOpacity >
            </Card>


            <Card containerStyle={[styles.card, styles.card10]}>
              <TouchableOpacity onPress={() => navigation.navigate('SpamOrders')}>
                <Text>Comms . signalées  </Text>
                <Text style={styles.statNumber}>{spammedOrdersNumber}</Text>
              </TouchableOpacity >
            </Card>

          </View>
        </View>

        {renderDriverDropdown()}
        {renderProductDropDown()}
      </ScrollView>
    </View>

  );
};


const Stack = createStackNavigator();

const Dashnav = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashoard">
        <Stack.Screen
          name="Dashboard"
          component={HomeScreen}
          options={{ headerShown:  false }}
        />
        <Stack.Screen
          name="ProductScreen"
          component={ProdScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OngoingOrders"
          component={OngoingOrdersScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DeliveredOrders"
          component={DeliveredOrdersScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UndeliveredOrders"
          component={CanceledOrderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="InProgressOrders"
          component={InProgreesgOrdersScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TestOrders"
          component={TestOrdersScreen} // New screen for Commandes de test
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SpamOrders"
          component={SpamOrdersScreen}
          options={{ headerShown: false }
          } />
           <Stack.Screen
          name="ClientScreen"
          component={ClientScreen}
          options={{ headerShown: false }
          } />

          <Stack.Screen
          name="RevenuScren"
          component={RevenueScreen}
          options={{ headerShown: false }
          } />

<Stack.Screen 
          name="DriverRevenue" 
          component={DriversRevenueScreen} // Use the component reference directly
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ProductRevenue" 
          component={ProductsRevenueScreen} // Use the component reference directly
          options={{ headerShown: false }} 
        />



<Stack.Screen 
          name="Orders" 
          component={OrdersScreen} // Use the component reference directly
          options={{ headerShown: false }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff', // Dark background for violin theme
  },
  header: {
    padding: 20,
    backgroundColor: '#10375C',
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
    marginBottom: 50,
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
    marginBottom: 0,
    paddingVertical: 19,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  card1: {
    backgroundColor: '#B4D6CD',
  },
  card2: {
    backgroundColor: '#76ffd6',
  },
  card3: {
    backgroundColor: '#FF8C9E',
  },
  card4: {
    backgroundColor: '#e0e5b675',
  },
  card5: {
    backgroundColor: '#f3e350',
  },
  card6: {
    backgroundColor: '#1f93f1',
  },
  card7: {
    backgroundColor: '#5fec77',
  },
  card8: {
    backgroundColor: '#f16565',
  },
  card9: {
    backgroundColor: '#b671aa',
  },
  card10: {
    backgroundColor: '#740938',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: 'black',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterContainerTime: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1.9,
    borderColor: "#F4F6FF",
    borderRadius: 10
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFAD60',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  filterButtonTime: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F4F6FF',
  },
  activeFilter: {
    backgroundColor: '#10375C',
  },
  activeFilterTime: {
    backgroundColor: '#FFF5E4',
  },
  filterText: {
    color: '#FFF',
    fontWeight: '600',
  },
  filterTextTime: {
    color: 'black',
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
    backgroundColor: '#10375C',
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
    backgroundColor: "grey",
    padding: 20,
    borderRadius: 15,
    marginVertical: "40%",
    width: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    backgroundColor: '#10375C',
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  driverItem: {
    padding: 10,
    borderBottomColor: '#10375C',
    borderBottomWidth: 1,
  },
  driverName: {
    color: '#FFF',
  },

});
export default Dashnav;
