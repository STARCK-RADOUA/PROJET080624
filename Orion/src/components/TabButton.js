// TabButton.js
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TabButton = ({ currentTab, setCurrentTab, title, iconName }) => {
  return (
    <TouchableOpacity onPress={() => {
      if (title === "LogOut") {
        // Log out actions
      } else {
        setCurrentTab(title);
      }
    }}>
      <View style={{
        flexDirection: "row",
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: currentTab === title ? 'white' : 'transparent',
        paddingLeft: 13,
        paddingRight: 35,
        borderRadius: 8,
        marginTop: 15
      }}>
        <Ionicons
          name={iconName}
          size={25}
          color={currentTab === title ? "#5359D1" : "white"}
        />
        <Text style={{
          fontSize: 15,
          fontWeight: 'bold',
          paddingLeft: 15,
          color: currentTab === title ? "#5359D1" : "white"
        }}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default TabButton;
