import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, Linking ,ScrollView, Animated } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';

const TestOrderModal = ({ visible, onClose, order }) => {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [expandAddress, setExpandAddress] = useState(false);

  const openInMaps = (location) => {
    const wazeUrl = `https://www.google.com/maps?q=${location}`;
    Linking.openURL(wazeUrl);
  };

  if (!order) return null;

  const displayedProducts = showAllProducts ? order.products : order.products.slice(0, 3);

  
  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}  // This controls whether the modal is visible
    
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalView]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
  <Ionicons name="close-circle" size={38} color="#ff5c5c" />
</TouchableOpacity>

          <ScrollView>
            {/* Informations sur la commande */}
            <View style={styles.orderInfo}>
              <Text style={styles.label}><MaterialIcons name="receipt" size={16} color="#ffbf00" /> Commande #{order.order_number ?? 'N/A'}</Text>
              <Text style={styles.label}><Ionicons name="person" size={16} color="#ffbf00" /> Client : {order.client_name}</Text>
              <Text style={styles.label}><Ionicons name="card" size={16} color="#ffbf00" /> Paiement : {order.payment_method}</Text>
              <Text style={styles.label}><Ionicons name="cash" size={16} color="#ffbf00" /> Prix total : €{order.total_price.toFixed(2)}</Text>
              <Text style={styles.label}><Ionicons name="swap-horizontal" size={16} color="#ffbf00" /> Échange : €{order.exchange.toFixed(2)}</Text>
              <TouchableOpacity onPress={() => setExpandAddress(!expandAddress)} style={styles.expandableSection}>
                <Text style={styles.expandableLabel}><Ionicons name="location" size={16} color="#ffbf00" /> Adresse : {order.address_line}</Text>
                <Ionicons name={expandAddress ? "chevron-up" : "chevron-down"} size={20} color="#ffbf00" />
              </TouchableOpacity>

              {expandAddress && (
                <View style={styles.additionalAddressInfo}>
                  {order.building && (
                    <Text style={styles.additionalInfo}><Ionicons name="business" size={16} color="#ffbf00" /> Bâtiment : {order.building}</Text>
                  )}
                  {order.floor && (
                    <Text style={styles.additionalInfo}><Ionicons name="layers" size={16} color="#ffbf00" /> Étage : {order.floor}</Text>
                  )}
                  {order.digicode && (
                    <Text style={styles.additionalInfo}><Ionicons name="key" size={16} color="#ffbf00" /> Digicode : {order.digicode}</Text>
                  )}
                  {order.door_number && (
                    <Text style={styles.additionalInfo}><Ionicons name="home" size={16} color="#ffbf00" /> Numéro de porte : {order.door_number}</Text>
                  )}
                    {order.Adrscomment && (
                    <Text style={styles.additionalInfo}><Ionicons name="chatbubble-ellipses" size={16} color="#ffbf00" /> Commentaire : {order.Adrscomment}</Text>
                  )}
                  {order.localisation && (
                    <TouchableOpacity style={styles.wazeButton} onPress={() => openInMaps(order.localisation)}>
                      <Ionicons name="navigate-outline" size={20} color="white" />
                      <Text style={styles.wazeButtonText}>Voir la localisation dans Google Maps</Text>
                    </TouchableOpacity>)}
                </View>
              )}
              <Text style={styles.label}><Ionicons name="time" size={16} color="#ffbf00" /> Date : {moment(order.created_at).format('YYYY-MM-DD HH:mm')}</Text>
            </View>

            {/* Produits */}
            <Text style={styles.sectionHeader}>Produits :</Text>
            <View style={styles.productsContainer}>
              {displayedProducts.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => toggleExpand(index)} style={styles.productContainer}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.product?.image_url || 'https://via.placeholder.com/150' }}
                      style={styles.productImage}
                    />
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.product?.name || 'Indisponible'}</Text>
                    {expanded === index && (
                      <View>
                        <Text style={styles.productQuantity}>Qté : {item.quantity}</Text>
                        <Text style={styles.productPrice}>€{!item.isFree ? item.priceDA.toFixed(2) * item.quantity: "Gratuit     €" + item.priceDA.toFixed(2) * item.quantity}</Text>
                        <Text style={styles.productServiceType}>Type de service : {item.service_type}</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons name={expanded === index ? "chevron-up" : "chevron-down"} size={20} color="#ffbf00" />
                </TouchableOpacity>
              ))}

              {/* Bouton pour afficher plus de produits */}
              {order.products.length > 3 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllProducts(!showAllProducts)}
                >
                  <Text style={styles.showMoreText}>
                    {showAllProducts ? 'Afficher moins' : 'Afficher plus de produits...'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalView: {
    marginVertical : "20%" , 
    width: '90%',
    backgroundColor: '#1f1f1f',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  closeButton: {
    color: '#ff5c5c',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  orderInfo: {
    paddingTop: 20,
    marginBottom: 20,
  },
  expandableSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  expandableLabel: {
    fontSize: 16,
    color: '#ffbf00',
  },
  additionalAddressInfo: {
    paddingLeft: 20,
    marginVertical: 5,
  },
  additionalInfo: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#ccc',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#ffbf00',
  },
  productsContainer: {
    marginTop: 10,
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 15,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffbf00',
  },
  productQuantity: {
    fontSize: 14,
    color: '#ccc',
  },
  productPrice: {
    fontSize: 14,
    color: '#ff5c5c',
  },
  productServiceType: {
    fontSize: 14,
    color: '#ccc',
  },
  showMoreButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  showMoreText: {
    color: '#007bff',
    fontSize: 16,
  },
  wazeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34A853',
    padding: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  wazeButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default TestOrderModal;
