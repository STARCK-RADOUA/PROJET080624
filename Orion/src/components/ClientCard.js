import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const ClientCard = ({ client, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(client)}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>🛡️   {client.firstName} {client.lastName}</Text>
          <Text style={styles.cardSubtitle}>📞   +33 {client.phone}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, client.isLogin ? styles.loggedIn : styles.loggedOut]}>
            {client.isLogin ? '🔒  Connecté' : '🚪  Déconnecté'}
          </Text>
          <Text style={[styles.statusText, client.activated ? styles.activated : styles.deactivated]}>
            {client.activated ? '✅   Activé' : '❌   Désactivé'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  card: {
    width: screenWidth *0.9,
    backgroundColor: '#FFFFFF', // White background for contrast
    borderRadius: 12, // Rounded corners
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000', // Dark shadow for more contrast
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, // Soft shadow
    shadowRadius: 6,
    elevation: 5, // Android shadow
    borderWidth: 1,
    borderColor: '#E2E8F0', // Light border for subtle definition
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 3,
  },
  statusContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C5282', // Deep blue for the title
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#4A5568', // Medium grey for subtitle
    marginTop: 6, // Space between title and subtitle
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
  },
  loggedIn: {
    color: '#38A169', // Green color for "Logged In"
  },
  loggedOut: {
    color: '#E53E3E', // Red color for "Logged Out"
  },
  activated: {
    color: '#38A169', // Green color for "Activated"
  },
  deactivated: {
    color: '#E53E3E', // Red color for "Deactivated"
  },
});

export default ClientCard;
