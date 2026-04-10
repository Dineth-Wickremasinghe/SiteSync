import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'

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

  const handleSave = async () => {
    if (!title || !message || !postedBy) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('title',    title)
      formData.append('message',  message)
      formData.append('category', category)
      formData.append('postedBy', postedBy)

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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{editing ? 'Edit Notice' : 'New Notice'}</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Site Safety Briefing"
      />

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={message}
        onChangeText={setMessage}
        placeholder="Write the notice content here..."
        multiline
        numberOfLines={5}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.optionRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.option,
              category === cat && { backgroundColor: CATEGORY_ACCENT[cat], borderColor: CATEGORY_ACCENT[cat] }
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.optionText, category === cat && styles.optionTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Posted By</Text>
      <TextInput
        style={styles.input}
        value={postedBy}
        onChangeText={setPostedBy}
        placeholder="e.g. Site Manager"
      />

      <Text style={styles.label}>Notice Image</Text>
      <TouchableOpacity style={styles.uploadBtn} onPress={pickPhoto}>
        <Text style={styles.uploadBtnText}>
          {photo ? 'Photo selected' : '+ Select notice image'}
        </Text>
      </TouchableOpacity>
      {photo && (
        <Image source={{ uri: photo.uri }} style={styles.preview} />
      )}
      {!photo && editing && notice.noticeImage ? (
        <Image source={{ uri: notice.noticeImage }} style={styles.preview} />
      ) : null}

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: accentColor }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveBtnText}>{editing ? 'Update Notice' : 'Post Notice'}</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={loading}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#fff', padding: 20 },
  title:           { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 24 },
  label:           { fontSize: 13, color: '#888', marginBottom: 6, marginTop: 12 },
  input:           { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15 },
  textArea:        { height: 110, textAlignVertical: 'top' },
  optionRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option:          { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  optionText:      { color: '#555', fontSize: 13 },
  optionTextActive:{ color: '#fff' },
  uploadBtn:       { borderWidth: 1, borderColor: '#1A5276', borderRadius: 8, padding: 12, alignItems: 'center', borderStyle: 'dashed', marginTop: 4 },
  uploadBtnText:   { color: '#1A5276', fontSize: 14 },
  preview:         { width: '100%', height: 180, borderRadius: 8, marginTop: 10 },
  saveBtn:         { borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  saveBtnText:     { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelBtn:       { marginTop: 12, alignItems: 'center', paddingVertical: 12, marginBottom: 40 },
  cancelText:      { fontSize: 15, color: '#94A3B8', fontWeight: '500' },
})