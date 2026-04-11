import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const api = axios.create({
  baseURL: 'http://192.168.8.102:5000/api'
})

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (err) {
    console.warn('Could not read token from storage:', err)
  }
  return config
})

// Global error logging (optional but useful during development)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export default api
