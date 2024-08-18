import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    height: '65%',
    resizeMode: 'cover',
  },
  container1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  container: {
    width: '80%',
    marginTop: '35%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    backgroundColor: 'rgba(94, 85, 85, 0.11)',
    borderRadius: 22,  // Rounded corners with radius 22
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: 'rgba(211, 143, 9, 0.81)',
    borderRadius: 22,  // Rounded corners with radius 22
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  linkText: {
    color: '#9c5707',
    fontSize: 18,
    textDecorationLine: 'underline',
    marginLeft: '20%',  // Ajoute un espace entre le QR code et le texte
    paddingRight: '5%',  // Ajoute un espace entre le QR code et le texte
  },
  horizontalLayout: {
    flexDirection: 'row',  // Change the layout to horizontal
    alignItems: 'center',
    shadowColor: '#000',
    marginTop: 5,
  },
});
