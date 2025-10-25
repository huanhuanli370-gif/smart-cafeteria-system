// frontend/screens/ProfileDetail.js
import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View, Text, StyleSheet, TextInput, Button, Alert,
  ActivityIndicator, ScrollView, RefreshControl,
} from 'react-native';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';

export default function ProfileDetail() {
  const { user: ctxUser, setUser: ctxSetUser } = useContext(AuthContext) || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const loadMe = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me');
      const u = res.data?.data ?? {};
      setForm({
        name: String(u.name ?? ''),
        email: String(u.email ?? ''),
        phone: String(u.phone ?? ''),
      });
    } catch (e) {
      console.warn('load /api/auth/me failed:', e?.response?.data || e.message);
      Alert.alert('Error', 'Failed to load your profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ctxUser) {
      setForm({
        name: String(ctxUser.name ?? ''),
        email: String(ctxUser.email ?? ''),
        phone: String(ctxUser.phone ?? ''),
      });
      setLoading(false);
    }
    loadMe();
  }, [ctxUser, loadMe]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMe();
    setRefreshing(false);
  };

  const onChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      return Alert.alert('Invalid input', 'Name and email are required.');
    }
    try {
      setSaving(true);
      const res = await api.put('/api/auth/me', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      const updated = res.data?.data ?? {};
      Alert.alert('Saved', 'Profile updated successfully.');
      if (typeof ctxSetUser === 'function') {
        ctxSetUser(prev => ({ ...(prev || {}), ...updated }));
      }
    } catch (e) {
      console.warn('save profile failed:', e?.response?.data || e.message);
      Alert.alert('Error', e?.response?.data?.error || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading profile…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Profile Details</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={form.name}
          onChangeText={v => onChange('name', v)}
          style={styles.input}
          placeholder="Your name"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={form.email}
          onChangeText={v => onChange('email', v)}
          style={styles.input}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={form.phone}
          onChangeText={v => onChange('phone', v)}
          style={styles.input}
          placeholder="+1 234 567 890"
          keyboardType="phone-pad"
        />
      </View>

      <View style={{ marginTop: 16 }}>
        <Button title={saving ? 'Saving…' : 'Save Changes'} onPress={save} disabled={saving} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#111' },
  field: { marginBottom: 14 },
  label: { fontSize: 14, color: '#666', marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});
