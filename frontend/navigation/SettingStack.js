import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SettingPage from '../screens/SettingPage';
import ProfileDetail from '../screens/ProfileDetail';
import MenuEditorPage from '../screens/MenuEditorPage';
import OrderHistoryPage from '../screens/OrderHistoryPage';
import OrderDetailPage from '../screens/OrderDetailPage';
import StatisticsPage from '../screens/StatisticsPage'; 

const Stack = createNativeStackNavigator();

export default function SettingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingHome" component={SettingPage} options={{ title: "Settings" }} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetail} options={{ title: "Profile Detail" }} />
      <Stack.Screen name="MenuEditorPage" component={MenuEditorPage} options={{ title: "Menu Management" }} />
      <Stack.Screen name="OrderHistoryPage" component={OrderHistoryPage} options={{ title: 'Order History' }} />
      <Stack.Screen name="OrderDetailPage" component={OrderDetailPage} options={{ title: 'Order Details' }} />
      <Stack.Screen name="StatisticsPage" component={StatisticsPage} options={{ title: 'Statistics Dashboard' }} />
    </Stack.Navigator>
  );
}
