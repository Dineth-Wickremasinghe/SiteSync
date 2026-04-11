import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const BASE_URL = 'http://192.168.8.102:5000'

const api = axios.create({ baseURL: `${BASE_URL}/api` })

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const getAllProjects  = ()       => api.get('/projects')
export const getProjectById = (id)     => api.get(`/projects/${id}`)
export const createProject  = (data)   => api.post('/projects', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const updateProject  = (id, data) => api.put(`/projects/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const deleteProject  = (id)    => api.delete(`/projects/${id}`)