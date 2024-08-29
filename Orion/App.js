import React, { useContext } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AuthContext, AuthProvider } from './src/redux/AuthProvider'; // Import AuthProvider and AuthContext
import LoginScreen from './src/screens/LoginScreen';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <AppContent />
      </SafeAreaView>
    </AuthProvider>
  );
}

const AppContent = () => {
  const { isLoggedIn, login } = useContext(AuthContext); // Access the login function from context

  return !isLoggedIn ? <LoginScreen onLogin={login} /> : <MainNavigator />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
