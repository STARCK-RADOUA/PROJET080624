import { BASE_URL, BASE_URLIO } from '@env';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import io from 'socket.io-client';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = React.useRef(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedCollection, setSelectedCollection] = useState('');

  useEffect(() => {
    // Initialize Socket.IO connection
    socket.current = io(BASE_URLIO);

    // Listener for search results from the server
    socket.current.on('searchResults', (data) => {
      console.log('------------------------------------');
      console.log(data);
      console.log('------------------------------------');
      setResults(data);
      setLoading(false);
    });

    return () => {
      // Clean up the socket connection
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      setLoading(true);
      socket.current.emit('searchQuery', {
        query,
        collection: selectedCollection,
        startDate,
        endDate
      });
    }
  };

  const applyFilters = () => {
    setShowFilterMenu(false);
    handleSearch();
  };

  const DetailsComponent = ({ details }) => {
    return (
      <View>
        {Object.entries(details).map(([key, value]) => (
          <Text key={key} style={styles.resultText}>
            {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
          </Text>
        ))}
      </View>
    );
  };

  const renderResultItem = ({ item }) => (
    <View style={styles.resultItem}>
      <View style={styles.resultHeader}>
        <Ionicons name="folder-open" size={24} color="#007BFF" />
        <Text style={styles.resultTitle}>{item.collection}</Text>
      </View>
      <Text style={styles.resultText}>ID: {item._id}</Text>
      <DetailsComponent details={item.details} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rechercher dans la base de données</Text>
      <View style={styles.inputContainer}>

      <TextInput
        style={styles.searchInput}
        placeholder="Entrez un mot-clé ou une phrase..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
      <Ionicons name="search-outline" size={20} color="#fcfcfc" style={styles.orderIcon} />
      </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterMenu(!showFilterMenu)}>
        <Text style={styles.filterButtonText}>Filtrer les résultats</Text>
      </TouchableOpacity>
      {showFilterMenu && (
        <View style={styles.filterMenu}>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Date de début: {startDate.toDateString()}</Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || startDate;
                setShowStartDatePicker(false);
                setStartDate(currentDate);
              }}
            />
          )}
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Date de fin: {endDate.toDateString()}</Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || endDate;
                setShowEndDatePicker(false);
                setEndDate(currentDate);
              }}
            />
          )}
          <TouchableOpacity onPress={applyFilters} style={styles.applyFilterButton}>
            <Text style={styles.applyFilterButtonText}>Appliquer les filtres</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading && <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />}
      <Text style={styles.resultCounter}>Résultats : {results.length}</Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={renderResultItem}
        contentContainerStyle={styles.resultsContainer}
        ListEmptyComponent={!loading && <Text style={styles.noResultsText}>Aucun résultat trouvé</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchInput: {
    height: 50,
    width:"80%",
    borderColor: '#007BFF',
    borderWidth: 1.5,
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    fontSize: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#e9ecef',
    backgroundColor: '#71869b3e',
    borderRadius: 25,
    padding:5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  searchButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    width: 65,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    width: width * 0.5,
    alignSelf: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  resultCounter: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  resultsContainer: {
    paddingBottom: 50,
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFF',
    marginLeft: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  noResultsText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  filterMenu: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  dateButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  applyFilterButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  applyFilterButtonText: {
    color: '#fff',
    fontSize: 16,

    color: '#007BFF',
    marginLeft: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  noResultsText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});
