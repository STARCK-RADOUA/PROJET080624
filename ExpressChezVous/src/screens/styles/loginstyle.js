import { StyleSheet, Dimensions } from 'react-native';

// Get device dimensions
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    height: height * 0.51,  // Responsive height based on screen size
    resizeMode: 'cover',  // Cover the background while maintaining aspect ratio
  },
  container1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%',

     // Responsive padding
  },
  
  imageContainer: {
    alignItems: 'center',
    marginBottom: height * 0.02,
    // Adjusted margin for responsiveness
  },
  image: {
    width: width * 0.5,  // Set image width to 50% of screen width
    height: width * 0.5,  // Set image height proportional to width
    resizeMode: 'contain',  // Ensure the image is fully visible
  },
  container: {
    width: '85%',  // Set container width to 85% of screen width for responsiveness
    marginTop: height * 0.001,  // Adjust margin based on screen height
    alignItems: 'center',
  },
  input: {
    width: '100%',  // Full width input
    padding: 10,  // Adjust padding
    marginBottom: 15,  // Adjust margin
    backgroundColor: 'rgba(94, 85, 85, 0.11)',  // Transparent background
    borderRadius: 22,  // Rounded corners
  },
  button: {
    width: '100%',  // Full width button
    paddingVertical: 15,  // Adjust vertical padding for better touchable area
    backgroundColor: 'rgba(211, 143, 9, 0.81)',  // Button color
    borderRadius: 22,  // Rounded corners
    alignItems: 'center',
    marginBottom: 10,  // Adjust margin
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.04,  // Font size based on screen width
    fontWeight: 'bold',  // Bold text
  },
  linkText: {
    color: '#9c5707',
    fontSize: width * 0.045,  // Adjust font size based on screen width
    textDecorationLine: 'underline',
    marginLeft: '5%',  // Adjust margin for better alignment
    paddingRight: '5%',  // Adjust padding for spacing
  },
  horizontalLayout: {
    flexDirection: 'row',  // Horizontal layout
    alignItems: 'center',
    justifyContent: 'space-between',  // Ensure spacing between elements
    marginTop: 10,  // Adjust margin
    width: '100%',  // Full width layout
  },
});
