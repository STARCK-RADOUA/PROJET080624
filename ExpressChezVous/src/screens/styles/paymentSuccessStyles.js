import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    marginTop: 3,
  },
  chatIcon: {
    width: 40,
    height: 40,
  },
  disabledChatIcon: {
    opacity: 0.3, 
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  }, successContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  deliveryImageContainer: {
    position: 'absolute',
    top: Dimensions.get('window').height * 0.55,
  },
  bottomFixed: {
    width: '100%',
    backgroundColor: '#FFA500',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 9,
  },
   bottomFixed2: {
    backgroundColor: '#ffab0e4e',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  

    borderRadius: 45,
   
    padding: 20,
    justifyContent: 'center',
  },  exitButton: {
   
    alignItems: 'center',
    backgroundColor: '#26a115a7',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 20,
    padding: 30,
    justifyContent: 'center',
  },
  deliveryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deliveryTime: {
    color: '#249715',
    fontWeight: 'bold',

    marginTop: 5,
  }, redirectMessage2: {
    color: '#179407',
    fontWeight: 'bold',
    alignContent:"flex-start",
    fontSize: 19,


  }, successText: {
    color: '#2c3b2a',
    fontWeight: 'bold',
    alignContent:"flex-start",
    fontSize: 18,


  },
    deliveryTimetext: {
    fontSize: 19,
    color: '#249715',
    fontWeight: 'bold',

    marginTop: 5,
    alignContent:"center"
  },
  circularContainer: {
    fontSize: 19,
    color: '#249715',
    fontWeight: 'bold',

  },
});

export default styles;
