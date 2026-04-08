import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'

export default function IncidentFormScreen({ navigation, route }) {
  const { incident, token } = route.params
  const editing = incident !== null

  const [title,       setTitle]       = useState(editing ? incident.title       : '')
  const [description, setDescription] = useState(editing ? incident.description : '')
  const [severity,    setSeverity]    = useState(editing ? incident.severity    : 'Low')
  const [status,      setStatus]      = useState(editing ? incident.status      : 'Open')
  const [photo,       setPhoto]       = useState(null)
  const [loading,     setLoading]     = useState(false)

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
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('title',       title)
      formData.append('description', description)
      formData.append('severity',    severity)
      formData.append('status',      status)

      if (photo) {
        formData.append('incidentImg', {
          uri:  photo.uri,
          type: 'image/jpeg',
          name: 'incident.jpg'
        })
      }

      const config = {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }

      if (editing) {
        await api.put(`/incidents/${incident._id}`, formData, config)
      } else {
        await api.post('/incidents', formData, config)
      }

      Alert.alert('Success', editing ? 'Incident updated!' : 'Incident reported!')
      navigation.goBack()
    } catch (error) {
      console.log('Save error:', error)
      console.log('Error response:', error.response?.data)
      console.log('Error message:', error.message)
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to save incident')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{editing ? 'Edit Incident' : 'Report Incident'}</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Worker injury on site"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the incident..."
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Severity</Text>
      <View style={styles.optionRow}>
        {['Low', 'Medium', 'High'].map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.option, severity === s && styles.optionActive]}
            onPress={() => setSeverity(s)}
          >
            <Text style={[styles.optionText, severity === s && styles.optionTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Status</Text>
      <View style={styles.optionRow}>
        {['Open', 'Resolved'].map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.option, status === s && styles.optionActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={[styles.optionText, status === s && styles.optionTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Incident Photo</Text>
      <TouchableOpacity style={styles.uploadBtn} onPress={pickPhoto}>
        <Text style={styles.uploadBtnText}>
          {photo ? 'Photo selected' : '+ Select incident photo'}
        </Text>
      </TouchableOpacity>
      {photo && (
        <Image source={{ uri: photo.uri }} style={styles.preview} />
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveBtnText}>{editing ? 'Update Incident' : 'Report Incident'}</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#fff', padding: 20 },
  title:            { fontSize: 22, fontWeight: 'bold', color: '#1A5276', marginBottom: 24 },
  label:            { fontSize: 13, color: '#888', marginBottom: 6, marginTop: 12 },
  input:            { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15 },
  textArea:         { height: 100, textAlignVertical: 'top' },
  optionRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option:           { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  optionActive:     { backgroundColor: '#1A5276', borderColor: '#1A5276' },
  optionText:       { color: '#555', fontSize: 13 },
  optionTextActive: { color: '#fff' },
  uploadBtn:        { borderWidth: 1, borderColor: '#1A5276', borderRadius: 8, padding: 12, alignItems: 'center', borderStyle: 'dashed', marginTop: 4 },
  uploadBtnText:    { color: '#1A5276', fontSize: 14 },
  preview:          { width: '100%', height: 180, borderRadius: 8, marginTop: 10 },
  saveBtn:          { backgroundColor: '#1A5276', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  saveBtnText:      { color: '#fff', fontSize: 15, fontWeight: '600' }
})