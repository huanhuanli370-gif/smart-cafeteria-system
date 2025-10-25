import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert, Button, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import api from '../lib/api';
import { useFocusEffect } from '@react-navigation/native';
import SearchBar from '../components/SearchBar';
import MenuItemEditor from '../components/MenuItemEditor'; 

export default function MenuEditorPage() {
  const [menus, setMenus] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchMenus = useCallback(async (query = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/api/menus`, {
        params: { q: query || undefined }
      });
      const list = Array.isArray(res.data.data) ? res.data.data : [];
      setMenus(list);
    } catch (e) {
      Alert.alert('❌ Error', 'Failed to fetch menus.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMenus(search.trim());
    }, [fetchMenus, search])
  );
  
  const handleSave = async (itemToSave) => {
    try {
      const { id, ...payload } = itemToSave;
      const res = await api.put(`/api/menus/${id}`, payload);
      if (res.data?.success) {
        Alert.alert('✅ Item Saved!');
        // Optimistically update UI
        setMenus(prev => prev.map(m => m.id === id ? itemToSave : m));
      } else {
        throw new Error(res.data?.error || 'Unknown error');
      }
    } catch (e) {
      Alert.alert('❌ Save Failed', e.message);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/menus/${id}`);
            Alert.alert('✅ Item Deleted!');
            setMenus(prev => prev.filter(m => m.id !== id));
          } catch (e) {
            Alert.alert('❌ Delete Failed', e.message);
          }
        }
      }
    ]);
  };

  const handleAdd = async (newItem) => {
    try {
      const res = await api.post(`/api/menus`, newItem);
      if (res.data?.success) {
        Alert.alert('✅ Item Added!');
        setIsFormVisible(false); // Hide form on success
        fetchMenus(search.trim()); // Refetch list to include new item
      } else {
        throw new Error(res.data?.error || 'Unknown error');
      }
    } catch (e) {
      Alert.alert('❌ Add Failed', e.message);
    }
  };

  const ListHeader = (
    <>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        style={{ marginHorizontal: 16, marginBottom: 16 }}
      />
      <View style={{marginHorizontal: 16, marginBottom: 16}}>
        <Button 
          title={isFormVisible ? "Cancel" : "➕ Add New Item"} 
          onPress={() => setIsFormVisible(!isFormVisible)}
        />
      </View>
      {isFormVisible && <AddNewItemForm onAdd={handleAdd} />}
      <Text style={styles.title}>Edit Menu</Text>
    </>
  );

  return (
    <View style={styles.container}>
      {loading && menus.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large"/></View>
      ) : (
        <FlatList
          data={menus}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <MenuItemEditor 
              item={item} 
              onSave={handleSave} 
              onDelete={handleDelete} 
            />
          )}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No menu items found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f2f2f7' 
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10,
    marginHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8e8e93',
    marginTop: 20,
  }
});

function AddNewItemForm({ onAdd }) {
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '', image: '' });
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = async () => {
        const { name, price } = newItem;
        if (!name.trim() || !String(price).trim()) {
            Alert.alert('Validation Error', 'Name and price are required.');
            return;
        }
        setIsAdding(true);
        await onAdd({ ...newItem, price: parseFloat(price) || 0 });
        setIsAdding(false);
        setNewItem({ name: '', description: '', price: '', image: '' }); // Reset form
    };
    
    return (
        <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Menu Item</Text>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={newItem.name}
                onChangeText={(text) => setNewItem({ ...newItem, name: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Description"
                value={newItem.description}
                onChangeText={(text) => setNewItem({ ...newItem, description: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Price"
                keyboardType="numeric"
                value={String(newItem.price)}
                onChangeText={(text) => setNewItem({ ...newItem, price: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Image URL (optional)"
                value={newItem.image}
                onChangeText={(text) => setNewItem({ ...newItem, image: text })}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={isAdding}>
                {isAdding ? <ActivityIndicator color="#fff"/> : <Text style={styles.addButtonText}>Add Item</Text>}
            </TouchableOpacity>
        </View>
    );
}

const formStyles = StyleSheet.create({
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 24,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#f2f2f7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 5,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    }
});

// Merge styles for convenience if kept in one file
Object.assign(styles, formStyles);

