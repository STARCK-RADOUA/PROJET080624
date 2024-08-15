import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
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

const AddressFormScreen = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(null); // Add state for user_id

  // Fetch user ID on component mount (you can also pass it from props if you prefer)
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await getClient(); // Assuming getUserId fetches the user ID from local storage or API
        setUserId(id);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Combine form values with user_id
      const dataToSend = {
        ...values,
        user_id: userId, // Include user_id in the request body
      };

      // Send the data to your API endpoint
      const response = await axios.post('http://192.168.1.149:4000/api/addresses', dataToSend);
      console.log('Address saved:', response.data);
      
      // Navigate back or to another screen
      navigation.goBack();
    } catch (error) {
      console.error('Error saving address:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
                style={styles.input}
                onChangeText={handleChange('address_line')}
                onBlur={handleBlur('address_line')}
                value={values.address_line}
                placeholder="Enter your address"
              />
              {touched.address_line && errors.address_line && (
                <Text style={styles.error}>{errors.address_line}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Building</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('building')}
                onBlur={handleBlur('building')}
                value={values.building}
                placeholder="Building name or number"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Floor</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('floor')}
                onBlur={handleBlur('floor')}
                value={values.floor}
                placeholder="Floor number"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Door Number</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('door_number')}
                onBlur={handleBlur('door_number')}
                value={values.door_number}
                placeholder="Door number"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Digicode</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('digicode')}
                onBlur={handleBlur('digicode')}
                value={values.digicode}
                placeholder="Enter digicode"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Comment</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleChange('comment')}
                onBlur={handleBlur('comment')}
                value={values.comment}
                placeholder="Additional instructions"
                multiline
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitButton, isSubmitting && { backgroundColor: 'gray' }]}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Save Address'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
  error: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddressFormScreen;
