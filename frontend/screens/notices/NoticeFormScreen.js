import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'
import { colors, common, typography } from '../../theme'

const CATEGORIES = ['Safety', 'Schedule', 'General']

const CATEGORY_ACCENT = {
  Safety:   '#D7302D',
  Schedule: '#1D4ED8',
  General:  '#15803D',
}

export default function NoticeFormScreen({ navigation, route }) {
  const { notice, token } = route.params
  const editing = notice !== null

  const [title,    setTitle]    = useState(editing ? notice.title    : '')
  const [message,  setMessage]  = useState(editing ? notice.message  : '')
  const [category, setCategory] = useState(editing ? notice.category : 'General')
  const [postedBy, setPostedBy] = useState(editing ? notice.postedBy : '')
  const [photo,    setPhoto]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
      exif: false,
      base64: false,
    })
    if (!result.canceled) setPhoto(result.assets[0])
  }

  const validate = () => {
    const e = {}
    if (!title.trim())    e.title    = 'Title is required'
    if (!message.trim())  e.message  = 'Message is required'
    if (!postedBy.trim()) e.postedBy = 'Posted by is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('title',    title.trim())
      formData.append('message',  message.trim())
      formData.append('category', category)
      formData.append('postedBy', postedBy.trim())

      if (photo) {
        formData.append('noticeImage', {
          uri:  photo.uri,
          type: 'image/jpeg',
          name: 'notice.jpg'
        })
      }

      const config = {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }

      if (editing) {
        await api.put(`/notices/${notice._id}`, formData, config)
      } else {
        await api.post('/notices', formData, config)
      }

      Alert.alert('Success', editing ? 'Notice updated!' : 'Notice posted!')
      navigation.goBack()
    } catch (error) {
      console.log('Save error:', error)
      console.log('Error response:', error.response?.data)
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to save notice')
    } finally {
      setLoading(false)
    }
  }

  const accentColor = CATEGORY_ACCENT[category]

  return (
    <ScrollView style={common.formContainer}>

      <Text style={typography.sectionTitle}>
        {editing ? 'Edit Notice' : 'New Notice'}
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
        placeholder="e.g. Site Safety Briefing"
        placeholderTextColor={colors.textLight}
      />
      {errors.title ? <Text style={typography.errorText}>{errors.title}</Text> : null}

      {/* Message */}
      <Text style={typography.label}>
        Message <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput
        style={[common.input, common.textArea, errors.message && common.inputError]}
        value={message}
        onChangeText={t => {
          setMessage(t)
          if (errors.message) setErrors(e => ({ ...e, message: '' }))
        }}
        placeholder="Write the notice content here..."
        placeholderTextColor={colors.textLight}
        multiline
        numberOfLines={5}
      />
      {errors.message ? <Text style={typography.errorText}>{errors.message}</Text> : null}

      {/* Category */}
      <Text style={typography.label}>Category</Text>
      <View style={common.optionRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              common.option,
              category === cat && {
                backgroundColor: CATEGORY_ACCENT[cat],
                borderColor:     CATEGORY_ACCENT[cat]
              }
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[common.optionText, category === cat && common.optionTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Posted By */}
      <Text style={typography.label}>
        Posted By <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput
        style={[common.input, errors.postedBy && common.inputError]}
        value={postedBy}
        onChangeText={t => {
          setPostedBy(t)
          if (errors.postedBy) setErrors(e => ({ ...e, postedBy: '' }))
        }}
        placeholder="e.g. Site Manager"
        placeholderTextColor={colors.textLight}
      />
      {errors.postedBy ? <Text style={typography.errorText}>{errors.postedBy}</Text> : null}

      {/* Notice Image */}
      <Text style={typography.label}>Notice Image</Text>
      <TouchableOpacity style={common.uploadBtn} onPress={pickPhoto}>
        <Text style={common.uploadBtnText}>
          {photo ? '✓ Photo selected' : '+ Select notice image'}
        </Text>
      </TouchableOpacity>
      {photo && (
        <Image source={{ uri: photo.uri }} style={common.imagePreview} />
      )}
      {!photo && editing && notice.noticeImage && (
        <Image source={{ uri: notice.noticeImage }} style={common.imagePreview} />
      )}

      {/* Save */}
      <TouchableOpacity
        style={[common.primaryBtn, { backgroundColor: accentColor }, loading && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={common.primaryBtnText}>
              {editing ? 'Update Notice' : 'Post Notice'}
            </Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  cancelBtn:  { marginTop: 12, alignItems: 'center', paddingVertical: 12, marginBottom: 40 },
  cancelText: { fontSize: 15, color: colors.textMuted, fontWeight: '500' },
})