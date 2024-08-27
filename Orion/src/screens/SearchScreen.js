import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SearchScreen() {
  return (
    <View>
      <Text style={styles.title}>Seasrch Screen</Text>
      <Text style={styles.text}>Welcome to the Search Screen!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    paddingTop: 20,
    color: 'black',
  },
  text: {
    fontSize: 20,
    paddingTop: 15,
  },
});
