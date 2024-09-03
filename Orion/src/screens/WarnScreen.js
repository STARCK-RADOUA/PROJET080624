import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Linking, Alert, Animated, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';

const socket = io(BASE_URLIO);

const WarnList = () => {
  const [warns, setWarns] = useState([]);
  const [filteredWarns, setFilteredWarns] = useState([]);
  const [selectedWarn, setSelectedWarn] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isAscending, setIsAscending] = useState(true);

  const scaleAnim = useState(new Animated.Value(1))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    socket.emit('requestAllWarns');

    socket.on('warnsData', (data) => {
      setWarns(data);
      setFilteredWarns(data);
    });

    socket.on('warnAdded', (newWarn) => {
      setWarns((prevWarns) => [...prevWarns, newWarn]);
      setFilteredWarns((prevWarns) => [...prevWarns, newWarn]);
    });

    socket.on('warnUpdated', (updatedWarn) => {
      setWarns((prevWarns) =>
        prevWarns.map((warn) => (warn._id === updatedWarn._id ? updatedWarn : warn))
      );
      setFilteredWarns((prevWarns) =>
        prevWarns.map((warn) => (warn._id === updatedWarn._id ? updatedWarn : warn))
      );
    });

    socket.on('warnDeleted', (deletedWarn) => {
      setWarns((prevWarns) => prevWarns.filter((warn) => warn._id !== deletedWarn._id));
      setFilteredWarns((prevWarns) => prevWarns.filter((warn) => warn._id !== deletedWarn._id));
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    return () => {
      socket.off('warnsData');
      socket.off('warnAdded');
      socket.off('warnUpdated');
      socket.off('warnDeleted');
    };
  }, []);

  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(err => console.error('Error opening Google Maps', err));
  };

  const openWaze = (latitude, longitude) => {
    const url = `waze://?ll=${latitude},${longitude}&navigate=yes`;
    Linking.openURL(url).catch(err => {
      Alert.alert("Can't open Waze", "Make sure Waze is installed on your device.");
    });
  };

  const showMapOptions = (location) => {
    const [longitude, latitude] = location.split(' ');
    const latitudeFloat = parseFloat(latitude);
    const longitudeFloat = parseFloat(longitude);

    if (!isNaN(latitudeFloat) && !isNaN(longitudeFloat)) {
      Alert.alert(
        'Choose Navigation App',
        'Select the app to navigate to this location',
        [
          { text: 'Google Maps', onPress: () => openGoogleMaps(latitudeFloat, longitudeFloat) },
          { text: 'Waze', onPress: () => openWaze(latitudeFloat, longitudeFloat) },
          { text: 'Cancel', style: 'cancel' }
        ],
        { cancelable: true }
      );
    } else {
      console.error('Invalid location data');
      Alert.alert('Invalid location', 'The location data is not valid.');
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = warns.filter(warn =>
      warn.firstName.toLowerCase().includes(text.toLowerCase()) ||
      warn.lastName.toLowerCase().includes(text.toLowerCase()) ||
      warn.phone.toString().includes(text)
    );
    setFilteredWarns(filtered);
  };

  const handleSortByDate = () => {
    const sorted = [...filteredWarns].sort((a, b) => {
      if (isAscending) {
        return new Date(a.created_at) - new Date(b.created_at);
      } else {
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });
    setFilteredWarns(sorted);
    setIsAscending(!isAscending);
  };

  const renderWarnItem = ({ item }) => (
    <Animated.View style={[styles.warnItem, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.warnInfo}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => setSelectedWarn(item)}
      >
        <View style={styles.warnTextContainer}>
          <Text style={styles.warnName}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.warnPhone}> +33 {item.phone}</Text>
        </View>
        <View style={styles.warnDateContainer}>
          <Text style={styles.warnTimestamp}>{moment(item.created_at).format('DD MMM YYYY, h:mm a')}</Text>
          <Ionicons name="chevron-forward-outline" size={25} color="#156974" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Total: {filteredWarns.length}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone"
          value={searchText}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={handleSortByDate} style={styles.sortButton}>
          <Ionicons name="time-outline" size={24} color="#fff" />
          <Text style={styles.sortButtonText}>Sort by Date</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredWarns}
        renderItem={renderWarnItem}
        keyExtractor={item => item._id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={30}
        windowSize={7}
      />

      {selectedWarn && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={selectedWarn !== null}
          onRequestClose={() => setSelectedWarn(null)}
        >
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedWarn.firstName} {selectedWarn.lastName}</Text>
              <Text style={styles.modalText}>Device ID: {selectedWarn.deviceId}</Text>
              <Text style={styles.modalText}>Phone: +33 {selectedWarn.phone}</Text>
              <Text style={styles.modalText}>Password: **{selectedWarn.password}**</Text>
              <Text style={styles.modalText}>Location: {selectedWarn.location}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => showMapOptions(selectedWarn.location)}
                >
                  <Ionicons name="navigate-outline" size={24} color="white" />
                  <Text style={styles.buttonText}>Navigate</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalTimestamp}>Created: {moment(selectedWarn.created_at).format('DD MMM YYYY, h:mm a')}</Text>
              <Text style={styles.modalTimestamp}>Updated: {moment(selectedWarn.updated_at).format('DD MMM YYYY, h:mm a')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedWarn(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbfbda',
    paddingTop: 10,
  },
  header: {
    padding: 10,
    backgroundColor: '#6472743e',
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#030e0f',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    height: 40,
    color: '#000',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#156974',
    padding: 10,
    borderRadius: 5,
  },
  sortButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  warnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#6472743e',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    shadowColor: '#6472743e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 3,
  },
  warnInfo: {
    width: '100%',
  },
  warnTextContainer: {
    flex: 1,
  },
  warnDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'space-between',
  },
  warnName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f695a',
  },
  warnPhone: {
    fontSize: 17,
    color: '#272711',
  },
  warnTimestamp: {
    fontSize: 15,
    color: '#5c5b5b',
    marginRight: 10, // Add some space between the date and arrow
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 10,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: "35%",
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#10515a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    color: '#10515a',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    color: '#dddddd',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10515a',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: '#101010',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalTimestamp: {
    fontSize: 16,
    color: '#aaaaaa',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    marginTop: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});

export default WarnList;
