import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../services/api'

export default function ProfileScreen({ token, setToken }) {
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [fetching, setFetching]       = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile')
      setName(res.data.name)
      setEmail(res.data.email)
      setProfileImage(res.data.profileImage || null)
    } catch (err) {
      Alert.alert('Error', 'Failed to load profile')
    } finally {
      setFetching(false)
    }
  }

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow access to your photo library.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (!result.canceled) setProfileImage(result.assets[0].uri)
  }

  const handleUpdate = async () => {
  setLoading(true)
  try {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email)

    if (profileImage && profileImage.startsWith('file')) {
      formData.append('profileImage', {
        uri:  profileImage,
        name: 'profile.jpg',
        type: 'image/jpeg',
      })
    }

    // Include passwords only if the user filled them in
    if (currentPassword && newPassword) {
      formData.append('currentPassword', currentPassword)
      formData.append('newPassword', newPassword)
    }

    await api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    setCurrentPassword('')
    setNewPassword('')
    Alert.alert('Success', 'Profile updated')
  } catch (err) {
    Alert.alert('Error', err.response?.data?.message || err.message)
  } finally {
    setLoading(false)
  }
}

  const handleLogout = async () => {
    Alert.alert('Log out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out', style: 'destructive',
        onPress: async () => {
          try {
            await api.post('/auth/logout')
            delete api.defaults.headers.common['Authorization']
          } finally {
            setToken(null)
          }
        }
      }
    ])
  }

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Avatar */}
      <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
        {profileImage
          ? <Image source={{ uri: profileImage }} style={styles.avatar} />
          : <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{name?.[0]?.toUpperCase()}</Text>
            </View>
        }
        <Text style={styles.avatarHint}>Tap to change photo</Text>
      </TouchableOpacity>

      {/* Info */}
      <Text style={styles.sectionLabel}>ACCOUNT INFO</Text>
      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Save changes</Text>
        }
      </TouchableOpacity>

      {/* Password */}
      <Text style={styles.sectionLabel}>CHANGE PASSWORD</Text>
      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>Current password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="••••••••"
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.field}>
          <Text style={styles.label}>New password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="••••••••"
          />
        </View>
      </View>

      

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45, marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#ddd',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  avatarInitial: {
    fontSize: 36, fontWeight: '500', color: '#888',
  },
  avatarHint: {
    fontSize: 13, color: '#999',
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: '#999',
    letterSpacing: 0.8, marginBottom: 8, marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  field: {
    paddingHorizontal: 16, paddingVertical: 12,
  },
  label: {
    fontSize: 12, color: '#999', marginBottom: 4,
  },
  input: {
    fontSize: 15, color: '#111',
  },
  divider: {
    height: 1, backgroundColor: '#f0f0f0', marginLeft: 16,
  },
  btn: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 28,
  },
  btnText: {
    color: '#fff', fontSize: 15, fontWeight: '500',
  },
  logoutBtn: {
    borderWidth: 1, borderColor: '#e74c3c',
    borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
  },
  logoutText: {
    color: '#e74c3c', fontSize: 15, fontWeight: '500',
  },
})

