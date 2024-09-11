import io from 'socket.io-client';
import { BASE_URLIO } from '@env';

const socket = io(BASE_URLIO);

export const emitWatchOrderStatus = (orderId) => {
  socket.emit('watchOrderStatuss', { order_id: orderId });
};

export const listenOrderStatusUpdates = (setters, actions) => {
  socket.on('orderStatusUpdates', async (data) => {
    const { setClientId, setDriverId, setOrderStatus, setRedirectMessage, setIsChatDisabled, setShowExitButton, navigation } = setters;
    const { updateUserPoints, updateOrderItems, clearAllData } = actions;

    const status = data.order.status;
    const client_id = data.order.client_id;
    const driver_id = data.order.driver_id;

    setClientId(client_id);
    setDriverId(driver_id);
    setOrderStatus(status);

    if (status === 'delivered') {
      setIsChatDisabled(true);
      setRedirectMessage('Votre commande a été livrée. Chat pendant 2 minutes.');
      setShowExitButton(true);
      await updateUserPoints();
      await updateOrderItems();
      navigation.replace('feedback', { orderId: data.order.order_id });
      await clearAllData();
    }

    if (status === 'cancelled') {
      Alert.alert('Order cancelled', 'Order has been cancelled.');
      navigation.replace('Services');
      await clearAllData();
    }

    if (status === 'in_progress') {
      setIsChatDisabled(false);
      await updateUserPoints();
      await updateOrderItems();
    }
  });
};

export const disconnectSocket = () => {
  socket.off('orderStatusUpdates');
};
