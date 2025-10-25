import React, { useState, useCallback, useRef, useEffect, useMemo, useContext } from 'react';
import {
  View, Text, StyleSheet, Alert, Image, TouchableOpacity, SectionList, FlatList, ActivityIndicator
} from 'react-native';
import api from '../lib/api';
import { useFocusEffect } from '@react-navigation/native';
import SearchBar from '../components/SearchBar';
import { AuthContext } from '../context/AuthContext';
import SuggestedSearches from '../components/SuggestedSearches';

// --- Reusable Components for the List ---
const RecommendationCard = ({ item, onAddToCart }) => (
  <View style={styles.recommendationCard}>
    <Image source={{ uri: item.image }} style={styles.recommendationImage} />
    <View style={styles.recommendationBody}>
      <Text style={styles.recommendationText} numberOfLines={2}>{item.name}</Text>
      <View style={styles.recommendationFooter}>
        <Text style={styles.recommendationPrice}>${Number(item.price).toFixed(2)}</Text>
        <TouchableOpacity style={styles.recommendationAddButton} onPress={() => onAddToCart(item)}>
          <Text style={styles.recommendationAddButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const MenuItem = ({ item, onAddToCart }) => (
  <View style={styles.card}>
    <Image
      source={item.image ? { uri: item.image } : undefined}
      style={styles.foodImage}
    />
    <View style={styles.cardBody}>
      <View style={styles.cardTitleRow}>
        <Text style={styles.foodText} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.foodPrice}>${Number(item.price).toFixed(2)}</Text>
      </View>
      {!!item.description && (
        <Text numberOfLines={2} style={styles.foodDesc}>{item.description}</Text>
      )}
    </View>
    <TouchableOpacity style={styles.addButton} onPress={() => onAddToCart(item)}>
      <Text style={styles.addButtonText}>＋</Text>
    </TouchableOpacity>
  </View>
);


export default function OrderPage({ navigation }) {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [reorder, setReorder] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingReorder, setLoadingReorder] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});
  const debounceTimer = useRef(null);

  const priceDetails = (() => {
    const original_price = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
    let discount_amount = 0;
    let final_price = original_price;
    const isStudent = user?.role === 'student';
    if (isStudent) {
      discount_amount = original_price * 0.20;
      final_price = original_price - discount_amount;
    }
    return { original_price, discount_amount, final_price, isStudent };
  })();

  const fetchMenus = useCallback(async (query = '') => {
    try {
      const res = await api.get(`/api/menus`, { params: { q: query || undefined } });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setMenu(list);
      const titles = Array.from(new Set(list.map(m => m.category || 'Uncategorized')));
      const init = {};
      titles.forEach(t => { init[t] = true; });
      setExpanded(prev => ({ ...init, ...prev }));
    } catch (err) {
      console.error('❌ Failed to load menus:', err?.message || err);
    }
  }, []);
  
  const fetchRecommendations = useCallback(async () => {
    if (!user) return setLoadingRecommendations(false);
    try {
      setLoadingRecommendations(true);
      const res = await api.get('/api/menus/recommendations');
      setRecommendations(res.data?.data || []);
    } catch (e) {
       if (e.response?.status !== 401) console.error("Failed to fetch recommendations:", e);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [user]);

  const fetchTrending = useCallback(async () => {
    try {
      setLoadingTrending(true);
      const res = await api.get('/api/menus/trending');
      setTrending(res.data?.data || []);
    } catch (e) {
       console.error("Failed to fetch trending:", e);
    } finally {
      setLoadingTrending(false);
    }
  }, []);

  const fetchReorder = useCallback(async () => {
    if (!user) return setLoadingReorder(false);
    try {
      setLoadingReorder(true);
      const res = await api.get('/api/menus/reorder');
      setReorder(res.data?.data || []);
    } catch (e) {
       if (e.response?.status !== 401) console.error("Failed to fetch reorder:", e);
    } finally {
      setLoadingReorder(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchMenus('');
      fetchRecommendations();
      fetchTrending();
      fetchReorder();
    }, [fetchMenus, fetchRecommendations, fetchTrending, fetchReorder])
  );

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchMenus(search.trim());
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [search, fetchMenus]);

  const sections = useMemo(() => {
    const dataSections = [];
    dataSections.push({ title: 'Recommended for You', data: [recommendations], type: 'recommendation', loading: loadingRecommendations });
    dataSections.push({ title: 'Trending Now', data: [trending], type: 'recommendation', loading: loadingTrending });
    if (user && (loadingReorder || reorder.length > 0)) {
       dataSections.push({ title: 'Order Again', data: [reorder], type: 'recommendation', loading: loadingReorder });
    }
    const grouped = new Map();
    menu.forEach(item => {
      const title = item.category || 'Uncategorized';
      if (!grouped.has(title)) grouped.set(title, []);
      grouped.get(title).push(item);
    });
    const menuSections = Array.from(grouped.entries()).map(([title, data]) => ({ title, data, type: 'menu' }));
    return [...dataSections, ...menuSections];
  }, [menu, recommendations, trending, reorder, user, loadingRecommendations, loadingTrending, loadingReorder]);


  const visibleSections = useMemo(() => {
    return sections.map(sec => ({
      ...sec,
      data: sec.type === 'recommendation' || expanded[sec.title] ? sec.data : []
    }));
  }, [sections, expanded]);

  const toggleSection = (title) => {
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const addToCart = (item) => setCart(prev => [...prev, item]);
  const removeFromCart = (index) => setCart(prev => prev.filter((_, i) => i !== index));
  const clearCart = () => setCart([]);

  const handleAddPress = (menuItem) => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to place an order.');
      return;
    }
    addToCart(menuItem);
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('🛒 Cart is empty', 'Please add some dishes before submitting.');
      return;
    }
    const payloadItems = cart.map(({ id, name, price }) => ({ id, name, price }));

    try {
      const response = await api.post(`/api/orders`, { items: payloadItems });
      const newOrder = response.data?.data;
      if (response.status === 201 && newOrder?.id) {
        Alert.alert('✅ Order Submitted', `Order #${newOrder.id} received! Your total is $${Number(newOrder.final_price).toFixed(2)}.`);
        setCart([]);
        navigation.navigate('OrderStatusPage', { orderId: newOrder.id }); 
      } else {
        Alert.alert('❌ Error', 'Unexpected response from server.');
      }
    } catch (error) {
      Alert.alert('❌ Error', error?.response?.data?.error || 'A server error occurred.');
    }
  };

  const renderItem = ({ item, section }) => {
    if (section.type === 'recommendation') {
      if (section.loading) return null;
      return (
        <FlatList
          data={item}
          keyExtractor={(rec) => String(rec.id)}
          renderItem={({ item: recItem }) => <RecommendationCard item={recItem} onAddToCart={handleAddPress} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8, paddingLeft: 16 }}
        />
      );
    }
    return <MenuItem item={item} onAddToCart={handleAddPress} />;
  };

  const renderSectionHeader = ({ section }) => {
    if (section.type === 'recommendation') {
       if (section.loading) {
          return (
              <View style={{paddingHorizontal: 16}}>
                  <Text style={styles.mainSectionTitle}>{section.title}</Text>
                  <ActivityIndicator style={{ marginVertical: 10 }} />
              </View>
          );
      }
      if (section.data[0]?.length === 0) return null;
      return <Text style={[styles.mainSectionTitle, {paddingHorizontal: 16}]}>{section.title}</Text>;
    }

    const isOpen = !!expanded[section.title];
    return (
      <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(section.title)}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionIndicator}>{isOpen ? '⌄' : '›'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.fixedHeader}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search dishes..."
            />
            <SuggestedSearches onSelect={setSearch} />
        </View>
        
        <SectionList
          sections={visibleSections}
          keyExtractor={(item, index) => Array.isArray(item) ? `rec-list-${index}` : String(item.id)}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={!loadingRecommendations && !loadingTrending ? <Text style={styles.hint}>No dishes found.</Text> : null}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={({section, leadingItem}) => {
            if (section.type === 'recommendation' || (leadingItem && Array.isArray(leadingItem))) return null;
            return <View style={styles.separator} />;
          }}
        />

        {cart.length > 0 && (
          <View style={styles.cartCard}>
            <View style={styles.cartHeaderRow}>
              <Text style={styles.cartTitle}>🛒 Your Cart</Text>
              <TouchableOpacity onPress={clearCart}>
                <Text style={styles.clearBtn}>Clear</Text>
              </TouchableOpacity>
            </View>

            {cart.map((item, idx) => (
              <View key={`${item.id}-${idx}`} style={styles.cartRow}>
                <TouchableOpacity style={{ flex: 1 }} onLongPress={() => removeFromCart(idx)} delayLongPress={200}>
                  <Text style={styles.cartItem}>• {item.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(idx)}>
                  <Text style={styles.removeBtnText}>—</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.cartFooter}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>${priceDetails.original_price.toFixed(2)}</Text>
              </View>
              {priceDetails.isStudent && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, styles.discountText]}>Student Discount (20%)</Text>
                  <Text style={[styles.priceValue, styles.discountText]}>
                    -${priceDetails.discount_amount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${priceDetails.final_price.toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={submitOrder}>
                <Text style={styles.submitButtonText}>Submit Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#FFF' },
  fixedHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#FFF',
  },
  hint: { color: '#8e8e93', marginTop: 8, textAlign: 'center' },
  mainSectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', marginTop: 16, marginBottom: 8 },
  sectionHeader: { 
      backgroundColor: '#f2f2f7', 
      paddingVertical: 10, 
      paddingHorizontal: 12, 
      borderRadius: 10, 
      marginTop: 12, 
      marginBottom: 6, 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      marginHorizontal: 16,
    },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1c1c1e' },
  sectionIndicator: { fontSize: 18, color: '#8e8e93' },
  separator: { height: 8, marginHorizontal: 16 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10,
    backgroundColor: '#fff', 
    borderRadius: 12,
    borderWidth: 1, 
    borderColor: '#f0f0f0', 
    marginHorizontal: 16,
  },
  foodImage: { 
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee' 
  },
  cardBody: { flex: 1, marginLeft: 12, marginRight: 8 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  foodText: { 
    fontSize: 15,
    fontWeight: '600', 
    color: '#111', 
    flexShrink: 1, 
    paddingRight: 8 
  },
  foodPrice: { 
    fontSize: 14,
    fontWeight: '500', 
    color: '#111' 
  },
  foodDesc: { 
    fontSize: 12,
    color: '#6c6c70', 
    marginTop: 3,
    lineHeight: 16
  },
  addButton: { 
    backgroundColor: '#007AFF', 
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  addButtonText: { 
    color: '#fff', 
    fontSize: 18,
    fontWeight: '600', 
    lineHeight: 20
  },
  recommendationCard: { width: 150, marginRight: 12, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#eee', },
  recommendationImage: { width: '100%', height: 100, },
  recommendationBody: { padding: 8, flex: 1, justifyContent: 'space-between', },
  recommendationText: { fontSize: 14, fontWeight: '600', flexShrink: 1, },
  recommendationFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, },
  recommendationPrice: { fontSize: 15, fontWeight: 'bold', },
  recommendationAddButton: { backgroundColor: '#007AFF', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', },
  recommendationAddButtonText: { color: '#fff', fontSize: 18, fontWeight: '600', },
  cartCard: { marginTop: 'auto', paddingTop: 14, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e5ea', },
  cartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cartTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  clearBtn: { color: '#ff3b30', fontSize: 15, fontWeight: '500' },
  cartRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  cartItem: { fontSize: 16, color: '#1c1c1e', flex: 1 },
  removeBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#e5e5ea', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  removeBtnText: { color: '#8e8e93', fontWeight: 'bold', fontSize: 16, lineHeight: 18 },
  cartFooter: { marginTop: 12 },
  submitButton: { backgroundColor: '#34C759', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  submitButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, },
  priceLabel: { fontSize: 15, color: '#666', },
  priceValue: { fontSize: 15, color: '#333', fontWeight: '500' },
  discountText: { color: '#34C759', fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee', },
  totalLabel: { fontSize: 18, fontWeight: 'bold', },
  totalValue: { fontSize: 18, fontWeight: 'bold', },
});
