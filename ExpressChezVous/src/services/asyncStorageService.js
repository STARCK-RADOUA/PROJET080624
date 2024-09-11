import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveStateToStorage = async (orderId, orderStatus, orders, nezPoint) => {
  try {
    const orderData = JSON.stringify({ orderId, orderStatus, orders, nezPoint });
    await AsyncStorage.setItem('orderStatus', orderData);
    console.log('Stored order status:', orderData);
  } catch (error) {
    console.error('Error saving order status:', error);
  }
};

export const clearDataExceptOrderId = async (orderId) => {
  try {
    const orderData = JSON.stringify({ orderId });
    await AsyncStorage.setItem('orderStatus', orderData);
    console.log('Cleared data except orderId:', orderData);
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem('orderStatus');
    console.log('All order data removed.');
  } catch (error) {
    console.error('Error removing order data:', error);
  }
};

export const retrieveStateFromStorage = async () => {
  try {
    const savedOrderStatus = await AsyncStorage.getItem('orderStatus');
    return savedOrderStatus ? JSON.parse(savedOrderStatus) : null;
  } catch (error) {
    console.error('Error retrieving state:', error);
  }
};
