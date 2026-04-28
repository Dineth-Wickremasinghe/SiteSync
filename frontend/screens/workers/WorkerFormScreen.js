import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, Image, Modal, FlatList, StyleSheet
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'
import { colors, common, typography } from '../../theme'

export default function WorkerFormScreen({ navigation, route }) {
  const { worker, token } = route.params
  const editing = worker !== null

  const [name,          setName]          = useState(editing ? worker.name   : '')
  const [phone,         setPhone]         = useState(editing ? worker.phone  : '')
  const [trade,         setTrade]         = useState(editing ? worker.trade  : 'Mason')
  const [status,        setStatus]        = useState(editing ? worker.status : 'Active')
  const [photo,         setPhoto]         = useState(null)
  const [loading,       setLoading]       = useState(false)
  const [errors,        setErrors]        = useState({})
  const [users,         setUsers]         = useState([])
  const [usersLoading,  setUsersLoading]  = useState(false)
  const [pickerVisible, setPickerVisible] = useState(false)
  const [selectedUser,  setSelectedUser]  = useState(
    editing && worker.userId
      ? { _id: worker.userId._id || worker.userId, name: worker.userId.name, email: worker.userId.email }
      : null
  )
  const [userSearch, setUserSearch] = useState('')

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
  try {
    setUsersLoading(true)
    const currentUserId = editing && worker.userId
      ? worker.userId._id || worker.userId
      : null

    const url = currentUserId
      ? `/auth/users?currentUserId=${currentUserId}`
      : '/auth/users'

    const res = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setUsers(res.data)
  } catch (error) {
    console.log('Failed to fetch users:', error)
  } finally {
    setUsersLoading(false)
  }
}

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: false,
      exif: false,
      base64: false,
    })
    if (!result.canceled) setPhoto(result.assets[0])
  }

  const validate = () => {
    const e = {}
    if (!name.trim()) {
      e.name = 'Full name is required'
    } else if (name.trim().length < 3) {
      e.name = 'Name must be at least 3 characters'
    }
    if (!phone.trim()) {
      e.phone = 'Phone number is required'
    } else if (!/^0\d{9}$/.test(phone.trim())) {
      e.phone = 'Enter a valid Sri Lankan number (e.g. 0771234567)'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name',   name.trim())
      formData.append('phone',  phone.trim())
      formData.append('trade',  trade)
      formData.append('status', status)
      formData.append('userId', selectedUser ? selectedUser._id : '')

      if (photo) {
        formData.append('idPhoto', {
          uri:  photo.uri,
          type: 'image/jpeg',
          name: 'idphoto.jpg'
        })
      }

      const config = {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }

      if (editing) {
        await api.put(`/workers/${worker._id}`, formData, config)
      } else {
        await api.post('/workers', formData, config)
      }

      Alert.alert('Success', editing ? 'Worker updated!' : 'Worker added!')
      navigation.goBack()
    } catch (error) {
      console.log('Save error:', error)
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to save worker')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <ScrollView style={common.formContainer}>

      <Text style={typography.sectionTitle}>
        {editing ? 'Edit Worker' : 'Add Worker'}
      </Text>

      {/* Full Name */}
      <Text style={typography.label}>
        Full name <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput
        style={[common.input, errors.name && common.inputError]}
        value={name}
        onChangeText={t => {
          setName(t)
          if (errors.name) setErrors(e => ({ ...e, name: '' }))
        }}
        placeholder="Kamal Perera"
        placeholderTextColor={colors.textLight}
      />
      {errors.name ? <Text style={typography.errorText}>{errors.name}</Text> : null}

      {/* Phone */}
      <Text style={typography.label}>
        Phone <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput
        style={[common.input, errors.phone && common.inputError]}
        value={phone}
        onChangeText={t => {
          setPhone(t)
          if (errors.phone) setErrors(e => ({ ...e, phone: '' }))
        }}
        placeholder="0771234567"
        placeholderTextColor={colors.textLight}
        keyboardType="phone-pad"
        maxLength={10}
      />
      {errors.phone ? <Text style={typography.errorText}>{errors.phone}</Text> : null}

      {/* Trade */}
      <Text style={typography.label}>Trade</Text>
      <View style={common.optionRow}>
        {['Mason', 'Electrician', 'Plumber', 'General'].map(t => (
          <TouchableOpacity
            key={t}
            style={[common.option, trade === t && common.optionActive]}
            onPress={() => setTrade(t)}
          >
            <Text style={[common.optionText, trade === t && common.optionTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status */}
      <Text style={typography.label}>Status</Text>
      <View style={common.optionRow}>
        {['Active', 'Inactive'].map(s => (
          <TouchableOpacity
            key={s}
            style={[common.option, status === s && common.optionActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={[common.optionText, status === s && common.optionTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Link to User Account */}
      <Text style={typography.label}>
        Link to User Account{' '}
        <Text style={{ color: colors.textLight, fontSize: 11 }}>(optional)</Text>
      </Text>

      <TouchableOpacity
        style={[
          styles.pickerBtn,
          selectedUser && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
        ]}
        onPress={() => setPickerVisible(true)}
      >
        {usersLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : selectedUser ? (
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '600' }}>
              {selectedUser.name}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>{selectedUser.email}</Text>
          </View>
        ) : (
          <Text style={{ color: colors.textLight, fontSize: 15 }}>Select a user account...</Text>
        )}
        <Text style={{ color: colors.textMuted, fontSize: 13, marginLeft: 8 }}>▾</Text>
      </TouchableOpacity>

      {selectedUser && (
        <TouchableOpacity style={{ marginTop: 4 }} onPress={() => setSelectedUser(null)}>
          <Text style={{ fontSize: 12, color: colors.danger }}>✕ Remove link</Text>
        </TouchableOpacity>
      )}

      {/* User Picker Modal */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.card }}>

          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.primary }}>
              Select User
            </Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 15 }}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.modalSearch}>
            <Text style={{ marginRight: 8 }}>🔍</Text>
            <TextInput
              style={{ flex: 1, fontSize: 15, color: colors.textDark }}
              placeholder="Search by name or email..."
              placeholderTextColor={colors.textLight}
              value={userSearch}
              onChangeText={setUserSearch}
              autoFocus
            />
          </View>

          {/* User list */}
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item._id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            ListEmptyComponent={
              <View style={common.center}>
                <Text style={typography.emptyText}>No users found</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.userRow,
                  selectedUser?._id === item._id && {
                    backgroundColor: colors.primaryLight,
                    borderColor: colors.primary
                  }
                ]}
                onPress={() => {
                  setSelectedUser(item)
                  setPickerVisible(false)
                  setUserSearch('')
                }}
              >
                <View style={styles.userAvatar}>
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textDark }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>
                    {item.email} · {item.role}
                  </Text>
                </View>
                {selectedUser?._id === item._id && (
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* ID Photo */}
      <Text style={typography.label}>ID Photo</Text>
      <TouchableOpacity style={common.uploadBtn} onPress={pickPhoto}>
        <Text style={common.uploadBtnText}>
          {photo ? '✓ Photo selected' : '+ Select ID photo'}
        </Text>
      </TouchableOpacity>
      {photo && (
        <Image source={{ uri: photo.uri }} style={common.imagePreview} />
      )}
      {editing && worker.idPhotoUrl && !photo && (
        <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 6 }}>
          Current photo will be kept if no new photo is selected
        </Text>
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={[common.primaryBtn, loading && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={colors.card} />
          : <Text style={common.primaryBtnText}>
              {editing ? 'Update Worker' : 'Save Worker'}
            </Text>
        }
      </TouchableOpacity>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  pickerBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: colors.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.card,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
})