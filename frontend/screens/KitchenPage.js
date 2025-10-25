// frontend/screens/KitchenPage.js
import React, { useCallback, useState, useContext } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Alert,
  Button,
  RefreshControl,
  TouchableOpacity, // 1. 导入 TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';

export default function KitchenPage({ navigation }) { // 2. 接收 navigation prop
  const { user } = useContext(AuthContext);
  const role = user?.role;
  const isStaffOrAdmin = role === 'staff' || role === 'admin';

  const [orderSections, setOrderSections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [busyIds, setBusyIds] = useState(new Set());

  // ... (getItemsArray, fetchOrders, onRefresh, markAsDone functions remain the same)
  const getItemsArray = (itemsData) => {
    if (Array.isArray(itemsData)) return itemsData;
    if (typeof itemsData === 'string') {
      try { return JSON.parse(itemsData); } catch { return []; }
    }
    return [];
  };

  const fetchOrders = useCallback(async () => {
    try {
      const [activeRes, completedRes] = await Promise.all([
        api.get('/api/orders?status=preparing'),
        api.get('/api/orders?status=completed'),
      ]);

      const activeOrders = activeRes.data?.data || [];
      const completedOrders = completedRes.data?.data || [];
      
      setOrderSections([
        { title: 'Incoming Orders', data: activeOrders.sort((a, b) => b.id - a.id) },
        { title: 'Recently Completed', data: completedOrders.sort((a, b) => b.id - a.id) },
      ]);

    } catch (err) {
      console.error('❌ Failed to fetch orders:', err?.response?.data || err?.message || err);
      Alert.alert('Error', 'Failed to fetch orders.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isStaffOrAdmin) return;
      fetchOrders();
    }, [isStaffOrAdmin, fetchOrders])
  );

  const onRefresh = useCallback(async () => {
    if (!isStaffOrAdmin) return;
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [isStaffOrAdmin, fetchOrders]);

  const markAsDone = async (id) => {
    if (!isStaffOrAdmin || busyIds.has(id)) return;
    setBusyIds(prev => new Set(prev).add(id));
    
    try {
      await api.put(`/api/orders/${id}/complete`);
      await fetchOrders();
    } catch (err) {
      console.error('❌ complete order error:', err?.response?.data || err?.message || err);
      Alert.alert('Error', 'Failed to complete the order.');
    } finally {
      setBusyIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };


  const renderItem = ({ item }) => {
    const items = getItemsArray(item.items);
    const isCompleted = item.status === 'completed';
    const disabled = busyIds.has(item.id);
    const hasDiscount = Number(item.discount_amount) > 0;

    return (
      // 3. 用 TouchableOpacity 包裹卡片，并添加 onPress 事件
      <TouchableOpacity 
        style={[styles.card, isCompleted && styles.cardDone]}
        onPress={() => navigation.navigate('OrderDetailPage', { orderId: item.id })}
      >
        <View style={styles.cardHeader}>
            <Text style={styles.orderTitle}>Order #{item.id}</Text>
            <Text style={styles.customerName}>By: {item.customer_name || 'N/A'}</Text>
        </View>
        <Text style={styles.subTitle}>
          {item.created_at ? `Created: ${formatTime(item.created_at)}` : 'Created: —'}
        </Text>
        <Text style={[styles.subTitle, { marginTop: 6, marginBottom: 4 }]}>Items:</Text>

        {items.map((it, idx) => (
          <Text key={`${item.id}-${idx}`} style={styles.itemText}>
            • {it.name} (${Number(it.price || 0).toFixed(2)})
          </Text>
        ))}

        <View style={styles.totalSection}>
            {hasDiscount && (
                <Text style={styles.originalPrice}>
                    Original: ${Number(item.original_price).toFixed(2)}
                </Text>
            )}
            <Text style={styles.finalPrice}>
                Total: ${Number(item.final_price).toFixed(2)}
            </Text>
        </View>

        {!isCompleted && (
          <View style={{ marginTop: 10 }}>
            <Button
              title={disabled ? 'Completing…' : 'Mark as Done'}
              onPress={() => markAsDone(item.id)}
              disabled={disabled}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  // ... (renderSectionHeader, role checks, and styles remain the same)
  const renderSectionHeader = ({ section: { title, data } }) => {
    if (data.length === 0) return null;
    return <Text style={styles.title}>{title}</Text>;
  };

  if (!isStaffOrAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Restricted</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={orderSections}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={<Text style={styles.empty}>No orders to show.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

function formatTime(t) {
  try {
    const d = new Date(t);
    if (isNaN(d.getTime())) return String(t);
    return d.toLocaleString();
  } catch {
    return String(t);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#f8f8f8' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, marginTop: 20, color: '#111' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  cardDone: { backgroundColor: '#f5f5f5', borderColor: '#dddddd', },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  orderTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  customerName: { fontSize: 14, color: '#555' },
  subTitle: { fontSize: 12, color: '#888' },
  itemText: { fontSize: 15, color: '#444', marginBottom: 3 },
  empty: { textAlign: 'center', color: '#8e8e93', marginTop: 40, fontSize: 16 },
  totalSection: {
    borderTopWidth: 1,
    borderColor: '#eee',
    marginTop: 12,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  finalPrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111',
  },
});
