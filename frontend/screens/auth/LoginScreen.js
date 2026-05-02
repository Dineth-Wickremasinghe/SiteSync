import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native'
import api from '../../services/api'

export default function LoginScreen({ navigation, setToken, setRole }) {
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
      setRole(res.data.role)
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>

        {/* Top stripe */}
        <View style={[styles.stripeRow, { marginTop: 44 }]}>
        {Array.from({ length: 13 }).map((_, i) => (
       <View
        key={i}
      style={[styles.stripe, i % 2 === 0 ? styles.stripeYellow : styles.stripeBlack]}
    />
  ))}
</View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.iconRow}>
            <Text style={styles.heroIcon}>🏗️</Text>
          </View>
          <Text style={styles.appName}>SiteSync</Text>
          <Text style={styles.tagline}>Construction Site Management</Text>

          {/* Bottom stripe */}
          <View style={styles.stripeRow}>
            {Array.from({ length: 13 }).map((_, i) => (
              <View
                key={i}
                style={[styles.stripe, i % 2 === 0 ? styles.stripeYellow : styles.stripeBlack]}
              />
            ))}
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSubtitle}>Welcome back!</Text>

          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#1C1C1E" />
              : <Text style={styles.btnText}>Sign In</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              Don't have an account?{' '}
              <Text style={styles.registerTextBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>⚠️  Authorised personnel only</Text>

      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  hero: {
    backgroundColor: '#1C1C1E',
    paddingTop: 70,
    paddingBottom: 0,
    alignItems: 'center',
  },
  iconRow: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  heroIcon:  { fontSize: 40 },
  appName:   { fontSize: 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1, marginBottom: 4 },
  tagline:   { fontSize: 13, color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 60 },
  stripeRow: { flexDirection: 'row', width: '100%', height: 10, overflow: 'hidden' },
  stripe:       { flex: 1, height: 10, transform: [{ skewX: '-20deg' }] },
  stripeYellow: { backgroundColor: '#F59E0B' },
  stripeBlack:  { backgroundColor: '#1C1C1E' },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingTop: 32,
  },
  cardTitle:    { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#9CA3AF', marginBottom: 28 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 13,
    marginBottom: 16,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  btn: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnDisabled:      { opacity: 0.6 },
  btnText:          { color: '#1C1C1E', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  registerLink:     { alignItems: 'center' },
  registerText:     { fontSize: 14, color: '#9CA3AF' },
  registerTextBold: { color: '#F59E0B', fontWeight: '700' },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
  },
})