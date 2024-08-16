// Import socket.io-client
import io from 'socket.io-client';

// Connect to the server
const socket = io('http://192.168.8.119:4000');

 // Replace with your server's URL
 // Replace with your server URL

// Setup listeners
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('clientRegistered', (data) => {
    console.log('Client registered event:', data);
});

// Emit an event

