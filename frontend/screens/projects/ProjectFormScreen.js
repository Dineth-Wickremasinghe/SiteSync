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
  const [location, setLocation] = useState(isEditing ? project.location : '')
  const [clientName, setClientName] = useState(isEditing ? project.clientName : '')
  const [status, setStatus] = useState(isEditing ? project.status : 'Active')
  const [imageUri, setImageUri] = useState(isEditing ? project.blueprintImage : null)
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    
    // Project name validation
    if (!projectName.trim()) {
      e.projectName = 'Project name is required'
    } else if (projectName.trim().length < 3) {
      e.projectName = 'Project name must be at least 3 characters'
    } else if (projectName.trim().length > 100) {
      e.projectName = 'Project name must be less than 100 characters'
    } else if (/[<>{}[\]\\]/.test(projectName)) {
      e.projectName = 'Project name cannot contain special characters'
    }
    
    // Location validation
    if (!location.trim()) {
      e.location = 'Location is required'
    } else if (location.trim().length < 3) {
      e.location = 'Location must be at least 3 characters'
    }
    
    // Client name validation
    if (!clientName.trim()) {
      e.clientName = 'Client name is required'
    } else if (clientName.trim().length < 2) {
      e.clientName = 'Client name must be at least 2 characters'
    }
    
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

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('projectName', projectName.trim())
      formData.append('location', location.trim())
      formData.append('clientName', clientName.trim())
      formData.append('status', status)

      if (imageFile) {
        formData.append('blueprintImage', {
          uri: imageFile.uri,
          type: 'image/jpeg',
          name: 'blueprint.jpg',
        })
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }

      if (isEditing) {
        await api.put(`/projects/${project._id}`, formData, config)
        Alert.alert('Success', 'Project updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ])
      } else {
        await api.post('/projects', formData, config)
        Alert.alert('Success', 'Project created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ])
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView style={common.screenContainer} contentContainerStyle={[common.formContainer, styles.content]}>
        
        <Text style={typography.label}>Project Name *</Text>
        <TextInput
          style={[common.input, errors.projectName && common.inputError]}
          placeholder="e.g. Colombo Tower"
          placeholderTextColor={colors.textLight}
          value={projectName}
          onChangeText={setProjectName}
        />
        {errors.projectName && <Text style={typography.errorText}>{errors.projectName}</Text>}

        <Text style={typography.label}>Location *</Text>
        <TextInput
          style={[common.input, errors.location && common.inputError]}
          placeholder="e.g. Colombo, Sri Lanka"
          placeholderTextColor={colors.textLight}
          value={location}
          onChangeText={setLocation}
        />
        {errors.location && <Text style={typography.errorText}>{errors.location}</Text>}

        <Text style={typography.label}>Client Name *</Text>
        <TextInput
          style={[common.input, errors.clientName && common.inputError]}
          placeholder="e.g. ABC Developers"
          placeholderTextColor={colors.textLight}
          value={clientName}
          onChangeText={setClientName}
        />
        {errors.clientName && <Text style={typography.errorText}>{errors.clientName}</Text>}

        <Text style={typography.label}>Status</Text>
        <View style={common.optionRow}>
          {STATUS_OPTIONS.map(s => (
            <TouchableOpacity
              key={s}
              style={[common.option, status === s && common.optionActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[common.optionText, status === s && common.optionTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={typography.label}>Blueprint Image</Text>
        <TouchableOpacity
          style={common.uploadBtn}
          onPress={() => Alert.alert('Upload Image', 'Choose source', [
            { text: 'Camera', onPress: takePhoto },
            { text: 'Gallery', onPress: pickImage },
            { text: 'Cancel', style: 'cancel' }
          ])}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={common.imagePreview} />
          ) : (
            <Text style={common.uploadBtnText}>📎 Tap to upload image</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[common.primaryBtn, loading && styles.disabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={colors.background} /> : <Text style={common.primaryBtnText}>{isEditing ? 'Update Project' : 'Create Project'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  content: { paddingBottom: 48 },
  disabled: { opacity: 0.6 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { color: colors.textMuted, fontSize: 14 }
})