import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'

export default function WorkerFormScreen({ navigation, route }) {
  const { worker, token } = route.params
  const editing = worker !== null

  const [name,   setName]   = useState(editing ? worker.name  : '')
  const [phone,  setPhone]  = useState(editing ? worker.phone : '')
  const [trade,  setTrade]  = useState(editing ? worker.trade : 'Mason')
  const [status, setStatus] = useState(editing ? worker.status : 'Active')
  const [photo,  setPhoto]  = useState(null)
  const [loading, setLoading] = useState(false)

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

  const handleSave = async () => {
    if (!name || !phone || !trade) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name',   name)
      formData.append('phone',  phone)
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
        console.log('Error response:', error.response?.data)
        console.log('Error message:', error.message)
        Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to save worker')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{editing ? 'Edit Worker' : 'Add Worker'}</Text>

      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Kamal Perera" />

      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="0771234567" keyboardType="phone-pad" />

      <Text style={styles.label}>Trade</Text>
      <View style={styles.optionRow}>
        {['Mason', 'Electrician', 'Plumber', 'General'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.option, trade === t && styles.optionActive]}
            onPress={() => setTrade(t)}
          >
            <Text style={[styles.optionText, trade === t && styles.optionTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Status</Text>
      <View style={styles.optionRow}>
        {['Active', 'Inactive'].map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.option, status === s && styles.optionActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={[styles.optionText, status === s && styles.optionTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>ID Photo</Text>
      <TouchableOpacity style={styles.uploadBtn} onPress={pickPhoto}>
        <Text style={styles.uploadBtnText}>
          {photo ? 'Photo selected' : '+ Select ID photo'}
        </Text>
      </TouchableOpacity>
      {photo && (
        <Image source={{ uri: photo.uri }} style={styles.preview} />
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveBtnText}>{editing ? 'Update Worker' : 'Save Worker'}</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#fff', padding: 20 },
  title:             { fontSize: 22, fontWeight: 'bold', color: '#1A5276', marginBottom: 24 },
  label:             { fontSize: 13, color: '#888', marginBottom: 6, marginTop: 12 },
  input:             { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15 },
  optionRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option:            { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  optionActive:      { backgroundColor: '#1A5276', borderColor: '#1A5276' },
  optionText:        { color: '#555', fontSize: 13 },
  optionTextActive:  { color: '#fff' },
  uploadBtn:         { borderWidth: 1, borderColor: '#1A5276', borderRadius: 8, padding: 12, alignItems: 'center', borderStyle: 'dashed', marginTop: 4 },
  uploadBtnText:     { color: '#1A5276', fontSize: 14 },
  preview:           { width: '100%', height: 180, borderRadius: 8, marginTop: 10 },
  saveBtn:           { backgroundColor: '#1A5276', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  saveBtnText:       { color: '#fff', fontSize: 15, fontWeight: '600' }
})