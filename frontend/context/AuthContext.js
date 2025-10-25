import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client'; // NEW: Import socket.io client
import * as Notifications from 'expo-notifications'; // NEW: Import Expo Notifications
import Constants from 'expo-constants'; // NEW: To get project ID for notifications

import api, { API_BASE_URL } from '../lib/api'; // Assuming API_BASE_URL is exported from api.js

// NEW: Configure what happens when a notification is received while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// NEW: Helper function to trigger a local notification
async function schedulePushNotification(orderId) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Order Update! 🍳",
      body: `The kitchen has started preparing your order #${orderId}!`,
    },
    trigger: null, // deliver immediately
  });
}

// NEW: Helper function to request notification permissions
async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  
  // This is for remote push notifications, not strictly needed for local ones,
  // but it's good practice to have the permission flow.
  // You might need your Expo project ID here.
  return Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig.extra.eas.projectId,
  });
}


export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null });
  const socketRef = useRef(null); // NEW: Use a ref to hold the socket instance

  // NEW: Effect to manage the WebSocket connection lifecycle
  useEffect(() => {
    // Request notification permissions once when the app loads
    registerForPushNotificationsAsync();

    if (state.user && !socketRef.current) {
      // User is logged in, but we don't have a socket connection yet. Let's connect.
      console.log('🔌 Connecting to WebSocket server...');
      const socket = io(API_BASE_URL, {
        // You might need authentication here in a real app, e.g., passing the token
        // auth: { token: await AsyncStorage.getItem('token') }
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ WebSocket connected, ID:', socket.id);
      });

      // Listen for our custom event from the backend
      socket.on('order_read', (data) => {
        console.log('Received order_read event:', data);
        // Check if the notification is for the currently logged-in user
        if (data?.customerId === state.user.id) {
          console.log(`👍 Notification for me! Order: ${data.orderId}`);
          // Trigger the local notification
          schedulePushNotification(data.orderId);
        }
      });

      socket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected.');
      });

    } else if (!state.user && socketRef.current) {
      // User is logged out, but we still have a connection. Let's disconnect.
      console.log('🔌 Disconnecting from WebSocket server...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Cleanup function: ensures we disconnect when the provider unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [state.user]); // This effect runs whenever the user's login state changes

  const load = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return setState({ loading: false, user: null });
    try {
      const res = await api.get('/api/auth/me');
      setState({ loading: false, user: res.data?.data || null });
    } catch {
      await AsyncStorage.removeItem('token');
      setState({ loading: false, user: null });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token, user } = res.data?.data || {};
    if (!token) throw new Error('No token in response');
    await AsyncStorage.setItem('token', token);
    setState({ loading: false, user });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    // The useEffect will handle disconnecting the socket when state.user becomes null
    setState({ loading: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, reload: load }}>
      {children}
    </AuthContext.Provider>
  );
}