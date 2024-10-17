import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E1', // Light orange background
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
  },
  header: {
    width: '25%',
    flexDirection: 'row',
    justifyContent: 'end',
    paddingTop: 30,
    backgroundColor: '#FF9800', // Deep orange for header
    paddingVertical: 15,
    paddingHorizontal: 12,
    paddingRight :30,
   borderBottomLeftRadius: 35,
   position: 'absolute',
   right: 0,
  },
  chatIcon: {
    width: 40,
    height: 40,
    
  },
  disabledChatIcon: {
    opacity: 0.3,
    
  },
  successContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
  },
  successText: {
    color: '#2C3E50', // Dark gray text
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
  },
  deliveryImageContainer: {
    position: 'absolute',
    top: Dimensions.get('window').height * 0.6,
    
  },
  bottomFixed: {
    width: '90%',
    backgroundColor: '#FF9800', // Orange background for bottom bar
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomFixed2: {

    backgroundColor: '#FFCC80', // Light orange with some transparency
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 8,
    marginHorizontal: 20,
    shadowColor: '#FFA726',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 20,
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  exitButton: {
    width: '80%',
    backgroundColor: '#FF9800', // Strong orange for button
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deliveryText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    
marginBottom: 15, 
 },
  deliveryTimetext: {
    fontSize: 22,
    color: '#d4c6b8', // Deep orange text
    fontWeight: 'bold',
    textAlign: 'center',
  },
  circularContainer: {
    fontSize: 22,
    color: '#FF6F00',
    fontWeight: 'bold',
  },
  redirectMessage2: {
    color: '#F57C00', // Deep orange for text
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
 
  image: {
    borderRadius: 20,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,

    marginTop: Dimensions.get('window').height * 0.06,
  },
});

export default styles;
