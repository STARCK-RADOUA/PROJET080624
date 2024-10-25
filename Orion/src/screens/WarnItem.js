import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

const WarnItem = ({ item, scaleAnim, fadeAnim, handlePressIn, handlePressOut, onPress }) => (
  <Animated.View style={[styles.warnItem, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
    <TouchableOpacity
      style={styles.warnInfo}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <View style={styles.warnTextContainer}>
        <Text style={styles.warnName}> 👤 {item.firstName} {item.lastName}</Text>
        <Text style={styles.warnPhone}> 📞 +33 {item.phone}</Text>
      </View>
      <View style={styles.warnDateContainer}>
        <Text style={styles.warnTimestamp}> ⏰ {moment(item.created_at).format('DD MMM YYYY, h:mm a')}</Text>
        <Ionicons name="chevron-forward-outline" size={25} color="#156974" />
      </View>
    </TouchableOpacity>
  </Animated.View>
);
const styles = StyleSheet.create({
  warnItem: {
    width: '90%', // Largeur similaire à `card`
    backgroundColor: '#FFFFFF', // Fond blanc comme `card`
    borderRadius: 12, // Coins arrondis comme `card`
    padding: 20, // Ajustement du padding comme `card`
    marginVertical: 10, // Espacement vertical similaire
    shadowColor: '#000', // Ombre sombre comme `card`
    shadowOffset: { width: 0, height: 4 }, // Ajustement de l'ombre
    shadowOpacity: 0.1, // Douceur de l'ombre comme `card`
    shadowRadius: 6, // Rayon de l'ombre
    elevation: 5, // Ombre pour Android
    borderWidth: 1, // Bordure fine
    borderColor: '#E2E8F0', // Bordure claire pour une définition subtile
    marginHorizontal: 10, // Marges latérales
  },
  warnInfo: {
    width: '100%',
  },
  warnTextContainer: {
    flex: 1,
  },
  warnDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warnName: {
    fontSize: 20,
    fontWeight: 'bold', // Correspond à `cardTitle`
    color: '#2C5282', // Bleu profond similaire à `cardTitle`
  },
  warnPhone: {
    fontSize: 16, // Taille ajustée pour correspondre au `cardSubtitle`
    color: '#4A5568', // Gris moyen similaire au `cardSubtitle`
    marginTop: 6, // Espacement entre le titre et le sous-titre
  },
  warnTimestamp: {
    fontSize: 15,
    color: '#5c5b5b',
    marginRight: 10,
  },
});

export default WarnItem;
