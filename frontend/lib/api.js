// frontend/lib/api.js
import axios from 'axios';
import { API_BASE } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 或你用的 expo-secure-store 封装

const api = axios.create({ baseURL: API_BASE });

// 请求拦截：自动带上 Bearer token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // console.log('🔑 token from storage:', await AsyncStorage.getItem('token'));
  return config;
});

// 响应拦截：401 统一处理（清掉 token，交给上层跳登录）
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // 可以广播个事件，或者在 AuthContext 里设置一个“需要登录”状态
      // 这里仅把错误继续抛出，上层拿到后根据 user===null 渲染登录页
    }
    return Promise.reject(error);
  }
);

export default api;
