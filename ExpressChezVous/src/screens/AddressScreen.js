
// AddressScreen.js


// seeeet
import  { useContext } from 'react';
import { DataContext } from '../navigation/DataContext';


const { setSharedData } = useContext(DataContext);

setSharedData({ serviceName: serviceName, serviceTest: serviceTest, id: id });


///geeeeeeeetttt



import  { useContext } from 'react';
import { DataContext } from '../navigation/DataContext';

const { sharedData } = useContext(DataContext);
const serviceName = sharedData.serviceName;
