import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';

const screenWidth = Dimensions.get('window').width;

const StatCard = ({ icon, label, value, color }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={28} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function StatisticsPage() {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchStats = React.useCallback(async () => {
    try {
      const { data } = await api.get('/api/statistics/summary');
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchStats().finally(() => setLoading(false));
    }, [fetchStats])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  const chartData = React.useMemo(() => {
    if (!stats?.daily_sales || stats.daily_sales.length === 0) {
      return { labels: [''], datasets: [{ data: [0] }] };
    }
    // CHANGED: Shortened the date format for labels to be more compact (e.g., "9/24").
    const labels = stats.daily_sales.map(d => new Date(d.sale_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }));
    const data = stats.daily_sales.map(d => Number(d.daily_revenue));
    return {
      labels,
      datasets: [{ data }],
    };
  }, [stats]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (!stats) {
    return <View style={styles.center}><Text>Could not load statistics.</Text></View>;
  }

  const chartWidth = Math.max(screenWidth, chartData.labels.length * 55); // Adjusted space per label

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.mainTitle}>Dashboard</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="cash-outline" label="Total Revenue" value={`$${Number(stats.total_revenue).toFixed(2)}`} color="#34C759" />
          <StatCard icon="receipt-outline" label="Total Orders" value={stats.total_orders} color="#007AFF" />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Revenue (Last 7 Days)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={chartData}
              width={chartWidth}
              height={220}
              yAxisLabel="$"
              chartConfig={chartConfig}
              // CHANGED: Removed rotation to make labels horizontal.
              verticalLabelRotation={0}
              style={styles.chart}
              fromZero={true}
            />
          </ScrollView>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 Best-Selling Items</Text>
          <View style={styles.listContainer}>
            {stats.top_selling_items.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemRank}>#{index + 1}</Text>
                <Text style={styles.listItemName}>{item.name}</Text>
                <Text style={styles.listItemCount}>{item.order_count} sold</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#007AFF',
  },
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f2f2f7' },
  container: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f7' },
  mainTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#111' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: 'bold', marginVertical: 4 },
  statLabel: { fontSize: 14, color: '#666' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  chart: { marginVertical: 8, borderRadius: 16 },
  listContainer: {},
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemRank: { fontSize: 16, fontWeight: 'bold', color: '#888', width: 30 },
  listItemName: { flex: 1, fontSize: 16 },
  listItemCount: { fontSize: 16, fontWeight: '500', color: '#333' },
});

