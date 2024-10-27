import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';

const SkeletonScreen = () => {
  const pulseAnimation = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <ScrollView style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Animated.View style={[styles.skeletonBox, { opacity: pulseAnimation, width: '60%' }]} />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterButtonContainer}>
        <TouchableOpacity style={[styles.filterButton, styles.activeFilterButton]}>
          <Animated.View style={[styles.skeletonBox, { opacity: pulseAnimation }]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Animated.View style={[styles.skeletonBox, { opacity: pulseAnimation }]} />
        </TouchableOpacity>
      </View>

      

      {/* Chart Skeleton */}
      <View style={styles.chartSection}>
        <View style={styles.chartSkeleton}>
          {[...Array(5)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.chartBar,
                { height: `${20 + i * 10}%`, opacity: pulseAnimation },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Placeholder Cards */}
      <View style={styles.cardGrid}>
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[styles.statCard, styles[`cardColor${i + 1}`]]}>
            <Animated.View style={[styles.skeletonBox, { opacity: pulseAnimation }]} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    padding: 20,
    backgroundColor: '#30475E',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  filterButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#F05454',
  },
  statisticsSection: {
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '45%',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardColor1: {
    backgroundColor: '#A1D6E2',
  },
  cardColor2: {
    backgroundColor: '#F9D276',
  },
  cardColor3: {
    backgroundColor: '#F28D9E',
  },
  cardColor4: {
    backgroundColor: '#D4E6A5',
  },
  cardColor5: {
    backgroundColor: '#C2E7E5',
  },
  cardColor6: {
    backgroundColor: '#FFE3B3',
  },
  skeletonBox: {
    width: '80%',
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
  },
  chartSection: {
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  chartSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
  },
  chartBar: {
    width: '15%',
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
});

export default SkeletonScreen;
