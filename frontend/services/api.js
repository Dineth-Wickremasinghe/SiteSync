import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const api = axios.create({
  baseURL: 'https://sitesync-backend-ebftd0g8aybxhjbk.eastasia-01.azurewebsites.net/api'

})

api.interceptors.request.use(config => {
  const token = api.defaults.headers.common['Authorization']
  if (token) config.headers['Authorization'] = token
  return config

})

export default api
