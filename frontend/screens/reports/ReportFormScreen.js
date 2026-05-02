import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'
import { colors, common, typography } from '../../theme'

export default function ReportFormScreen({ navigation, route }) {
  const { report, token } = route.params
  const editing = report !== null

  const [projectName, setProjectName] = useState(editing ? report.projectName : '')
  const [reportDate,  setReportDate]  = useState(editing ? report.reportDate.substring(0, 10) : new Date().toISOString().substring(0, 10))
  const [workDone,    setWorkDone]    = useState(editing ? report.workDone    : '')
  const [workerCount, setWorkerCount] = useState(editing ? String(report.workerCount) : '')
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
    if (!projectName.trim()) e.projectName = 'Project name is required'
    if (!reportDate.trim())  e.reportDate  = 'Report date is required'
    if (!workDone.trim())    e.workDone    = 'Work done description is required'
    if (!workerCount.trim()) e.workerCount = 'Worker count is required'
    else if (isNaN(workerCount) || Number(workerCount) < 0) e.workerCount = 'Enter a valid number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('projectName', projectName.trim())
      formData.append('reportDate',  reportDate.trim())
      formData.append('workDone',    workDone.trim())
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
    <ScrollView style={common.formContainer}>

      <Text style={typography.sectionTitle}>
        {editing ? 'Edit Report' : 'Add Daily Report'}
      </Text>

      {/* Project Name */}
      <Text style={typography.label}>
        Project Name <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput
        style={[common.input, errors.projectName && common.inputError]}
        value={projectName}
        onChangeText={t => {
          setProjectName(t)
          if (errors.projectName) setErrors(e => ({ ...e, projectName: '' }))
        }}
        placeholder="e.g. City Mall Construction"
        placeholderTextColor={colors.textLight}
      />
      {errors.projectName ? <Text style={typography.errorText}>{errors.projectName}</Text> : null}

      {/* Report Date */}
      <Text style={typography.label}>
        Report Date <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput
        style={[common.input, errors.reportDate && common.inputError]}
        value={reportDate}
        onChangeText={t => {
          setReportDate(t)
          if (errors.reportDate) setErrors(e => ({ ...e, reportDate: '' }))
        }}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textLight}
        keyboardType="numbers-and-punctuation"
      />
      {errors.reportDate ? <Text style={typography.errorText}>{errors.reportDate}</Text> : null}

      {/* Work Done */}
      <Text style={typography.label}>
        Work Done <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput
        style={[common.input, common.textArea, errors.workDone && common.inputError]}
        value={workDone}
        onChangeText={t => {
          setWorkDone(t)
          if (errors.workDone) setErrors(e => ({ ...e, workDone: '' }))
        }}
        placeholder="Describe work completed today..."
        placeholderTextColor={colors.textLight}
        multiline
        numberOfLines={4}
      />
      {errors.workDone ? <Text style={typography.errorText}>{errors.workDone}</Text> : null}

      {/* Worker Count */}
      <Text style={typography.label}>
        Worker Count <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput
        style={[common.input, errors.workerCount && common.inputError]}
        value={workerCount}
        onChangeText={t => {
          setWorkerCount(t)
          if (errors.workerCount) setErrors(e => ({ ...e, workerCount: '' }))
        }}
        placeholder="e.g. 12"
        placeholderTextColor={colors.textLight}
        keyboardType="numeric"
      />
      {errors.workerCount ? <Text style={typography.errorText}>{errors.workerCount}</Text> : null}

      {/* Photo */}
      <Text style={typography.label}>Progress Photo</Text>
      <TouchableOpacity style={common.uploadBtn} onPress={pickPhoto}>
        <Text style={common.uploadBtnText}>
          {photo ? '✓ Photo selected' : '+ Select progress photo'}
        </Text>
      </TouchableOpacity>
      {photo && (
        <Image source={{ uri: photo.uri }} style={common.imagePreview} />
      )}
      {editing && report.reportPhoto && !photo && (
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
              {editing ? 'Update Report' : 'Save Report'}
            </Text>
        }
      </TouchableOpacity>

    </ScrollView>
  )
}

const styles = StyleSheet.create({})