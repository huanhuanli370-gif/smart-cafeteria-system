import React from 'react';
import {
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Button,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';

function getItemsArray(itemsData) {
  if (Array.isArray(itemsData)) return itemsData;
  if (typeof itemsData === 'string') {
    try {
      const parsed = JSON.parse(itemsData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

function StatusBadge({ status }) {
    const text = String(status || '').toLowerCase();
    const bg = text === 'completed' ? '#34C759' : text === 'preparing' ? '#FF9500' : '#FFCC00';
    const fg = '#fff';
    return <View style={[styles.badge, { backgroundColor: bg }]}><Text style={[styles.badgeText, { color: fg }]}>{text || 'unknown'}</Text></View>;
}
function formatTime(t) { try { const d = new Date(t); if (isNaN(d.getTime())) return String(t); return d.toLocaleString(); } catch { return String(t); } }

function HistoryItem({ item, onPress, canViewAll }) {
  const items = getItemsArray(item.items);
  const firstItemName = items[0]?.name || 'Order';
  const summary = items.length > 1 ? `${firstItemName} & ${items.length - 1} more` : firstItemName;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name="receipt-outline" size={24} color="#007AFF" />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{summary}</Text>
        {/* If viewing all orders, show the customer name */}
        {canViewAll && <Text style={styles.customerName}>By: {item.customer_name}</Text>}
        <Text style={styles.meta}>{formatTime(item.created_at)}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.price}>${Number(item.final_price).toFixed(2)}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
    </TouchableOpacity>
  );
}

export default function OrderHistoryPage({ route, navigation }) {
  const { user } = React.useContext(AuthContext);
  const scope = route?.params?.scope || 'mine';

  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Determine if the current user has rights to see all orders
  const isPrivilegedUser = user?.role === 'admin' || user?.role === 'staff';
  const canViewAll = isPrivilegedUser && scope === 'all';

  const fetchHistory = React.useCallback(async () => {
    try {
      const endpoint = canViewAll ? '/api/orders' : '/api/orders/mine';
      const title = canViewAll ? 'All Orders' : 'My Order History';
      navigation.setOptions({ title });

      const { data } = await api.get(endpoint);
      // Sort data by ID descending to show newest first
      setHistory(Array.isArray(data.data) ? data.data.sort((a, b) => b.id - a.id) : []);
    } catch (e) {
      console.error("Failed to fetch order history:", e);
      setHistory([]);
    }
  }, [user, scope, navigation, canViewAll]);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchHistory().finally(() => setLoading(false));
    }, [fetchHistory])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [fetchHistory]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  return (
    <View style={styles.safeArea}>
      <FlatList
        data={history}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <HistoryItem
            item={item}
            onPress={() => navigation.navigate('OrderDetailPage', { orderId: item.id })}
            canViewAll={canViewAll} // Pass down the permission
          />
        )}
        ListHeaderComponent={<Text style={styles.mainTitle}>{canViewAll ? 'All Customer Orders' : 'My Orders'}</Text>}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>No orders found</Text>
            {!canViewAll && <Button title="Order Now" onPress={() => navigation.navigate('OrderTab')} />}
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f2f2f7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#888' },
  mainTitle: { fontSize: 28, fontWeight: 'bold', marginVertical: 16, color: '#111' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007aff1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  customerName: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 4,
  },
  detailsContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
});

