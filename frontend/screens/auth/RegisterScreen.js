import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native'
import api from '../../services/api'

export default function RegisterScreen({ navigation }) {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    try {
      setLoading(true)
      await api.post('/auth/register', { name, email, password, role: 'worker' })
      Alert.alert('Success', 'Account created! Please login.')
      navigation.navigate('Login')
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.iconRow}>
            <Text style={styles.heroIcon}>👷</Text>
          </View>
          <Text style={styles.appName}>SiteSync</Text>
          <Text style={styles.tagline}>Join your construction team</Text>

          {/* Warning stripe */}
          <View style={styles.stripeRow}>
            {Array.from({ length: 12 }).map((_, i) => (
              <View
                key={i}
                style={[styles.stripe, i % 2 === 0 ? styles.stripeYellow : styles.stripeBlack]}
              />
            ))}
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardSubtitle}>Register to access your site dashboard</Text>

          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="Kamal Perera"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />

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
            placeholder="Create a password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#1C1C1E" />
              : <Text style={styles.btnText}>  Create Account</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginTextBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>⚠️  Authorised personnel only</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },

  // Hero
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
  tagline:   { fontSize: 13, color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 24 },

  // Warning stripe
  stripeRow: {
    flexDirection: 'row',
    width: '100%',
    height: 10,
    overflow: 'hidden',
  },
  stripe:       { flex: 1, height: 10, transform: [{ skewX: '-20deg' }] },
  stripeYellow: { backgroundColor: '#F59E0B' },
  stripeBlack:  { backgroundColor: '#1C1C1E' },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingTop: 32,
    paddingBottom: 48,
  },
  cardTitle:    { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#9CA3AF', marginBottom: 28 },

  // Form
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

  // Role badge
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
  },
  roleBadgeIcon: { fontSize: 18 },
  roleBadgeText: { fontSize: 13, color: '#92400E', flex: 1 },
  roleBadgeBold: { fontWeight: '700', color: '#78350F' },

  // Button
  btn: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: '#1C1C1E', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  // Login link
  loginLink: { alignItems: 'center' },
  loginText: { fontSize: 14, color: '#9CA3AF' },
  loginTextBold: { color: '#F59E0B', fontWeight: '700' },

  // Footer
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#4B5563',
    paddingVertical: 16,
    backgroundColor: '#1C1C1E',
  },
})