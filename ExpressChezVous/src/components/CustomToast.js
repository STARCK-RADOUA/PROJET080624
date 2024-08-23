// src/components/CustomToast.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CustomToast = ({ type, message1, message2 }) => {
  return (
    <View style={[styles.toastContainer, styles[type]]}>
      <Text style={styles.title}>{message1}</Text>
      {message2 && <Text style={styles.message}>{message2}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  success: {
    backgroundColor: '#4caf50',
  },
  error: {
    backgroundColor: '#f44336',
  },
  info: {
    backgroundColor: '#2196f3',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
});

export default CustomToast;
