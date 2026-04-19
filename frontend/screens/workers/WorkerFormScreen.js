import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, Image
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'

export default function WorkerFormScreen({ navigation, route }) {
  const { worker, token } = route.params
  const editing = worker !== null

  const [name,    setName]    = useState(editing ? worker.name   : '')
  const [phone,   setPhone]   = useState(editing ? worker.phone  : '')
  const [trade,   setTrade]   = useState(editing ? worker.trade  : 'Mason')
  const [status,  setStatus]  = useState(editing ? worker.status : 'Active')
  const [photo,   setPhoto]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

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

  return (
    <ScrollView className="flex-1 bg-white px-5 pt-5">
      <Text className="text-2xl font-bold text-[#1A5276] mb-6">
        {editing ? 'Edit Worker' : 'Add Worker'}
      </Text>

      {/* Full Name */}
      <Text className="text-xs text-gray-400 mb-1.5 mt-3">
        Full name <Text className="text-red-500">*</Text>
      </Text>
      <TextInput
        className={`border rounded-lg p-3 text-base ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
        value={name}
        onChangeText={t => {
          setName(t)
          if (errors.name) setErrors(e => ({ ...e, name: '' }))
        }}
        placeholder="Kamal Perera"
      />
      {errors.name ? (
        <Text className="text-red-500 text-xs mt-1 mb-1">{errors.name}</Text>
      ) : null}

      {/* Phone */}
      <Text className="text-xs text-gray-400 mb-1.5 mt-3">
        Phone <Text className="text-red-500">*</Text>
      </Text>
      <TextInput
        className={`border rounded-lg p-3 text-base ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
        value={phone}
        onChangeText={t => {
          setPhone(t)
          if (errors.phone) setErrors(e => ({ ...e, phone: '' }))
        }}
        placeholder="0771234567"
        keyboardType="phone-pad"
        maxLength={10}
      />
      {errors.phone ? (
        <Text className="text-red-500 text-xs mt-1 mb-1">{errors.phone}</Text>
      ) : null}

      {/* Trade */}
      <Text className="text-xs text-gray-400 mb-1.5 mt-3">Trade</Text>
      <View className="flex-row flex-wrap gap-2">
        {['Mason', 'Electrician', 'Plumber', 'General'].map(t => (
          <TouchableOpacity
            key={t}
            className={`border rounded-lg px-4 py-2 ${trade === t ? 'bg-[#1A5276] border-[#1A5276]' : 'border-gray-200'}`}
            onPress={() => setTrade(t)}
          >
            <Text className={`text-sm ${trade === t ? 'text-white' : 'text-gray-500'}`}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status */}
      <Text className="text-xs text-gray-400 mb-1.5 mt-3">Status</Text>
      <View className="flex-row flex-wrap gap-2">
        {['Active', 'Inactive'].map(s => (
          <TouchableOpacity
            key={s}
            className={`border rounded-lg px-4 py-2 ${status === s ? 'bg-[#1A5276] border-[#1A5276]' : 'border-gray-200'}`}
            onPress={() => setStatus(s)}
          >
            <Text className={`text-sm ${status === s ? 'text-white' : 'text-gray-500'}`}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ID Photo */}
      <Text className="text-xs text-gray-400 mb-1.5 mt-3">ID Photo</Text>
      <TouchableOpacity
        className="border border-[#1A5276] border-dashed rounded-lg p-3 items-center mt-1"
        onPress={pickPhoto}
      >
        <Text className="text-[#1A5276] text-sm">
          {photo ? '✓ Photo selected' : '+ Select ID photo'}
        </Text>
      </TouchableOpacity>
      {photo && (
        <Image source={{ uri: photo.uri }} className="w-full h-44 rounded-lg mt-3" />
      )}
      {editing && worker.idPhotoUrl && !photo && (
        <Text className="text-xs text-gray-400 mt-2">
          Current photo will be kept if no new photo is selected
        </Text>
      )}

      {/* Save Button */}
      <TouchableOpacity
        className={`bg-[#1A5276] rounded-lg p-4 items-center mt-6 mb-10 ${loading ? 'opacity-60' : ''}`}
        onPress={handleSave}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text className="text-white text-base font-semibold">
              {editing ? 'Update Worker' : 'Save Worker'}
            </Text>
        }
      </TouchableOpacity>
    </ScrollView>
  )
}