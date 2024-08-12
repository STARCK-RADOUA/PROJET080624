import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

const UserProfileScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://example.com/path-to-your-image.jpg' }} // Replace with your image URL
          style={styles.profileImage}
        />
        <Text style={styles.phoneNumber}>+132 1234 58 32</Text>
        <TextInput style={styles.input} placeholder="" />
        <TouchableOpacity style={styles.changeNumberButton}>
          <Text style={styles.buttonText}>Change number</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center', // Center content vertically
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: '#fff',
    backgroundColor: '#ccc', // Placeholder color
    marginBottom: 20, // Space between the image and the phone number
  },
  phoneNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20, // Space between the phone number and the input
  },
  input: {
    width: '80%',
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  changeNumberButton: {
    backgroundColor: '#FFA500', // Adjust to match your design
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UserProfileScreen;
