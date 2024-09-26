import React, { useState } from 'react';
import { Alert ,View, Text, TextInput, Button, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '@env'; // Import the base URL from the .env file

const FeedbackScreen = ({ route, navigation }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false); // State to handle loading animation

  // Get orderId from route params (passed from PaymentSuccessScreen)
  const { orderId } = route.params;

  const handleRating = (value) => {
    setRating(value);
  };

  const handleSendFeedback = async () => {
    // Input validation
    if (!feedback || rating === 0) {
      Alert.alert(
        'Validation Error',
        'Please provide both feedback and a rating before submitting.',
        [{ text: 'OK' }]
      );
      return; // Stop execution if validation fails
    }
  
    setLoading(true); // Start loading (Envoyer...)
    
    try {
      const response = await axios.post(`${BASE_URL}/api/orders/update/feedback`, {
        orderId: orderId, // Send orderId along with feedback and rating
        comment: feedback,
        stars: rating,
      });
  
      console.log('Feedback sent successfully:', response.data);
  
      // Show success alert
      Alert.alert(
        'Success',
        'Thank you! Your feedback has been submitted successfully.',
        [{ text: 'OK' }]
      );
  
      // Simulate 3-second delay before navigating to HomeScreen
      setTimeout(() => {
        setLoading(false); // Stop loading after 3 seconds
        navigation.replace('Home'); // Navigate to HomeScreen
      }, 3000);
  
    } catch (error) {
      setLoading(false); // Stop loading in case of error
      console.error('Error sending feedback:', error);
  
      // Show error alert
      Alert.alert(
        'Error',
        'An error occurred while sending your feedback. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Laissez vos commentaires</Text>

        <Image
          source={{
            uri: 'https://firebasestorage.googleapis.com/v0/b/deliver-90a33.appspot.com/o/undraw_Feedback_re_urmj.png?alt=media&token=840af0b1-cd25-4324-af7c-3010fb786a04',
          }}
          style={styles.image}
        />

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

        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Merci Beaucoup. J'aime bien cette application"
          value={feedback}
          onChangeText={(text) => setFeedback(text)}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Envoyer...</Text>
            <ActivityIndicator size="small" color="#FFA500" />
          </View>
        ) : (
          <Button  title="Envoyer" onPress={handleSendFeedback}  color="#FFA500" />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e48c39c',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFA500',
    marginRight: 10,
  },
});

export default FeedbackScreen;
