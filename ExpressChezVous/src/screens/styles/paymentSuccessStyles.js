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
    marginTop: 20,
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
    borderRadius: "30%",
    justifyContent: 'center',
  },
  deliveryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
});

export default styles;
