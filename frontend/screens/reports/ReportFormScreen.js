import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'

export default function ReportFormScreen({ navigation, route }) {
  const { report, token } = route.params
  const editing = report !== null

  const [projectName, setProjectName] = useState(editing ? report.projectName : '')
  const [reportDate,  setReportDate]  = useState(editing ? report.reportDate  : '')
  const [workDone,    setWorkDone]    = useState(editing ? report.workDone    : '')
  const [workerCount, setWorkerCount] = useState(editing ? String(report.workerCount) : '')
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
    if (!projectName || !reportDate || !workDone || !workerCount) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('projectName', projectName)
      formData.append('reportDate',  reportDate)
      formData.append('workDone',    workDone)
      formData.append('workerCount', workerCount)

      if (photo) {
        formData.append('reportPhoto', {
          uri:  photo.uri,
          type: 'image/jpeg',
          name: 'reportphoto.jpg'
        })
      }

      const config = {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }

      if (editing) {
        await api.put(`/reports/${report._id}`, formData, config)
      } else {
        await api.post('/reports', formData, config)
      }

      Alert.alert('Success', editing ? 'Report updated!' : 'Report added!')
      navigation.goBack()
    } catch (error) {
      console.log('Save error:', error)
      console.log('Error response:', error.response?.data)
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to save report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{editing ? 'Edit Report' : 'Add Daily Report'}</Text>

      <Text style={styles.label}>Project Name</Text>
      <TextInput
        style={styles.input}
        value={projectName}
        onChangeText={setProjectName}
        placeholder="e.g. City Mall Construction"
      />

      <Text style={styles.label}>Report Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={reportDate}
        onChangeText={setReportDate}
        placeholder="e.g. 2026-04-03"
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.label}>Work Done</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={workDone}
        onChangeText={setWorkDone}
        placeholder="Describe work completed today..."
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Worker Count</Text>
      <TextInput
        style={styles.input}
        value={workerCount}
        onChangeText={setWorkerCount}
        placeholder="e.g. 12"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Progress Photo</Text>
      <TouchableOpacity style={styles.uploadBtn} onPress={pickPhoto}>
        <Text style={styles.uploadBtnText}>
          {photo ? '✓ Photo selected' : '+ Select progress photo'}
        </Text>
      </TouchableOpacity>
      {photo && (
        <Image source={{ uri: photo.uri }} style={styles.preview} />
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveBtnText}>{editing ? 'Update Report' : 'Save Report'}</Text>
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
  uploadBtn:        { borderWidth: 1, borderColor: '#1A5276', borderRadius: 8, padding: 12, alignItems: 'center', borderStyle: 'dashed', marginTop: 4 },
  uploadBtnText:    { color: '#1A5276', fontSize: 14 },
  preview:          { width: '100%', height: 180, borderRadius: 8, marginTop: 10 },
  saveBtn:          { backgroundColor: '#1A5276', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  saveBtnText:      { color: '#fff', fontSize: 15, fontWeight: '600' }
})
