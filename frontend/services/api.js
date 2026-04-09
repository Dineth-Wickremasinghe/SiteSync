import axios from 'axios'

const api = axios.create({
<<<<<<< Updated upstream
  baseURL: 'http://192.168.1.5:5000/api'
=======
  baseURL: 'https://sitesync-backend-ebftd0g8aybxhjbk.eastasia-01.azurewebsites.net/api'
})

api.interceptors.request.use(config => {
  const token = api.defaults.headers.common['Authorization']
  if (token) config.headers['Authorization'] = token
  return config
>>>>>>> Stashed changes
})

export default api