import { BASE_URL, BASE_URLIO } from '@env';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity,ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import * as Location from 'expo-location';  // Import expo-location for location fetching
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { getClient } from '../services/userService'; // Add a function to get user ID

// Validation schema using Yup
const addressValidationSchema = Yup.object().shape({
  address_line: Yup.string().required('Address Line is required'),
  building: Yup.string(),
  floor: Yup.string(),
  door_number: Yup.string(),
  digicode: Yup.string(),
  comment: Yup.string(),
});

const AddressFormScreen = ({ navigation, route }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationFetched, setLocationFetched] = useState(false); // Track if location is fetched
  const [userId, setUserId] = useState(null); // Add state for user_id
  const [location, setLocation] = useState(null); // Store user's location

  // Fetch user ID on component mount (you can also pass it from props if you prefer)
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await getClient(); // Assuming getClient fetches the user ID from local storage or API
        setUserId(id);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  // Automatically fetch location when component mounts
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission Denied', 'You need to allow location access to continue.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log('Current Location:', location);

      if (location) {
        console.log('------------------------------------');
        console.log('Current Location:', location);
        console.log('------------------------------------');
        setLocation(location.coords); // Store the coordinates
        setLocationFetched(true); // Enable form fields once location is fetched
      } else {
        console.error('Error fetching location. Please try again.');
      }
    };

    // Fetch the location once the component mounts
    fetchCurrentLocation();
  }, []);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Combine form values with user_id and location (if fetched)
      const dataToSend = {
        ...values,
        user_id: userId,
        newOrder: route.params, // Include user_id in the request body
        location: location ? `${location.latitude}, ${location.longitude}` : 'Location not fetched', // Send location if available
      };

      // Navigate back or to another screen
      navigation.replace('PaymentScreen', { data: dataToSend });
    } catch (error) {
      console.error('Error saving address:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Avoid layout shift when keyboard is visible
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Add New Address</Text>

        <Formik
          initialValues={{
            address_line: '',
            building: '',
            floor: '',
            door_number: '',
            digicode: '',
            comment: '',
          }}
          validationSchema={addressValidationSchema}
          onSubmit={handleFormSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Address Line *</Text>
                <TextInput
                  style={[styles.input, !locationFetched && styles.disabledInput]}  // Disable input if location is not fetched
                  onChangeText={handleChange('address_line')}
                  onBlur={handleBlur('address_line')}
                  value={values.address_line}
                  placeholder="Enter your address"
                  editable={locationFetched}  // Disable editing if location is not fetched
                />
                {touched.address_line && errors.address_line && (
                  <Text style={styles.error}>{errors.address_line}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Building</Text>
                <TextInput
                  style={[styles.input, !locationFetched && styles.disabledInput]}
                  onChangeText={handleChange('building')}
                  onBlur={handleBlur('building')}
                  value={values.building}
                  placeholder="Building name or number"
                  editable={locationFetched}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Floor</Text>
                <TextInput
                  style={[styles.input, !locationFetched && styles.disabledInput]}
                  onChangeText={handleChange('floor')}
                  onBlur={handleBlur('floor')}
                  value={values.floor}
                  placeholder="Floor number"
                  editable={locationFetched}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Door Number</Text>
                <TextInput
                  style={[styles.input, !locationFetched && styles.disabledInput]}
                  onChangeText={handleChange('door_number')}
                  onBlur={handleBlur('door_number')}
                  value={values.door_number}
                  placeholder="Door number"
                  editable={locationFetched}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Digicode</Text>
                <TextInput
                  style={[styles.input, !locationFetched && styles.disabledInput]}
                  onChangeText={handleChange('digicode')}
                  onBlur={handleBlur('digicode')}
                  value={values.digicode}
                  placeholder="Enter digicode"
                  editable={locationFetched}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Comment</Text>
                <TextInput
                  style={[styles.input, !locationFetched && styles.disabledInput]}
                  onChangeText={handleChange('comment')}
                  onBlur={handleBlur('comment')}
                  value={values.comment}
                  placeholder="Additional instructions"
                  multiline
                  editable={locationFetched}
                />
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submitButton, (!locationFetched || isSubmitting) && styles.disabledButton]}
                disabled={!locationFetched || isSubmitting}  // Disable button if location is not fetched
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Submitting...' : 'Save Address'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 30,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#e9ab25',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#e9ab25',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddressFormScreen;
