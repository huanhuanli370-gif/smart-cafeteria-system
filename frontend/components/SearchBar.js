// frontend/components/SearchBar.js
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({
  value,
  onChangeText,
  onSubmitEditing,
  placeholder = 'Search menu...',
  style,
}) {
  return (
    <View style={[styles.wrapper, style]}>
      <Ionicons name="search-outline" size={18} color="#8e8e93" style={{ marginRight: 8 }} />
      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#8e8e93"
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {value?.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={18} color="#c7c7cc" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    paddingHorizontal: 20,
    height: 40,
  },
  input: {
    flex: 1,
    color: '#111',
    fontSize: 16,
  },
});
