import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const suggestions = [
  { name: 'Pizza', icon: 'pizza-outline' },
  { name: 'Salad', icon: 'leaf-outline' },
  { name: 'Steak', icon: 'restaurant-outline' },
  { name: 'Soup', icon: 'beaker-outline' },
  { name: 'Dessert', icon: 'ice-cream-outline' },
  { name: 'Wine', icon: 'wine-outline' },
  { name: 'Juice', icon: 'water-outline' },
];

export default function SuggestedSearches({ onSelect }) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {suggestions.map((item) => (
          <TouchableOpacity key={item.name} style={styles.tag} onPress={() => onSelect(item.name)}>
            <Ionicons name={item.icon} size={16} color="#555" />
            <Text style={styles.tagText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 12,
        paddingBottom: 4,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    tagText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
});
