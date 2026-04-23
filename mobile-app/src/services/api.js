import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';


const LAN_IP = '172.20.10.2';
const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:8000/api' 
  : `http://${LAN_IP}:8000/api`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, 
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;