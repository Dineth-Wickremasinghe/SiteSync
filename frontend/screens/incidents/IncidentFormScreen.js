import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'
import { colors, common, typography } from '../../theme'

export default function IncidentFormScreen({ navigation, route }) {
  const { incident, token } = route.params
  const editing = incident !== null

  const [title,       setTitle]       = useState(editing ? incident.title       : '')
  const [description, setDescription] = useState(editing ? incident.description : '')
  const [severity,    setSeverity]    = useState(editing ? incident.severity    : 'Low')
  const [status,      setStatus]      = useState(editing ? incident.status      : 'Open')
  const [photo,       setPhoto]       = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [errors,      setErrors]      = useState({})

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
    if (!title.trim())       e.title       = 'Title is required'
    if (!description.trim()) e.description = 'Description is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('title',       title.trim())
      formData.append('description', description.trim())
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
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to save incident')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={common.formContainer}>

      <Text style={typography.sectionTitle}>
        {editing ? 'Edit Incident' : 'Report Incident'}
      </Text>

      {/* Title */}
      <Text style={typography.label}>
        Title <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput
        style={[common.input, errors.title && common.inputError]}
        value={title}
        onChangeText={t => {
          setTitle(t)
          if (errors.title) setErrors(e => ({ ...e, title: '' }))
        }}
        placeholder="e.g. Worker injury on site"
        placeholderTextColor={colors.textLight}
      />
      {errors.title ? <Text style={typography.errorText}>{errors.title}</Text> : null}

      {/* Description */}
      <Text style={typography.label}>
        Description <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput
        style={[common.input, common.textArea, errors.description && common.inputError]}
        value={description}
        onChangeText={t => {
          setDescription(t)
          if (errors.description) setErrors(e => ({ ...e, description: '' }))
        }}
        placeholder="Describe the incident..."
        placeholderTextColor={colors.textLight}
        multiline
        numberOfLines={4}
      />
      {errors.description ? <Text style={typography.errorText}>{errors.description}</Text> : null}

      {/* Severity */}
      <Text style={typography.label}>Severity</Text>
      <View style={common.optionRow}>
        {['Low', 'Medium', 'High'].map(s => (
          <TouchableOpacity
            key={s}
            style={[common.option, severity === s && common.optionActive]}
            onPress={() => setSeverity(s)}
          >
            <Text style={[common.optionText, severity === s && common.optionTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status */}
      <Text style={typography.label}>Status</Text>
      <View style={common.optionRow}>
        {['Open', 'Resolved'].map(s => (
          <TouchableOpacity
            key={s}
            style={[common.option, status === s && common.optionActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={[common.optionText, status === s && common.optionTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Photo */}
      <Text style={typography.label}>Incident Photo</Text>
      <TouchableOpacity style={common.uploadBtn} onPress={pickPhoto}>
        <Text style={common.uploadBtnText}>
          {photo ? '✓ Photo selected' : '+ Select incident photo'}
        </Text>
      </TouchableOpacity>
      {photo && (
        <Image source={{ uri: photo.uri }} style={common.imagePreview} />
      )}
      {editing && incident.incidentImg && !photo && (
        <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 6 }}>
          Current photo will be kept if no new photo is selected
        </Text>
      )}

      {/* Save */}
      <TouchableOpacity
        style={[common.primaryBtn, loading && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={colors.background} />
          : <Text style={common.primaryBtnText}>
              {editing ? 'Update Incident' : 'Report Incident'}
            </Text>
        }
      </TouchableOpacity>

    </ScrollView>
  )
}

const styles = StyleSheet.create({})