import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'
import { colors, common, typography } from '../../theme'

const MAX_WORK_DONE = 500

export default function ReportFormScreen({ navigation, route }) {
  const { report, token } = route.params
  const editing = report !== null

  const today = new Date().toISOString().substring(0, 10)

  const [projectName, setProjectName] = useState(editing ? report.projectName : '')
  const [reportDate,  setReportDate]  = useState(editing ? report.reportDate.substring(0, 10) : today)
  const [workDone,    setWorkDone]    = useState(editing ? report.workDone    : '')
  const [workerCount, setWorkerCount] = useState(editing ? Number(report.workerCount) : 1)
  const [photo,       setPhoto]       = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [errors,      setErrors]      = useState({})
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [pickerYear,  setPickerYear]  = useState(today.substring(0, 4))
  const [pickerMonth, setPickerMonth] = useState(today.substring(5, 7))
  const [pickerDay,   setPickerDay]   = useState(today.substring(8, 10))

  const applyDate = () => {
    const built = `${pickerYear}-${pickerMonth.padStart(2,'0')}-${pickerDay.padStart(2,'0')}`
    if (built > today) {
      Alert.alert('Invalid Date', 'Report date cannot be a future date')
      return
    }
    setReportDate(built)
    setErrors(e => ({ ...e, reportDate: '' }))
    setShowDatePicker(false)
  }

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

  // stepper helpers
  const increment = () => setWorkerCount(c => c + 1)
  const decrement = () => setWorkerCount(c => (c > 0 ? c - 1 : 0))

  const validate = () => {
    const e = {}
    if (!projectName.trim()) e.projectName = 'Project name is required'
    if (!reportDate.trim()) {
      e.reportDate = 'Report date is required'
    } else if (reportDate > today) {
      e.reportDate = 'Report date cannot be a future date'
    }
    if (!workDone.trim()) e.workDone = 'Work done description is required'
    if (workerCount < 0)  e.workerCount = 'Worker count cannot be negative'
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
      formData.append('workerCount', String(workerCount))

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

      {/* ── Project Name ── */}
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

      {/* ── Report Date picker ── */}
      <Text style={typography.label}>
        Report Date <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TouchableOpacity
        style={[styles.datePicker, errors.reportDate && common.inputError]}
        onPress={() => setShowDatePicker(v => !v)}
      >
        <Text style={styles.datePickerText}>📅  {reportDate}</Text>
        <Text style={styles.datePickerHint}>Tap to change</Text>
      </TouchableOpacity>
      {errors.reportDate ? <Text style={typography.errorText}>{errors.reportDate}</Text> : null}

      {showDatePicker && (
        <View style={styles.datePanel}>
          <Text style={styles.datePanelTitle}>Select Date (up to today: {today})</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>Year</Text>
              <TextInput
                style={styles.dateFieldInput}
                value={pickerYear}
                onChangeText={setPickerYear}
                keyboardType="numeric"
                maxLength={4}
                placeholderTextColor={colors.textLight}
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>Month</Text>
              <TextInput
                style={styles.dateFieldInput}
                value={pickerMonth}
                onChangeText={setPickerMonth}
                keyboardType="numeric"
                maxLength={2}
                placeholderTextColor={colors.textLight}
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>Day</Text>
              <TextInput
                style={styles.dateFieldInput}
                value={pickerDay}
                onChangeText={setPickerDay}
                keyboardType="numeric"
                maxLength={2}
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
          <View style={styles.dateActions}>
            <TouchableOpacity style={styles.dateCancelBtn} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.dateCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateConfirmBtn} onPress={applyDate}>
              <Text style={styles.dateConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Work Done with character counter ── */}
      <Text style={typography.label}>
        Work Done <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput
        style={[common.input, common.textArea, errors.workDone && common.inputError]}
        value={workDone}
        onChangeText={t => {
          if (t.length <= MAX_WORK_DONE) {
            setWorkDone(t)
            if (errors.workDone) setErrors(e => ({ ...e, workDone: '' }))
          }
        }}
        placeholder="Describe work completed today..."
        placeholderTextColor={colors.textLight}
        multiline
        numberOfLines={4}
      />
      <Text style={[
        styles.charCounter,
        workDone.length > MAX_WORK_DONE * 0.9 && { color: colors.warning },
        workDone.length >= MAX_WORK_DONE       && { color: colors.danger }
      ]}>
        {workDone.length} / {MAX_WORK_DONE}
      </Text>
      {errors.workDone ? <Text style={typography.errorText}>{errors.workDone}</Text> : null}

      {/* ── Worker Count stepper with editable input ── */}
      <Text style={typography.label}>
        Worker Count <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <View style={styles.stepper}>
        <TouchableOpacity style={styles.stepperBtn} onPress={decrement}>
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.stepperInput}
          value={String(workerCount)}
          onChangeText={t => {
            const num = parseInt(t) || 0
            setWorkerCount(num >= 0 ? num : 0)
          }}
          keyboardType="numeric"
          selectTextOnFocus
        />
        <TouchableOpacity style={styles.stepperBtn} onPress={increment}>
          <Text style={styles.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.stepperHint}>Tap number to type directly, or use +/− buttons</Text>
      {errors.workerCount ? <Text style={typography.errorText}>{errors.workerCount}</Text> : null}

      {/* ── Progress Photo ── */}
      <Text style={typography.label}>Progress Photo</Text>

      {editing && report.reportPhoto && !photo && (
        <View style={styles.existingPhotoContainer}>
          <Image source={{ uri: report.reportPhoto }} style={styles.existingPhoto} />
          <Text style={styles.existingPhotoLabel}>Current photo — kept unless replaced</Text>
        </View>
      )}

      {photo ? (
        <View style={styles.photoPreviewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
          <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setPhoto(null)}>
            <Text style={styles.removePhotoBtnText}>✕ Remove photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.photoPickerBtn} onPress={pickPhoto}>
          <Text style={styles.photoPickerIcon}>📷</Text>
          <Text style={styles.photoPickerText}>
            {editing && report.reportPhoto ? 'Replace photo' : 'Select progress photo'}
          </Text>
          <Text style={styles.photoPickerSub}>JPEG · up to 5MB</Text>
        </TouchableOpacity>
      )}

      {/* ── Save ── */}
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

const styles = StyleSheet.create({
  datePicker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.inputBg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  datePickerText: { fontSize: 15, color: colors.textDark },
  datePickerHint: { fontSize: 11, color: colors.textLight },
  datePanel: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePanelTitle: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  dateRow:        { flexDirection: 'row', gap: 10, marginBottom: 14 },
  dateField:      { flex: 1 },
  dateFieldLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  dateFieldInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    color: colors.textDark,
    backgroundColor: colors.inputBg,
    fontSize: 15,
    textAlign: 'center',
  },
  dateActions:     { flexDirection: 'row', gap: 10 },
  dateCancelBtn:   { flex: 1, padding: 10, borderRadius: 8, backgroundColor: colors.inputBg, alignItems: 'center' },
  dateCancelText:  { color: colors.textMuted, fontWeight: '600' },
  dateConfirmBtn:  { flex: 1, padding: 10, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center' },
  dateConfirmText: { color: colors.background, fontWeight: '700' },
  charCounter:     { fontSize: 11, color: colors.textLight, textAlign: 'right', marginTop: 4 },

  // Stepper with editable input
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 4,
  },
  stepperBtn: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
  },
  stepperBtnText: { fontSize: 24, color: colors.primary, fontWeight: '700' },
  stepperInput: {
    flex: 1,
    height: 56,
    fontSize: 28,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
    backgroundColor: colors.background,
  },
  stepperHint: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 4,
  },

  // Photo
  photoPickerBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    marginTop: 4,
  },
  photoPickerIcon: { fontSize: 28, marginBottom: 6 },
  photoPickerText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  photoPickerSub:  { color: colors.textLight, fontSize: 11, marginTop: 4 },
  photoPreviewContainer: { marginTop: 10 },
  photoPreview:          { width: '100%', height: 200, borderRadius: 10 },
  removePhotoBtn:        {
    marginTop: 8,
    backgroundColor: colors.dangerLight,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  removePhotoBtnText:     { color: colors.danger, fontWeight: '600', fontSize: 13 },
  existingPhotoContainer: { marginBottom: 10 },
  existingPhoto:          { width: '100%', height: 160, borderRadius: 10, marginBottom: 4 },
  existingPhotoLabel:     { fontSize: 11, color: colors.textLight, textAlign: 'center' },
})