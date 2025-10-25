// frontend/screens/OrderStatusPage.js

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
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

function OrderDetailView({ order }) {
  if (!order) return null;

  const items = getItemsArray(order.items);
  const hasDiscount = Number(order.discount_amount) > 0;

  return (
    <View style={styles.detailContainer}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Order #{order.id}</Text>
        <View style={styles.badgeRow}>
          <StatusBadge status={order.status} />
          <Text style={styles.meta}> · {formatTime(order.created_at)}</Text>
        </View>
        <Text style={styles.meta}>Customer: {order.customer_name}</Text>
      </View>

      <Text style={styles.sectionTitle}>Items in this Order</Text>
      {items.length > 0 ? items.map((item, idx) => (
        <View style={styles.itemRow} key={idx}>
          <Text style={styles.itemName} numberOfLines={1}>• {item.name}</Text>
          <Text style={styles.itemPrice}>${Number(item.price || 0).toFixed(2)}</Text>
        </View>
      )) : <Text style={styles.empty}>No items in this order.</Text>}

      <View style={styles.footer}>
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
    </View>
  );
}

function HistoryItem({ item, isCurrent, onPress }) {
    return (
      <TouchableOpacity 
        style={[styles.historyCard, isCurrent && styles.historyCardCurrent]} 
        onPress={onPress}
        disabled={isCurrent}
      >
        <View style={styles.historyHeader}>
          <Text style={[styles.historyTitle, isCurrent && {color: '#fff'}]}>Order #{item.id}</Text>
          <StatusBadge status={item.status} />
        </View>
        <Text style={[styles.historyMeta, isCurrent && {color: '#eee'}]}>
          {formatTime(item.created_at)} · Total: ${Number(item.final_price).toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
}

export default function OrderStatusPage({ route, navigation }) {
  const { user } = React.useContext(AuthContext);
  const isCustomer = user?.role === 'student' || user?.role === 'faculty';
  const orderId = route?.params?.orderId ?? null;

  const [order, setOrder] = React.useState(null);
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [errMsg, setErrMsg] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    if (!isCustomer) return;
    
    try {
      setErrMsg('');
      const promises = [api.get('/api/orders/mine')];
      if (orderId) {
        promises.push(api.get(`/api/orders/${orderId}`));
      }
      
      const [historyRes, orderRes] = await Promise.all(promises);
      
      setHistory(historyRes.data?.data || []);
      if (orderRes) {
        setOrder(orderRes.data?.data || null);
      }

    } catch (e) {
      setErrMsg(e?.response?.data?.error || 'Failed to load data.');
    }
  }, [orderId, isCustomer]);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchData().finally(() => setLoading(false));
    }, [fetchData])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator /><Text style={{marginTop: 10}}>Loading Orders...</Text></View>
      </View>
    );
  }

  if (errMsg && history.length === 0) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Could not load orders</Text>
          <Text style={styles.err}>{errMsg}</Text>
          <Button title="Retry" onPress={fetchData} />
        </View>
      </View>
    );
  }

  return (
    // CHANGED: Replaced SafeAreaView with a regular View.
    <View style={styles.safeArea}>
      <FlatList
        data={history}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <HistoryItem
            item={item}
            isCurrent={item.id === orderId} 
            onPress={() => navigation.navigate('OrderDetailPage', { orderId: item.id })}
          />
        )}
        ListHeaderComponent={
          <>
            <OrderDetailView order={order} />
            <Text style={styles.mainTitle}>
              {orderId ? 'Order History' : 'My Orders'}
            </Text>
          </>
        }
        ListEmptyComponent={
          !orderId ? (
            <View style={styles.center}>
              <Text style={styles.title}>No orders yet</Text>
              <Button title="Order Now" onPress={() => navigation.navigate('OrderTab')} />
            </View>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      />
    </View>
  );
}

function StatusBadge({ status }) {
    const text = String(status || '').toLowerCase();
    const bg = text === 'completed' ? '#34C759' : text === 'preparing' ? '#FF9500' : '#FFCC00';
    const fg = '#fff';
    return <View style={[styles.badge, { backgroundColor: bg }]}><Text style={[styles.badgeText, { color: fg }]}>{text || 'unknown'}</Text></View>;
}

function formatTime(t) { try { const d = new Date(t); if (isNaN(d.getTime())) return String(t); return d.toLocaleString(); } catch { return String(t); } }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f2f2f7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  err: { color: '#ff3b30', textAlign: 'center', marginVertical: 10 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', marginVertical: 16, color: '#111' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderColor: '#eee' },
  detailContainer: { marginBottom: 16 },
  headerCard: { padding: 16, backgroundColor: '#fff', borderRadius: 12, marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  meta: { color: '#6c6c70', marginTop: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e5ea', paddingHorizontal: 16 },
  itemName: { flex: 1, fontSize: 16, color: '#1c1c1e' },
  itemPrice: { fontSize: 16, fontWeight: '500', color: '#111' },
  empty: { paddingHorizontal: 16, paddingVertical: 10, color: '#888' },
  footer: { 
    padding: 16, 
    backgroundColor: '#fff', 
    borderTopWidth: StyleSheet.hairlineWidth, 
    borderTopColor: '#e5e5ea', 
    borderBottomLeftRadius: 12, 
    borderBottomRightRadius: 12 
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
  
  historyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  historyCardCurrent: { backgroundColor: '#007AFF' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  historyMeta: { fontSize: 14, color: '#6c6c70', marginTop: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontWeight: 'bold', textTransform: 'capitalize' },
});

