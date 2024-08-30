import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const ClientCard = ({ client, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(client)}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{client.firstName} {client.lastName}</Text>
          <Text style={styles.cardSubtitle}>{client.phone}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, client.isLogin ? styles.loggedIn : styles.loggedOut]}>
            {client.isLogin ? 'Logged In' : 'Logged Out'}
          </Text>
          <Text style={[styles.statusText, client.activated ? styles.activated : styles.deactivated]}>
            {client.activated ? 'Activated' : 'Deactivated'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  card: {
    width: screenWidth - 40,
    backgroundColor: '#FFF6EA',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  loggedIn: {
    color: 'green',
  },
  loggedOut: {
    color: 'red',
  },
  activated: {
    color: '#34C759',
  },
  deactivated: {
    color: '#FF3B30',
  },
});

export default ClientCard;
