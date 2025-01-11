import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity,ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import * as Location from 'expo-location';  // Import expo-location for location fetching
import { Formik } from 'formik';
import * as Yup from 'yup'
import { getClient } from '../services/userService'; // Add a function to get user ID

// Validation schema using Yup
const addressValidationSchema = Yup.object().shape({
  address_line: Yup.string(),
  building: Yup.string().required("Batiment est requise"),
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
        console.error('Erreur lors de la récupération de l’ID utilisateur :', error);
      }
    };

    fetchUserId();
  }, []);

  // Automatically fetch location when component mounts
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission refusée', 'Vous devez autoriser l’accès à la localisation pour continuer.');
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
        console.error('Erreur lors de la récupération de la localisation. Veuillez réessayer.');
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
        location: location ? `${location.latitude}, ${location.longitude}` : 'Localisation non récupérée', // Send location if available
      };

      // Navigate back or to another screen
      navigation.replace('PaymentScreen', { data: dataToSend });
    } catch (error) {
      console.error('Erreur lors de l’enregistrement de l’adresse :', error);
    }
    setIsSubmitting(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Avoid layout shift when keyboard is visible
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Complétez votre localisation</Text>

        <Formik
          initialValues={{
            address_line: 'adresse',
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
    <Text style={styles.label}>Bâtiment</Text>
    <TextInput
      style={[styles.input, !locationFetched && styles.disabledInput]}
      onChangeText={handleChange('building')}
      onBlur={handleBlur('building')}
      value={values.building}
      placeholder="Nom ou numéro du bâtiment"
      editable={locationFetched}
    />
      {touched.building && errors.building && (
                  <Text style={styles.error}>{errors.building}</Text>
                )}
</View>

<View style={styles.inputContainer}>
    <Text style={styles.label}>Étage</Text>
    <TextInput
      style={[styles.input, !locationFetched && styles.disabledInput]}
      onChangeText={handleChange('floor')}
      onBlur={handleBlur('floor')}
      value={values.floor}
      placeholder="Numéro de l'étage"
      editable={locationFetched}
    />
</View>

<View style={styles.inputContainer}>
    <Text style={styles.label}>Numéro de porte</Text>
    <TextInput
      style={[styles.input, !locationFetched && styles.disabledInput]}
      onChangeText={handleChange('door_number')}
      onBlur={handleBlur('door_number')}
      value={values.door_number}
      placeholder="Numéro de porte"
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
      placeholder="Entrez le digicode"
      editable={locationFetched}
    />
</View>

<View style={styles.inputContainer}>
    <Text style={styles.label}>Commentaire</Text>
    <TextInput
      style={[styles.input, !locationFetched && styles.disabledInput]}
      onChangeText={handleChange('comment')}
      onBlur={handleBlur('comment')}
      value={values.comment}
      placeholder="Instructions supplémentaires"
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
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer l’adresse'}
                </Text>
              </TouchableOpacity>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, !locationFetched && styles.disabledInput, { opacity: 0 }]}  // Invisibilité
                  onChangeText={handleChange('address_line')}
                  onBlur={handleBlur('address_line')}
                  value={values.address_line}
                  placeholder="Entrez votre adresse"
                  editable={false}  // Champs non éditables
                />
                {touched.address_line && errors.address_line && (
                  <Text style={styles.error}>{errors.address_line}</Text>
                )}
              </View>
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
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#e9ab25',
    fontWeight: '900',
    textShadowColor: '#312a1f',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '600',
    textShadowColor: '#312a1f52',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
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
