import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const NotificationModal = ({ visible, notification, onClose }) => {
  if (!notification) return null;

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{notification.title}</Text>
          <Text style={styles.modalMessage}>{notification.message}</Text>
          <Text style={styles.modalTime}>{new Date(notification.created_at).toLocaleString()}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#2d2d2d',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00ffcc',
  },
  modalMessage: {
    fontSize: 16,
    color: '#dddddd',
  },
  modalTime: {
    fontSize: 12,
    color: '#888',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 30,
    color: '#fff',
  },
});

export default NotificationModal;
