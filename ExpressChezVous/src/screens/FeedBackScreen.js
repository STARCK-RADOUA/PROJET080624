import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '@env'; // Import the base URL from the .env file

const FeedbackScreen = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [orderId, setOrderId] = useState(12345); // Replace this with the actual orderId

  const handleRating = (value) => {
    setRating(value);
  };

  const handleSendFeedback = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/orders/`, {
        orderId: orderId, // Sending orderId along with feedback and rating
        feedback: feedback,
        rating: rating,
      });

      // Handle response
      console.log('Feedback sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Laissez vos commentaires</Text>

      {/* Illustration */}
      <Image
        source={{
          uri: 'https://firebasestorage.googleapis.com/v0/b/deliver-90a33.appspot.com/o/undraw_Feedback_re_urmj.png?alt=media&token=840af0b1-cd25-4324-af7c-3010fb786a04',
        }}
        style={styles.image}
      />

      {/* Rating Section */}
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesome
            key={star}
            name={rating >= star ? 'star' : 'star-o'}
            size={36}
            color="#FFA500"
            onPress={() => handleRating(star)}
          />
        ))}
      </View>

      {/* Feedback Input */}
      <TextInput
        style={styles.textInput}
        multiline
        placeholder="Merci Beaucoup. J'aime bien cette application"
        value={feedback}
        onChangeText={(text) => setFeedback(text)}
      />

      {/* Submit Button */}
      <Button title="Envoyer" onPress={handleSendFeedback} color="#FFA500" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#964B00',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  textInput: {
    height: 100,
    borderColor: '#FFA500',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
});

export default FeedbackScreen;
