import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DeliveredOrdersScreen from './DeliveredOrdersScreen';
import CanceledOrderScreen from './CanceledOrderScreen';
import OngoingOrdersScreen from './PendingOrdersScreen';
import InProgreesgOrdersScreen from './InProgressOrderScreen';
import TestOrdersScreen from './TestOrdersScreen'; // Import the new screen
import SpamOrdersScreen from './SpamOrdersScreen'; // Import the SpamOrdersScreen

export const OrdersScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Section d'en-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de gestion des commandes</Text>
      </View>

      {/* Boutons de navigation */}
      <TouchableOpacity style={[styles.card, styles.yellowCard]} onPress={() => navigation.navigate('OngoingOrders')}>
        <Ionicons name="time-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Commandes en attente</Text>
          <Text style={styles.cardDescription}>Voir et gérer les commandes en attente</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.blueCard]} onPress={() => navigation.navigate('InProgressOrders')}>
        <Ionicons name="sync-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Commandes en cours</Text>
          <Text style={styles.cardDescription}>Voir l'historique des commandes en cours</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.greenCard]} onPress={() => navigation.navigate('DeliveredOrders')}>
        <Ionicons name="checkmark-done-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Commandes livrées</Text>
          <Text style={styles.cardDescription}>Voir l'historique des commandes livrées</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.redCard]} onPress={() => navigation.navigate('UndeliveredOrders')}>
        <Ionicons name="alert-circle-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Commandes non livrées</Text>
          <Text style={styles.cardDescription}>Voir l'historique des commandes non livrées</Text>
        </View>
      </TouchableOpacity>

      {/* New section for Commandes de test */}
      <TouchableOpacity style={[styles.card, styles.purpleCard]} onPress={() => navigation.navigate('TestOrders')}>
        <Ionicons name="flask-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Commandes de test</Text>
          <Text style={styles.cardDescription}>Voir et gérer les commandes de test</Text>
        </View>
      </TouchableOpacity>


      

      {/* Spam Orders Card */}

      <TouchableOpacity style={[styles.card, styles.darkPurpleCard]} onPress={() => navigation.navigate('SpamOrders')}>

        <Ionicons name="bug-outline" size={32} color="white" style={styles.cardIcon} />

        <View style={styles.cardTextContainer}>

          <Text style={styles.cardTitle}>Commandes Spam</Text>

          <Text style={styles.cardDescription}>Voir et gérer les commandes marquées comme spam</Text>

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
              <Stack.Screen name="SpamOrders" component={SpamOrdersScreen} options={{ headerShown: false }}/>

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
  darkPurpleCard: {

    backgroundColor: '#740938', // Darker purple for Spam Orders

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    width: Dimensions.get('window').width - 40,
  },
  yellowCard: {
    backgroundColor: '#FFC107',
  },
  blueCard: {
    backgroundColor: '#2196F3', // Blue color for "En cours" orders
  },
  greenCard: {
    backgroundColor: '#4CAF50',
  },
  redCard: {
    backgroundColor: '#F44336',
  },
  purpleCard: {
    backgroundColor: '#9C27B0', // Purple color for "Commandes de test"
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
    textAlign: 'left',
  },
  cardDescription: {
    fontSize: 14,
    color: 'white',
    textAlign: 'left',
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
