import { StyleSheet, Dimensions } from 'react-native';

const { width , height} = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 20,
        backgroundColor: '#d8d8d8',
        height: height*0.97,

      },
      container2: {
       
        height: height*0.75,
        backgroundColor: '#8a8a170',
        borderRadius: 30,
        marginTop:10,
marginBottom:10,    
      },
      headerv: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 5,
        elevation: 5,
        flexDirection: 'row',


        
      },  headerv11: {
       
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 5,
        elevation: 5,
        flexDirection: 'row',           // Maintient l'alignement horizontal
        justifyContent: 'flex-end',   // Aligne les éléments à gauche
        alignItems: 'center',   
     


        
      },  
      footer: {
        alignItems: 'center',
        backgroundColor: '#f5a5a557',

        justifyContent: 'space-between',
        paddingVertical: 3,

        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        flexDirection: 'row',
        shadowColor: '#0a2e0b',
        shadowOpacity: 2,
        shadowRadius: 5,
        elevation: 5,
        backgroundColor: '#223d02',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius:55,
        borderBottomRightRadius:55,
      },
      navigateButtonGoogle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ee8c0b',
        padding: 8,
        borderRadius: 28,
        marginVertical: 5,
        flex: 1,
        justifyContent: 'center',
      },
      navigateButtonWaze: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1ca5a5',
        padding: 8,
        borderRadius: 28,
        marginVertical: 5,
        flex: 1,
        justifyContent: 'center',
      },
      navigateButtonChat: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0b5017',
        padding: 8,
        borderRadius: 80,
        justifyContent: 'center',
      },      navigateButtonSupportChat: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ee1a1a7d',
        padding: 15,
        borderRadius: 80,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 5,
        elevation: 5,
        marginLeft: 20,
        width: "60%",

      },      navigateButtonStop: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1ca1d676',
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 5,
        elevation: 5,
        marginRight: 20,
        padding: 15,
        borderRadius: 80,
        justifyContent: 'center',
      },
      navigateText: {
        color: '#fff',
        marginLeft: 10,
        fontWeight: 'bold',
      },   distance: {
        color: '#3b6603',
        marginLeft: 10,
        fontWeight: 'bold',
      },
      fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
        flexWrap: 'wrap',
      },
      label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6e2a2a', 
        marginBottom: 5,
      },
      textValue: {
        fontSize: 16,
        color: '#fff', 
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
      },
       qr: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
      },
       qr1: {
        alignItems: 'center',
        justifyContent: 'start',
      },
      headerh: {
        marginTop: height*0.014,
                shadowColor: '#4A7A4C',

        elevation:30,
        backgroundColor: '#223d02',
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 55,
        borderTopRightRadius: 55,
        borderBottomLeftRadius:5,
        borderBottomRightRadius:5,
      },
      headerText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
      },
      statusText: {
        color: '#A5A5A5',
        fontSize: 19,
      }, statusText1: {
        color: '#aa9d25',
        fontSize: 19,
      },   statusText3: {
        color: '#ac5e16',
        fontSize: 19,
      },
      cardLivred: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e7e7e7',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f07c8234',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      orderIcon: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        marginRight: 15,
      },
      cardContent: {
        flex: 1,
        justifyContent: 'space-between',
      },
      orderNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#021214', // Vert sombre pour une bonne lisibilité
        marginBottom: 5,
      },
      addressLine: {
        fontSize: 16,
        color: '#4b4b4b', // Gris foncé
      },
      fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        flexWrap: 'wrap',
      },
      navigateButtonGoogle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0ae33', // Vert foncé harmonieux
        padding: 10,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 5,
      },  navigateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0ae33', // Vert foncé harmonieux
        padding: 10,
        borderRadius: 8,
        justifyContent: 'center',
      },
      navigateButtonWaze: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2e7a7d', // Vert légèrement plus sombre pour contraste
        padding: 10,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 5,
      },
      navigateText: {
        color: '#fff',
        marginLeft: 8,
        fontWeight: 'bold',
      },
      rightContainer: {
        alignItems: 'flex-end',
      },
      date: {
        fontSize: 14,
        color: '#6d6d6d', // Gris modéré
      },

      disabledView: {
        backgroundColor: '#ffffff',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 5,
        elevation: 5,
        borderBottomLeftRadius:40,
        borderBottomRightRadius:40,
      },
      disabledText: {
        color: '#A5A5A5',
        fontSize: 18,
      },
      skeletonCard: {
        height: 100,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 15,
        padding: 10,
      },
      skeletonTitle: {
        width: '50%',
        height: 20,
        backgroundColor: '#d4d4d4',
        borderRadius: 4,
        marginBottom: 10,
      },
      shimmerContainer: {
        height: 100,
        borderRadius: 8,
        backgroundColor: '#802e2e',
        marginBottom: 10,
      },
      shimmer: {
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#b83e3e',
      },
      skeletonDescription: {
        width: '80%',
        height: 15,
        backgroundColor: '#d4d4d4',
        borderRadius: 4,
      },
      navigateButtonChat: {
        backgroundColor: '#77ddff',
borderRadius : 30 ,
padding : 10 ,
    flexDirection: 'row',
    alignItems: 'center',
  },

  redButton: {
    width: 10,  // size of the red dot
    height: 10,
    borderRadius: 5,
    backgroundColor: '#c43333',
  },
  navigateText: {
    color: 'white',
    marginLeft: 10,
  }
});

export default styles;
