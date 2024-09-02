import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';

const CustomToast = ({ type, message1, message2 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation de fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }, styles[type]]}>
      {/* Logo à gauche */}
      <Image source={require('../assets/images/8498789-23.png')} style={styles.logo} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{message1}</Text>
        {message2 && <Text style={styles.message}>{message2}</Text>}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#4d4c4ce3', // Couleur neutre moderne
    shadowColor: '#000000d5',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10, // Pour Android
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  success: {
    backgroundColor: '#1db954', // Couleur style Spotify pour succès
  },
  error: {
    backgroundColor: '#e74c3c', // Couleur pour les erreurs
  },
  info: {
    backgroundColor: '#3498db', // Couleur info (bleu moderne)
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
});

export default CustomToast;
