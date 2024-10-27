import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DriversRevenueScreen from './DriversRevenueScreen';
import ProductsRevenueScreen from './ProductsRevenueScreen';

 export const RevenueScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Section d'en-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de gestion des chiffres d'affaires</Text>
      </View>

      {/* Card for "Chiffre d'affaires de livreur" */}
      <TouchableOpacity style={[styles.card, styles.yellowCard]} onPress={() => navigation.navigate('DriverRevenue')}>
        <Ionicons name="car-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Chiffre d'affaires de livreur</Text>
          <Text style={styles.cardDescription}>Voir le chiffre d'affaires total des livreurs</Text>
        </View>
      </TouchableOpacity>

      {/* Card for "Chiffre d'affaires de produits" */}
      <TouchableOpacity style={[styles.card, styles.blueCard]} onPress={() => navigation.navigate('ProductRevenue')}>
        <Ionicons name="cube-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Chiffre d'affaires de produits</Text>
          <Text style={styles.cardDescription}>Voir le chiffre d'affaires total des produits</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Revenue">
        <Stack.Screen 
          name="Revenue" 
          component={RevenueScreen} 
          options={{ headerShown: false }} 
        />
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
    backgroundColor: '#2196F3', // Blue color for "Chiffre d'affaires de produits"
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
});

export default App;


