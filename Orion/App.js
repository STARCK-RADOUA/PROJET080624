// App.js
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LoginScreen from './src/screens/LoginScreen'; // Importer l'écran de connexion
import MainNavigator from './src/navigation/MainNavigator'; // Importer la navigation principale

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Gérer l'état de la connexion

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <MainNavigator />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
