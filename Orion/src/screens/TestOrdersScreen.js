import React, { useState, useEffect } from 'react';
import { BASE_URLIO } from '@env';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { io } from 'socket.io-client';
import moment from 'moment';
import TestOrderModal from '../components/TestOrderModal';

const TestOrdersScreen = () => {
  const [commandes, setCommandes] = useState([]);
  const [commandesFiltrees, setCommandesFiltrees] = useState([]);
  const [dateFiltre, setDateFiltre] = useState(new Date());
  const [afficherDatePicker, setAfficherDatePicker] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [commandeSelectionnee, setCommandeSelectionnee] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const socket = io(BASE_URLIO);
         
    socket.emit('getTestOrders');
    socket.on('testOrderUpdated', (data) => {
      setCommandes(data.orders);
      setCommandesFiltrees(data.orders); // Afficher toutes les commandes par défaut
      setChargement(false); // Arrêter le chargement une fois les données récupérées
    });

    socket.on('error', (err) => {
      console.error('Erreur de socket:', err.message);
      setChargement(false); // Arrêter le chargement en cas d'erreur
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filtrerCommandesParDate = (dateSelectionnee) => {
    const filtrees = commandes.filter(commande =>
      moment(commande.delivery_time).isSame(dateSelectionnee, 'day')
    );
    setCommandesFiltrees(filtrees);
  };

  const filtrerCommandesParRecherche = (query) => {
    setRecherche(query);
    const filtrees = commandes.filter(commande => {
      const nomClient = commande.client_name ? commande.client_name.toLowerCase() : '';
      const nomChauffeur = commande.driver_name ? commande.driver_name.toLowerCase() : '';
      const nomsProduits = commande.products
        .map(p => p.product?.name ? p.product.name.toLowerCase() : '')
        .join(' ');
      const texteRecherche = query.toLowerCase();
      return (
        nomClient.includes(texteRecherche) ||
        nomChauffeur.includes(texteRecherche) ||
        nomsProduits.includes(texteRecherche)
      );
    });
    setCommandesFiltrees(filtrees);
  };

  const afficherTout = () => {
    setCommandesFiltrees(commandes); // Afficher toutes les commandes lorsque "Afficher tout" est pressé
  };

  const appuyerCarteCommande = (commande) => {
    setCommandeSelectionnee(commande); // Afficher la commande sélectionnée dans le modal
  };

  const fermerModal = () => {
    setCommandeSelectionnee(null); // Fermer le modal
  };

  const rendreSkeleton = () => (
    <>
      {[...Array(3)].map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonDescription} />
        </View>
      ))}
    </>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Commandes de Test</Text>

      {/* Champ de recherche */}
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher par client, chauffeur, ou nom de produit..."
        value={recherche}
        onChangeText={filtrerCommandesParRecherche}
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setAfficherDatePicker(true)} style={styles.datePicker}>
          <Ionicons name="calendar-outline" size={24} color="white" />
          <Text style={styles.filterText}>{moment(dateFiltre).format('YYYY-MM-DD')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.showAllButton} onPress={afficherTout}>
          <Text style={styles.showAllText}>Afficher tout</Text>
        </TouchableOpacity>
      </View>

      {afficherDatePicker && (
        <DateTimePicker
          value={dateFiltre}
          mode="date"
          display="default"
          onChange={(event, dateSelectionnee) => {
            setAfficherDatePicker(false);
            if (dateSelectionnee) {
              setDateFiltre(dateSelectionnee);
              filtrerCommandesParDate(dateSelectionnee); // Filtrer les commandes selon la date sélectionnée
            }
          }}
        />
      )}

      <FlatList
        data={chargement ? Array.from({ length: 3 }) : commandesFiltrees.sort((a, b) => moment(b.delivery_time) - moment(a.delivery_time))} // Trier les commandes par heure de livraison
        keyExtractor={(item, index) => item?._id || index.toString()}
        renderItem={({ item }) => (
          chargement ? (
            rendreSkeleton()
          ) : (
            <TouchableOpacity onPress={() => appuyerCarteCommande(item)}>
              <View style={styles.card}>
                <Ionicons name="checkmark-circle-outline" size={50} color="#9C27B0" style={styles.orderIcon} />
                <View style={styles.cardContent}>
                  <Text style={styles.orderNumber}>Commande #{item.order_number ?? 'N/A'}</Text>
                  <Text style={styles.location}>{item.address_line}</Text>
                  <View style={styles.rightContainer}>
                    <Text style={styles.price}>€{item.total_price.toFixed(2)}</Text>
                    <Text style={styles.date}>{moment(item.delivery_time).format('YYYY-MM-DD HH:mm')}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )
        )}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Total en Euros: €
          {commandesFiltrees.reduce((total, commande) => total + commande.total_price, 0).toFixed(2)}
        </Text>
      </View>

      {commandeSelectionnee && (
        <TestOrderModal
          visible={!!commandeSelectionnee}
          onClose={fermerModal}
          order={commandeSelectionnee}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#9C27B0',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f3e5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#9C27B0',
    borderRadius: 10,
    padding: 10,
  },
  filterText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#ffffff',
  },
  showAllButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#7B1FA2',
    borderRadius: 8,
    marginLeft: 10,
  },
  showAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e5f5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  orderIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  totalContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#9C27B0',
    borderRadius: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  skeletonCard: {
    backgroundColor: '#E1BEE7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: '#D1C4E9',
    marginBottom: 10,
    borderRadius: 5,
  },
  skeletonDescription: {
    height: 15,
    backgroundColor: '#B39DDB',
    borderRadius: 5,
  },
});

export default TestOrdersScreen;
