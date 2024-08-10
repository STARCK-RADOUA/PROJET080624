import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const MenuScreen = () => {
  const menuItems = [
    { name: 'Cheese burger', description: 'Description', price: '$0,00', image: 'https://example.com/cheeseburger.png' },
    { name: 'Doble tacos', description: 'Description', price: '$0,00', image: 'https://example.com/tacos.png' },
    { name: 'Kebab', description: 'Description', price: '$0,00', image: 'https://example.com/kebab.png' },
    { name: 'Pizza', description: 'Description', price: '$0,00', image: 'https://example.com/pizza.png' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="menu" size={24} color="black" />
        <Image source={{ uri: 'https://example.com/logo.png' }} style={styles.logo} />
        <FontAwesome name="bell" size={24} color="black" />
      </View>
      <ScrollView style={styles.menuList}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <Image source={{ uri: item.image }} style={styles.menuItemImage} />
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
              <Text style={styles.menuItemPrice}>{item.price}</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="orange" />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <FontAwesome name="home" size={24} color="orange" />
        <MaterialIcons name="receipt" size={24} color="orange" />
        <FontAwesome name="shopping-cart" size={24} color="orange" />
        <FontAwesome name="user" size={24} color="orange" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
  },
  menuList: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  menuItemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  menuItemText: {
    flex: 1,
    marginLeft: 10,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuItemDescription: {
    color: '#777',
  },
  menuItemPrice: {
    color: 'orange',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
  },
});

export default MenuScreen;
