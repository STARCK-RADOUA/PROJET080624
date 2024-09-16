import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DriverHeader = ({ isEnabled, toggleSwitch, isSwitchDisabled, driverInfo, handleQRCodePress }) => {
  return (
    <View style={styles.headerh}>
      <View style={styles.headerv}>
        <TouchableOpacity style={styles.qr} onPress={handleQRCodePress}>
          <Icon name="qrcode-scan" style={styles.qr1} size={45} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Driver Availability</Text>
        <Switch
          trackColor={{ false: '#7a2424', true: '#1c7745' }}
          thumbColor={isEnabled ? '#36d815' : '#ca6411'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
          disabled={isSwitchDisabled}
        />
      </View>
      <Text style={styles.statusText}>{`${driverInfo.firstName} ${driverInfo.lastName}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerh: {
    marginTop: 28,
    backgroundColor: '#8a978d',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 95,
    borderTopLeftRadius: 95,
    borderBottomRightRadius: 95,
    borderTopRightRadius: 95,
    
  },
  headerv: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  qr: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  qr1: {
    alignItems: 'center',
    justifyContent: 'start',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#A5A5A5',
    fontSize: 19,
  },
});

export default DriverHeader;
