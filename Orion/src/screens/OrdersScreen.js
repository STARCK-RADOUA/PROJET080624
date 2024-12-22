import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DeliveredOrdersScreen from './DeliveredOrdersScreen';
import CanceledOrderScreen from './CanceledOrderScreen';
import OngoingOrdersScreen from './PendingOrdersScreen';
import InProgreesgOrdersScreen from './InProgressOrderScreen';
import TestOrdersScreen from './TestOrdersScreen';
import SpamOrdersScreen from './SpamOrdersScreen';
import socketIOClient from "socket.io-client";
import { BASE_URL, BASE_URLIO } from '@env';

const socket = socketIOClient(BASE_URL);

export const OrdersScreen = ({ navigation }) => {
  // Define each seen state outside of useEffect
  const [cancelledSeen, setCancelledSeen] = useState(true);
  const [deliveredSeen, setDeliveredSeen] = useState(true);
  const [inProgressSeen, setInProgressSeen] = useState(true);
  const [pendingSeen, setPendingSeen] = useState(true);
  const [spammedSeen, setSpammedSeen] = useState(true);
  const [testSeen, setTestSeen] = useState(true);

  useEffect(() => {
    socket.emit('requestLatestOrders');

    socket.on('latestOrders', (zita) => {
      const { latestOrders } = zita;

      // Update each status only if it's not null
      if (latestOrders.cancelled && latestOrders.cancelled.seen !== null) {
        setCancelledSeen(latestOrders.cancelled.seen);
      }
      if (latestOrders.delivered && latestOrders.delivered.seen !== null) {
        setDeliveredSeen(latestOrders.delivered.seen);
      }
      if (latestOrders.in_progress && latestOrders.in_progress.seen !== null) {
        setInProgressSeen(latestOrders.in_progress.seen);
      }
      if (latestOrders.pending && latestOrders.pending.seen !== null) {
        setPendingSeen(latestOrders.pending.seen);
      }
      if (latestOrders.spammed && latestOrders.spammed.seen !== null) {
        setSpammedSeen(latestOrders.spammed.seen);
      }
      if (latestOrders.test && latestOrders.test.seen !== null) {
        setTestSeen(latestOrders.test.seen);
      }
    });

    return () => {
      socket.off('latestOrders');
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de gestion des commandes</Text>
      </View>

      <TouchableOpacity style={[styles.card, styles.yellowCard]} onPress={() => navigation.navigate('OngoingOrders')}>
        <Ionicons name="time-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Commandes en attente</Text>
          <Text style={styles.cardDescription}>Voir et gérer les commandes en attente</Text>
        </View>
        {/* Notification icon if pendingSeen is false */}
        {!pendingSeen && <Ionicons name="notifications-outline" size={35} color="white" style={styles.notificationIcon} />}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.blueCard]} onPress={() => navigation.navigate('InProgressOrders')}>
        <Ionicons name="sync-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Commandes en cours</Text>
          <Text style={styles.cardDescription}>Voir l'historique des commandes en cours</Text>
        </View>
        {/* Notification icon if inProgressSeen is false */}
        {!inProgressSeen && <Ionicons name="notifications-outline" size={35} color="white" style={styles.notificationIcon} />}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.greenCard]} onPress={() => navigation.navigate('DeliveredOrders')}>
        <Ionicons name="checkmark-done-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Commandes livrées</Text>
          <Text style={styles.cardDescription}>Voir l'historique des commandes livrées</Text>
        </View>
        {/* Notification icon if deliveredSeen is false */}
        {!deliveredSeen && <Ionicons name="notifications-outline" size={35} color="white" style={styles.notificationIcon} />}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.redCard]} onPress={() => navigation.navigate('UndeliveredOrders')}>
        <Ionicons name="alert-circle-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Commandes non livrées</Text>
          <Text style={styles.cardDescription}>Voir l'historique des commandes non livrées</Text>
        </View>
        {/* Notification icon if cancelledSeen is false */}
        {!cancelledSeen && <Ionicons name="notifications-outline" size={35} color="white" style={styles.notificationIcon} />}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.purpleCard]} onPress={() => navigation.navigate('TestOrders')}>
        <Ionicons name="flask-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Commandes de test</Text>
          <Text style={styles.cardDescription}>Voir et gérer les commandes de test</Text>
        </View>
        {/* Notification icon if testSeen is false */}
        {!testSeen && <Ionicons name="notifications-outline" size={35} color="white" style={styles.notificationIcon} />}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.darkPurpleCard]} onPress={() => navigation.navigate('SpamOrders')}>
        <Ionicons name="bug-outline" size={32} color="white" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Commandes Spam</Text>
          <Text style={styles.cardDescription}>Voir et gérer les commandes marquées comme spam</Text>
        </View>
        {/* Notification icon if spammedSeen is false */}
        {!spammedSeen && <Ionicons name="notifications-outline" size={35} color="white" style={styles.notificationIcon} />}
      </TouchableOpacity>
    </ScrollView>
  );
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Orders">
        <Stack.Screen name="Orders" component={OrdersScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OngoingOrders" component={OngoingOrdersScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DeliveredOrders" component={DeliveredOrdersScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UndeliveredOrders" component={CanceledOrderScreen} options={{ headerShown: false }} />
        <Stack.Screen name="InProgressOrders" component={InProgreesgOrdersScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TestOrders" component={TestOrdersScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SpamOrders" component={SpamOrdersScreen} options={{ headerShown: false }} />
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
    backgroundColor: '#2196F3',
  },
  greenCard: {
    backgroundColor: '#4CAF50',
  },
  redCard: {
    backgroundColor: '#F44336',
  },
  purpleCard: {
    backgroundColor: '#9C27B0',
  },
  darkPurpleCard: {
    backgroundColor: '#740938',
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
  notificationIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
});

export default App;
