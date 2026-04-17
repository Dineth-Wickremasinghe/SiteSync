import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'

const STATUS_OPTIONS = ['Active', 'On Hold', 'Completed']

export default function ProjectFormScreen({ route, navigation }) {
  const { project, token } = route.params
  const isEditing = project !== null

  const [projectName, setProjectName] = useState(isEditing ? project.projectName : '')
  const [location,    setLocation]    = useState(isEditing ? project.location    : '')
  const [clientName,  setClientName]  = useState(isEditing ? project.clientName  : '')
  const [status,      setStatus]      = useState(isEditing ? project.status      : 'Active')
  const [imageUri,    setImageUri]    = useState(isEditing ? project.blueprintImage : null)
  const [imageFile,   setImageFile]   = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [errors,      setErrors]      = useState({})

  const validate = () => {
    const e = {}
    if (!projectName.trim()) e.projectName = 'Project name is required'
    if (!location.trim())    e.location    = 'Location is required'
    if (!clientName.trim())  e.clientName  = 'Client name is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    })
    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
      setImageFile(result.assets[0])
    }
  }

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    })
    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
      setImageFile(result.assets[0])
    }
  }

  const showImageOptions = () => {
    Alert.alert('Upload Blueprint', 'Choose source', [
      { text: 'Camera',        onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('projectName', projectName.trim())
      formData.append('location',    location.trim())
      formData.append('clientName',  clientName.trim())
      formData.append('status',      status)

      if (imageFile) {
        formData.append('blueprintImage', {
          uri:  imageFile.uri,
          type: 'image/jpeg',
          name: 'blueprint.jpg',
        })
      }

      const config = {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }

      if (isEditing) {
        await api.put(`/projects/${project._id}`, formData, config)
        Alert.alert('Updated', 'Project updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ])
      } else {
        await api.post('/projects', formData, config)
        Alert.alert('Created', 'Project created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ])
      }
    } catch (err) {
      console.log('Save error:', err)
      console.log('Error response:', err.response?.data)
      Alert.alert('Error', err.response?.data?.message || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#1B4332" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.sectionLabel}>Blueprint / Site Photo</Text>
        <TouchableOpacity style={styles.imageBox} onPress={showImageOptions} activeOpacity={0.8}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageIcon}>📎</Text>
              <Text style={styles.imageHint}>Tap to upload blueprint</Text>
              <Text style={styles.imageHintSub}>Camera or photo library</Text>
            </View>
          )}
          {imageUri && (
            <View style={styles.changePhotoOverlay}>
              <Text style={styles.changePhotoText}>Change photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Project Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.projectName && styles.inputError]}
          placeholder="e.g. Colombo Tower Block A"
          placeholderTextColor="#9DB8A2"
          value={projectName}
          onChangeText={t => { setProjectName(t); setErrors(p => ({ ...p, projectName: '' })) }}
        />
        {errors.projectName ? <Text style={styles.errorText}>{errors.projectName}</Text> : null}

        <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.location && styles.inputError]}
          placeholder="e.g. Colombo 07, Sri Lanka"
          placeholderTextColor="#9DB8A2"
          value={location}
          onChangeText={t => { setLocation(t); setErrors(p => ({ ...p, location: '' })) }}
        />
        {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}

        <Text style={styles.label}>Client Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.clientName && styles.inputError]}
          placeholder="e.g. ABC Developers (Pvt) Ltd"
          placeholderTextColor="#9DB8A2"
          value={clientName}
          onChangeText={t => { setClientName(t); setErrors(p => ({ ...p, clientName: '' })) }}
        />
        {errors.clientName ? <Text style={styles.errorText}>{errors.clientName}</Text> : null}

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.statusChip, status === s && styles.statusChipActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.statusChipText, status === s && styles.statusChipTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.submitBtnText}>{isEditing ? 'Save Changes' : 'Create Project'}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F4F6F4' },
  content:      { padding: 20, paddingBottom: 48 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#4A6B52', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  imageBox:     { borderRadius: 16, overflow: 'hidden', marginBottom: 24, borderWidth: 2, borderColor: '#C8DEC9', borderStyle: 'dashed', minHeight: 140 },
  previewImage: { width: '100%', height: 180 },
  imagePlaceholder:   { height: 140, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F7F1' },
  imageIcon:          { fontSize: 32, marginBottom: 6 },
  imageHint:          { fontSize: 14, color: '#52B788', fontWeight: '600' },
  imageHintSub:       { fontSize: 12, color: '#9DB8A2', marginTop: 2 },
  changePhotoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(27,67,50,0.55)', paddingVertical: 6, alignItems: 'center' },
  changePhotoText:    { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
  label:       { fontSize: 14, fontWeight: '600', color: '#2C4A32', marginBottom: 6, marginTop: 4 },
  required:    { color: '#E53935' },
  input:       { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#D4E6D5', paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#1B2B1E', marginBottom: 4 },
  inputError:  { borderColor: '#E53935' },
  errorText:   { color: '#E53935', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  statusRow:         { flexDirection: 'row', gap: 10, marginBottom: 28, marginTop: 4 },
  statusChip:        { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#C8DEC9', backgroundColor: '#FFFFFF', alignItems: 'center' },
  statusChipActive:  { backgroundColor: '#1B4332', borderColor: '#1B4332' },
  statusChipText:    { fontSize: 13, fontWeight: '600', color: '#4A6B52' },
  statusChipTextActive: { color: '#FFFFFF' },
  submitBtn:         { backgroundColor: '#1B4332', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12, elevation: 3 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText:     { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cancelBtn:         { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText:     { color: '#7A9B82', fontSize: 14, fontWeight: '500' },
})