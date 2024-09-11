import axios from 'axios';
import { BASE_URL } from '@env';
import { getClient } from './userService'


export const updateOrderItems = async (orders) => {
    try {
        // API endpoint using the base URL from .env
        const apiUrl = `${BASE_URL}/api/order-items/update-order-items`;

        // Prepare the request body
        const requestBody = {
            items: orders
        };

        // Log the payload for debugging
        console.log('Request Payload:', requestBody);

        // Make the POST request
        const response = await axios.post(apiUrl, requestBody);

        // Check response status
        if (response.status === 200) {
            console.log('Success', 'Order items updated successfully');
        } else {
            console.log('Error', 'Failed to update order items');
        }
    } catch (error) {
        // Log detailed error information
        if (error.response) {
            // The server responded with a status code other than 2xx
            console.error('Error updating order items:', error.response.data);
            console.error('Status code:', error.response.status);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
    }
};


export const updateUserPoints = async (points) => {
    try {
      const userId = await getClient();
        const apiUrl = `${BASE_URL}/api/users/update-points`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,        // Pass the user ID
                newPoints: points   // Pass the new points value
            }),
        });

        const result = await response.json();

        if (response.status === 200) {
            console.log('Success', `Points updated: ${result.user.points}`);
        } else {
            console.log('Error', result.message || 'Failed to update points');
        }
    } catch (error) {
        console.log('Error', 'Failed to update points');
        console.error(error);
    }
};
