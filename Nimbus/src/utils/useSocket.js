import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BASE_URLIO } from '@env';

const useSocket = (driverId, deviceId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (driverId) {
      const socket = io(BASE_URLIO, {
        query: {
          deviceId: deviceId,
        },
      });

      socket.on('orderInprogressUpdatedForDriver', (data) => {
        setOrders(data.orders || []);
        setLoading(false);
      });

      socket.on('error', (err) => {
        console.error('Socket error:', err.message);
        setLoading(false);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [driverId, deviceId]);

  return { orders, loading };
};

export default useSocket;
