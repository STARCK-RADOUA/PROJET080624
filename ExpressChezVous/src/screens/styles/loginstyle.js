import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    height: '55%',
    resizeMode: 'cover',
    
  },
  container1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'absolute',
    top: '0%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',  // Vous pouvez utiliser 'contain' ou 'cover' selon l'effet désiré
  },
  container: {
    marginTop: '90%',  // Ajustez la marge si nécessaire
    width: '80%',
  
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    backgroundColor: 'rgba(94, 85, 85, 0.11)',
    borderRadius: 5,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: 'rgba(211, 143, 9, 0.81)',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});
