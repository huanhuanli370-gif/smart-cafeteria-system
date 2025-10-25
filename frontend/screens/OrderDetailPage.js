import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Button
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../lib/api';

// Helper: Safely get an array of items from order data
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

// Helper: Display a status badge
function StatusBadge({ status }) {
    const text = String(status || '').toLowerCase();
    const bg = text === 'completed' ? '#34C759' : '#FF9500'; // preparing or other
    const fg = '#fff';
    return <View style={[styles.badge, { backgroundColor: bg }]}><Text style={[styles.badgeText, { color: fg }]}>{text || 'unknown'}</Text></View>;
}

// Helper: Format time string
function formatTime(t) { 
    try { 
        const d = new Date(t); 
        if (isNaN(d.getTime())) return String(t); 
        return d.toLocaleString(); 
    } catch { return String(t); } 
}

export default function OrderDetailPage({ route, navigation }) {
  const { orderId } = route.params; // Get orderId from navigation parameters

  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState('');

  // Function to fetch the specific order details
  const fetchOrder = React.useCallback(async () => {
    try {
      setErrMsg('');
      const { data } = await api.get(`/api/orders/${orderId}`);
      setOrder(data?.data || null);
    } catch (e) {
      setErrMsg(e?.response?.data?.error || 'Failed to load order.');
      setOrder(null);
    }
  }, [orderId]);

  // Fetch data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchOrder().finally(() => setLoading(false));
    }, [fetchOrder])
  );

  // Handler for pull-to-refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchOrder();
    setRefreshing(false);
  }, [fetchOrder]);

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator size="large" /></View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Order Not Found</Text>
          <Text style={styles.errorText}>{errMsg}</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }
  
  const items = getItemsArray(order.items);
  const hasDiscount = Number(order.discount_amount) > 0;

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Order #{order.id}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge status={order.status} />
            <Text style={styles.metaText}> · {formatTime(order.created_at)}</Text>
          </View>
          <Text style={styles.metaText}>Customer: {order.customer_name}</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.itemsContainer}>
          {items.length > 0 ? items.map((item, idx) => (
            <View style={styles.itemRow} key={idx}>
              <Text style={styles.itemName} numberOfLines={1}>• {item.name}</Text>
              <Text style={styles.itemPrice}>${Number(item.price || 0).toFixed(2)}</Text>
            </View>
          )) : <Text style={styles.emptyText}>No items in this order.</Text>}
        </View>

        <View style={styles.priceSummary}>
            {hasDiscount && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>${Number(order.original_price).toFixed(2)}</Text>
              </View>
            )}

            {hasDiscount && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, styles.discountText]}>Student Discount</Text>
                <Text style={[styles.priceValue, styles.discountText]}>
                  -${Number(order.discount_amount).toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${Number(order.final_price).toFixed(2)}</Text>
            </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f2f2f7' },
  container: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  errorText: { color: 'red', marginBottom: 16 },
  
  headerCard: { padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaText: { color: '#6c6c70', marginTop: 8, fontSize: 14 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  itemsContainer: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e5ea' },
  itemName: { flex: 1, fontSize: 16, color: '#1c1c1e' },
  itemPrice: { fontSize: 16, fontWeight: '500', color: '#111' },
  emptyText: { padding: 16, color: '#888' },
  
  priceSummary: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, },
  priceLabel: { fontSize: 15, color: '#666', },
  priceValue: { fontSize: 15, color: '#333', fontWeight: '500' },
  discountText: { color: '#34C759', fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold', },
  totalValue: { fontSize: 18, fontWeight: 'bold', },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontWeight: 'bold', textTransform: 'capitalize', color: '#fff' },
});

