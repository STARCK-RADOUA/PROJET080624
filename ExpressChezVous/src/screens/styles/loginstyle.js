import { StyleSheet, Dimensions } from 'react-native';

// Get device dimensions
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  backgroundImage: {
    height: height * 0.70,
    width: width ,
flex: 1,

    shadowColor: '#FFA726',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
 
    borderColor:"black",
     // Ensure the background image is behind the notification menu
  },
  container1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

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
    resizeMode: 'contain',
    shadowRadius: 5,
    elevation: 6,
    shadowColor: '#080808',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.9,
      // Ensure the image is fully visible
  }, 
  container: {
    width: '100%',  // Set container width to 85% of screen width for responsiveness
    height: '100%',  // Set container width to 85% of screen width for responsiveness
    position: 'absolute',
    top: height*0.49,
    paddingTop: height*0.05,
    backgroundColor:"white",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    paddingHorizontal: 35,
    elevation: 8,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
      // Adjust position based on screen height
     // Adjust margin based on screen height
  },
  input: {
    width: '100%',  // Full width input
    padding: height*0.012,  // Adjust padding
    marginBottom: 15,  // Adjust margin
    backgroundColor: '#dad6d6',  // Transparent background
    borderRadius: 22, 
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  button: {
    width: '100%',  // Full width button
    paddingVertical: 15,  // Adjust vertical padding for better touchable area
    backgroundColor: '#f3aa3d',  // Button color
    borderRadius: 22,  // Rounded corners
    alignItems: 'center',
    shadowColor: '#FFA726',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
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
    marginTop: 20,  // Adjust margin
    width: '100%',  // Full width layout
  }, errorText: {
    alignItems: 'center',
    width: '100%',  // Full width layout
    color: '#ff0000',  // Error text color
  },
});
