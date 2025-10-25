import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function SettingPage({ navigation }) {
  const { logout, user } = useContext(AuthContext);
  const role = user?.role;
  const isStaff = role === 'staff' || role === 'admin';

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => logout() }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.profileRow}
          onPress={() => navigation.navigate("ProfileDetail")}
        >
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "Example User"}</Text>
            <Text style={styles.profileEmail}>{user?.email || "example@example.com"}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        {isStaff && (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("MenuEditorPage")}
          >
            <Ionicons name="fast-food-outline" size={22} color="#ff9500" style={styles.icon} />
            <Text style={styles.text}>Menu Management</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" style={styles.chevron} />
          </TouchableOpacity>
        )}

        {/* Checks for isStaff (which includes admins) */}
        {isStaff && (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("StatisticsPage")}
          >
            <Ionicons name="bar-chart-outline" size={22} color="#5856d6" style={styles.icon} />
            <Text style={styles.text}>Statistics</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" style={styles.chevron} />
          </TouchableOpacity>
        )}
        
        {/* sends 'all' scope for both staff and admin */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate("OrderHistoryPage", { scope: isStaff ? 'all' : 'mine' })}
        >
          <Ionicons name="receipt-outline" size={22} color="#34c759" style={styles.icon} />
          <Text style={styles.text}>Order History</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="notifications-outline" size={22} color="#007aff" style={styles.icon} />
          <Text style={styles.text}>Notifications</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="information-circle-outline" size={22} color="#34c759" style={styles.icon} />
          <Text style={styles.text}>About</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ff3b30" style={styles.icon} />
          <Text style={[styles.text, { color: "#ff3b30", fontWeight: "600" }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  section: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginHorizontal: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 15,
    backgroundColor: "#ddd",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
  },
  profileEmail: {
    fontSize: 14,
    color: "#888",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    flex: 1,
  },
  chevron: {
    marginLeft: "auto",
  },
});