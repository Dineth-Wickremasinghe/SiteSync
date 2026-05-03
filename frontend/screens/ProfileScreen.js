import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../services/api'
import { colors, common, typography } from '../theme'

export default function ProfileScreen({ token, setToken }) {
  const [name,            setName]            = useState('')
  const [email,           setEmail]           = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [profileImage,    setProfileImage]    = useState(null)
  const [loading,         setLoading]         = useState(false)
  const [fetching,        setFetching]        = useState(true)
  const [workerRecord,    setWorkerRecord]    = useState(null)

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      // Fetch user profile
      const res = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setName(res.data.name)
      setEmail(res.data.email)
      setProfileImage(res.data.profileImage || null)

      // Try to fetch linked worker record — silently ignore if not found
      try {
        const workerRes = await api.get('/workers/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setWorkerRecord(workerRes.data)
      } catch {
        setWorkerRecord(null)
      }
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
      mediaTypes: ['images'],
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
      formData.append('name',  name)
      formData.append('email', email)

      if (profileImage && profileImage.startsWith('file')) {
        formData.append('profileImage', {
          uri:  profileImage,
          name: 'profile.jpg',
          type: 'image/jpeg',
        })
      }

      if (currentPassword && newPassword) {
        formData.append('currentPassword', currentPassword)
        formData.append('newPassword',     newPassword)
      }

      await api.put('/auth/profile', formData, {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
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

  const getStatusStyle = (status) => ({
    bg:   status === 'Active' ? colors.successLight : colors.borderLight,
    text: status === 'Active' ? colors.success      : colors.textMuted,
  })

  if (fetching) {
    return (
      <View style={common.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView style={common.screenContainer} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={typography.screenTitle}>Profile</Text>
        <Text style={typography.screenSubtitle}>Manage your account</Text>
      </View>

      {/* Avatar */}
      <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{name?.[0]?.toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.avatarHintRow}>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>
      </TouchableOpacity>

      {/* Account Info */}
      <Text style={styles.sectionLabel}>ACCOUNT INFO</Text>
      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={styles.fieldInput}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.textLight}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.fieldInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Your email"
            placeholderTextColor={colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[common.primaryBtn, { marginHorizontal: 20 }, loading && { opacity: 0.6 }]}
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={colors.background} />
          : <Text style={common.primaryBtnText}>Save Changes</Text>
        }
      </TouchableOpacity>

      {/* Change Password */}
      <Text style={styles.sectionLabel}>CHANGE PASSWORD</Text>
      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Current password</Text>
          <TextInput
            style={styles.fieldInput}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.textLight}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>New password</Text>
          <TextInput
            style={styles.fieldInput}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.textLight}
          />
        </View>
      </View>

      {/* Worker Record — only shows if account is linked to a worker */}
      {workerRecord && (
        <>
          <Text style={styles.sectionLabel}>MY WORKER RECORD</Text>
          <View style={styles.card}>

            {/* ID Photo */}
            {workerRecord.idPhotoUrl && (
              <Image
                source={{ uri: workerRecord.idPhotoUrl }}
                style={styles.workerPhoto}
                resizeMode="cover"
              />
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Trade</Text>
              <Text style={styles.fieldValue}>{workerRecord.trade}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <Text style={styles.fieldValue}>{workerRecord.phone}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Status</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusStyle(workerRecord.status).bg }
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  { color: getStatusStyle(workerRecord.status).text }
                ]}>
                  {workerRecord.status}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { paddingBottom: 48 },

  header: {
    backgroundColor: colors.background,
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    marginBottom: 24,
  },

  avatarWrapper:     { alignItems: 'center', marginBottom: 28 },
  avatar:            { width: 90, height: 90, borderRadius: 45, marginBottom: 8, borderWidth: 2, borderColor: colors.primary },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.inputBg, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 2, borderColor: colors.primary },
  avatarInitial:     { fontSize: 36, fontWeight: '700', color: colors.primary },
  avatarHintRow:     { backgroundColor: colors.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  avatarHint:        { fontSize: 12, color: colors.primaryDark, fontWeight: '500' },

  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: colors.primary,
    letterSpacing: 1, marginBottom: 8, marginLeft: 20,
  },

  card:       { backgroundColor: colors.card, borderRadius: 12, marginBottom: 16, marginHorizontal: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  field:      { paddingHorizontal: 16, paddingVertical: 12 },
  fieldLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: { fontSize: 15, color: colors.textDark },
  fieldValue: { fontSize: 15, color: colors.textDark, fontWeight: '500' },
  divider:    { height: 1, backgroundColor: colors.border, marginLeft: 16 },

  workerPhoto: { width: '100%', height: 160 },

  statusBadge:     { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 4 },
  statusBadgeText: { fontSize: 13, fontWeight: '600' },

  logoutBtn:  { borderWidth: 1.5, borderColor: colors.danger, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8, marginHorizontal: 20, marginBottom: 20 },
  logoutText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
})