import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, TouchableWithoutFeedback, FlatList, Modal } from 'react-native';

const { width, height } = Dimensions.get('window');

const NotificationMenu = ({ slideAnim, toggleNotificationMenu }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Exemple de notifications pour tester l'interface
    const exampleNotifications = [
      {
        id: '1',
        title: 'Mise à jour disponible',
        message: 'Une nouvelle mise à jour de l\'application est disponible. Veuillez la télécharger dès que possible.',
        time: '2024-08-11 14:00',
      },
      {
        id: '2',
        title: 'Nouvelle fonctionnalité',
        message: 'Découvrez la nouvelle fonctionnalité "Mode sombre" dans les paramètres de votre application.',
        time: '2024-08-11 13:45',
      },
      {
        id: '3',
        title: 'Promotion spéciale',
        message: 'Profitez de 20% de réduction sur tous nos produits jusqu\'à la fin du mois.',
        time: '2024-08-11 12:30',
      },
      {
        id: '4',
        title: 'Message important',
        message: 'Votre abonnement arrive à expiration dans 3 jours. Renouvelez-le pour continuer à bénéficier de nos services.',
        time: '2024-08-11 11:15',
      },
    ];

    setNotifications(exampleNotifications);
  }, []);

  const openNotification = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity onPress={() => openNotification(item)} style={styles.notificationItem}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableOpacity style={styles.overlay} onPress={toggleNotificationMenu} activeOpacity={1}>
      <TouchableWithoutFeedback>
        <Animated.View style={[styles.notificationMenu, { transform: [{ translateX: slideAnim }] }]}>
          <Text style={styles.notificationMenuTitle}>Notifications</Text>
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            style={styles.notificationList}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      {selectedNotification && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
              <Text style={styles.modalMessage}>{selectedNotification.message}</Text>
              <Text style={styles.modalTime}>{selectedNotification.time}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  notificationMenu: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
    zIndex: 2,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  notificationMenuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  notificationList: {
    marginBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#888',
  },
});

export default NotificationMenu;
