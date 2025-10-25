import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// A single, editable menu item component
export default function MenuItemEditor({ item, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedItem, setEditedItem] = useState(item);

  // When the original item prop changes (e.g., after a save), reset the local state
  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(editedItem);
    setIsSaving(false);
    setIsEditing(false); // Collapse after saving
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(item.id);
    // No need to set isDeleting to false, as the component will be unmounted
  };

  const handleChange = (field, value) => {
    setEditedItem(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing) {
    // --- EDITING VIEW ---
    return (
      <View style={[styles.card, styles.cardEditing]}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={editedItem.name}
          onChangeText={(text) => handleChange('name', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={editedItem.description || ''}
          onChangeText={(text) => handleChange('description', text)}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          keyboardType="numeric"
          value={String(editedItem.price)}
          onChangeText={(text) => handleChange('price', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Image URL"
          value={editedItem.image || ''}
          onChangeText={(text) => handleChange('image', text)}
        />
        <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsEditing(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
            </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- READ-ONLY VIEW ---
  return (
    <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.thumbnail} />
        <View style={styles.infoContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
        </View>
        <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.actionButton}>
                <Ionicons name="pencil-outline" size={22} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionButton} disabled={isDeleting}>
                {isDeleting ? <ActivityIndicator/> : <Ionicons name="trash-outline" size={22} color="#ff3b30" />}
            </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  cardEditing: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#f2f2f7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#34C759',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#8e8e93',
    marginRight: 8,
  },
});
