import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native'
import api from '../../services/api'

export default function LoginScreen({ navigation, setToken }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Please enter email and password')
    return
  }
  try {
    setLoading(true)
    console.log('Attempting login to:', api.defaults.baseURL)
    const res = await api.post('/auth/login', { email, password })
    console.log('Login response:', res.data)
    setToken(res.data.token)
  } catch (error) {
    console.log('Full error:', error)
    console.log('Error response:', error.response)
    console.log('Error message:', error.message)
    Alert.alert('Error', error.response?.data?.message || error.message || 'Login failed')
  } finally {
    setLoading(false)
  }
}
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SiteSync</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Login</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title:      { fontSize: 32, fontWeight: 'bold', color: '#1A5276', textAlign: 'center', marginBottom: 6 },
  subtitle:   { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 32 },
  input:      { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 15 },
  btn:        { backgroundColor: '#1A5276', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 16 },
  btnText:    { color: '#fff', fontSize: 15, fontWeight: '600' },
  link:       { color: '#1A5276', textAlign: 'center', fontSize: 14 }
})