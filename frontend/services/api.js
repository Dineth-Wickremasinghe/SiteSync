import axios from 'axios'

const api = axios.create({
  baseURL: 'http://172.19.85.84:5000/api'
})

api.interceptors.request.use(config => {
  const token = api.defaults.headers.common['Authorization']
  if (token) config.headers['Authorization'] = token
  return config
})

export default api