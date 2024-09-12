import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Animated, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { BASE_URLIO } from '@env';
import WarnItem from './WarnItem';
import WarnDetailModal from './WarnDetailModal';

const socket = io(BASE_URLIO);

const WarnList = () => {
  const [warns, setWarns] = useState([]);
  const [filteredWarns, setFilteredWarns] = useState([]);
  const [selectedWarn, setSelectedWarn] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isAscending, setIsAscending] = useState(true);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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

  const handleSearch = (text) => {
    setSearchText(text);
    filterWarnings(text, startDate, endDate);
  };

  const filterWarnings = (searchText, startDate, endDate) => {
    // Ajouter un jour à la date de fin pour inclure le dernier jour complet
    const endDateInclusive = new Date(endDate);
    endDateInclusive.setDate(endDateInclusive.getDate() + 1);
     const startDateInclusive = new Date(startDate);
     startDateInclusive.setDate(startDateInclusive.getDate()-1 );
  
    const filtered = warns
      .filter(warn =>
        (warn.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
         warn.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
         warn.phone.toString().includes(searchText))
      )
      .filter(warn => {
        const warnDate = new Date(warn.created_at);
        return warnDate >= startDateInclusive && warnDate < endDateInclusive;
      });
  
    setFilteredWarns(filtered);
  };
  

  const handleSortByDate = () => {
    const sorted = [...filteredWarns].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return isAscending ? dateA - dateB : dateB - dateA;
    });
    setFilteredWarns(sorted);
    setIsAscending(!isAscending);
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const applyFilters = () => {
    filterWarnings(searchText, startDate, endDate);
    setShowFilterMenu(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{filteredWarns.length}</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone"
          value={searchText}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={handleSortByDate} style={styles.sortButton}>
          <Ionicons name="time-outline" size={24} color="#fff" />
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFilterMenu} style={styles.menuButton}>
          <Ionicons name="filter-outline" size={24} color="#fff" />
          <Text style={styles.menuButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredWarns}
        renderItem={({ item }) => (
          <WarnItem
            item={item}
            scaleAnim={scaleAnim}
            fadeAnim={fadeAnim}
            handlePressIn={() => {
              Animated.spring(scaleAnim, {
                toValue: 0.95,
                friction: 5,
                useNativeDriver: true,
              }).start();
            }}
            handlePressOut={() => {
              Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
              }).start();
            }}
            onPress={() => setSelectedWarn(item)}
          />
        )}
        keyExtractor={item => item._id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={30}
        windowSize={7}
      />

      {selectedWarn && (
        <WarnDetailModal
          warn={selectedWarn}
          onClose={() => setSelectedWarn(null)}
        />
      )}

      {showFilterMenu && (
        <View style={styles.filterMenu}>
          <Text style={styles.menuTitle}>Filter Options</Text>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>Start Date: {startDate.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>End Date: {endDate.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={applyFilters} style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || startDate;
            setShowStartDatePicker(Platform.OS === 'ios');
            setStartDate(currentDate);
          }}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || endDate;
            setShowEndDatePicker(Platform.OS === 'ios');
            setEndDate(currentDate);
          }}
        />
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
    flexWrap: 'wrap',
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
    marginHorizontal: 5,
  },
  sortButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e27a3f',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  menuButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  filterMenu: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    zIndex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: '#1f695a',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  dateButtonText: {
    color: '#fff',
  },
  filterButton: {
    backgroundColor: '#e27a3f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 10,
  },
});

export default WarnList;
