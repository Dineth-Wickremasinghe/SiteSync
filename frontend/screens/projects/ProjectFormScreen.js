import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'
import { colors, typography, common } from '../../theme'

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
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView style={common.screenContainer} contentContainerStyle={[common.formContainer, styles.content]}>

        <Text style={[typography.label, styles.sectionLabel]}>Blueprint / Site Photo</Text>
        <TouchableOpacity style={[common.uploadBtn, styles.imageBox]} onPress={showImageOptions} activeOpacity={0.8}>
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={[common.imagePreview, styles.previewImage]} />
              <View style={styles.changePhotoOverlay}>
                <Text style={styles.changePhotoText}>Change photo</Text>
              </View>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageIcon}>📎</Text>
              <Text style={[common.uploadBtnText, styles.imageHint]}>Tap to upload blueprint</Text>
              <Text style={[typography.cardSubtitle, styles.imageHintSub]}>Camera or photo library</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={typography.label}>
          Project Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[common.input, errors.projectName && common.inputError]}
          placeholder="e.g. Colombo Tower Block A"
          placeholderTextColor={colors.textLight}
          value={projectName}
          onChangeText={t => { setProjectName(t); setErrors(p => ({ ...p, projectName: '' })) }}
        />
        {errors.projectName ? <Text style={typography.errorText}>{errors.projectName}</Text> : null}

        <Text style={typography.label}>
          Location <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[common.input, errors.location && common.inputError]}
          placeholder="e.g. Colombo 07, Sri Lanka"
          placeholderTextColor={colors.textLight}
          value={location}
          onChangeText={t => { setLocation(t); setErrors(p => ({ ...p, location: '' })) }}
        />
        {errors.location ? <Text style={typography.errorText}>{errors.location}</Text> : null}

        <Text style={typography.label}>
          Client Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[common.input, errors.clientName && common.inputError]}
          placeholder="e.g. ABC Developers (Pvt) Ltd"
          placeholderTextColor={colors.textLight}
          value={clientName}
          onChangeText={t => { setClientName(t); setErrors(p => ({ ...p, clientName: '' })) }}
        />
        {errors.clientName ? <Text style={typography.errorText}>{errors.clientName}</Text> : null}

        <Text style={typography.label}>Status</Text>
        <View style={[common.optionRow, styles.statusRow]}>
          {STATUS_OPTIONS.map(s => (
            <TouchableOpacity
              key={s}
              style={[common.option, styles.statusChip, status === s && common.optionActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[common.optionText, status === s && common.optionTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[common.primaryBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={colors.background} />
            : <Text style={common.primaryBtnText}>{isEditing ? 'Save Changes' : 'Create Project'}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={[typography.link, styles.cancelBtnText]}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// Screen-specific styles only
const styles = StyleSheet.create({
  content:            { paddingBottom: 48 },
  sectionLabel:       { textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 0 },
  imageBox:           { borderRadius: 16, overflow: 'hidden', marginBottom: 20, minHeight: 140, padding: 0, justifyContent: 'center', alignItems: 'center' },
  previewImage:       { width: '100%', height: 180, borderRadius: 0, marginTop: 0 },
  imagePlaceholder:   { height: 140, justifyContent: 'center', alignItems: 'center', width: '100%' },
  imageIcon:          { fontSize: 32, marginBottom: 6 },
  imageHint:          { fontWeight: '600' },
  imageHintSub:       { marginTop: 2 },
  changePhotoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 6, alignItems: 'center' },
  changePhotoText:    { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
  required:           { color: colors.danger },
  statusRow:          { marginBottom: 8, marginTop: 4 },
  statusChip:         { flex: 1 },
  submitBtnDisabled:  { opacity: 0.6 },
  cancelBtn:          { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText:      { color: colors.textMuted, fontSize: 14 },
})