import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DeliveredOrdersScreen from './DeliveredOrdersScreen';
import CanceledOrderScreen from './CanceledOrderScreen';

// Dummy components for the screens
const OngoingOrdersScreen = () => (
  <View style={styles.screenContainer}>
    <Text>Ongoing Orders Screen</Text>
  </View>
);


const UndeliveredOrdersScreen = () => (
  <View style={styles.screenContainer}>
    <Text>Undelivered Orders Screen</Text>
  </View>
);

const OrdersScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Order Management Dashboard</Text>
      </View>

      {/* Navigation Buttons */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OngoingOrders')}>
        <Ionicons name="time-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Ongoing Orders</Text>
          <Text style={styles.cardDescription}>View and manage ongoing orders</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DeliveredOrders')}>
        <Ionicons name="checkmark-done-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Delivered Orders</Text>
          <Text style={styles.cardDescription}>View delivered orders history</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('UndeliveredOrders')}>
        <Ionicons name="alert-circle-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Undelivered Orders</Text>
          <Text style={styles.cardDescription}>View undelivered orders history</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName="Orders">
      <Stack.Screen 
        name="Orders" 
        component={OrdersScreen} 
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
    </Stack.Navigator>
  </NavigationContainer>
  
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left', // Align the title to the left
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    width: Dimensions.get('window').width - 40, // Adjusting card width to fit screen size
  },
  cardIcon: {
    marginRight: 20,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'left', // Align card titles to the left
  },
  cardDescription: {
    fontSize: 14,
    color: 'white',
    textAlign: 'left', // Align card descriptions to the left
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
