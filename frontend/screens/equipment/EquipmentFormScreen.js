import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'

export default function EquipmentFormScreen({ navigation, route }) {
  const { equipment, token } = route.params
  const editing = equipment !== null

  const [name,      setName]      = useState(editing ? equipment.name      : '')
  const [type,      setType]      = useState(editing ? equipment.type      : 'Heavy')
  const [condition, setCondition] = useState(editing ? equipment.condition : 'Good')
  const [quantity,  setQuantity]  = useState(editing ? String(equipment.quantity) : '')
  const [photo,     setPhoto]     = useState(null)
  const [loading,   setLoading]   = useState(false)

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
    if (!name || !type || !quantity) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }
    if (isNaN(quantity) || Number(quantity) < 0) {
      Alert.alert('Error', 'Quantity must be a valid number')
      return
    }
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name',      name)
      formData.append('type',      type)
      formData.append('condition', condition)
      formData.append('quantity',  quantity)

      if (photo) {
        formData.append('equipmentImg', {
          uri:  photo.uri,
          type: 'image/jpeg',
          name: 'equipment.jpg'
        })
      }

      const config = {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }

      if (editing) {
        await api.put(`/equipment/${equipment._id}`, formData, config)
      } else {
        await api.post('/equipment', formData, config)
      }

      Alert.alert('Success', editing ? 'Equipment updated!' : 'Equipment added!')
      navigation.goBack()
    } catch (error) {
      console.log('Save error:', error)
      console.log('Error response:', error.response?.data)
      console.log('Error message:', error.message)
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to save equipment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{editing ? 'Edit Equipment' : 'Add Equipment'}</Text>

      <Text style={styles.label}>Equipment Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Excavator"
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.optionRow}>
        {['Heavy', 'Tool', 'Material'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.option, type === t && styles.optionActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.optionText, type === t && styles.optionTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Condition</Text>
      <View style={styles.optionRow}>
        {['Good', 'Fair', 'Poor'].map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.option, condition === c && styles.optionActive]}
            onPress={() => setCondition(c)}
          >
            <Text style={[styles.optionText, condition === c && styles.optionTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="e.g. 3"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Equipment Photo</Text>
      <TouchableOpacity style={styles.uploadBtn} onPress={pickPhoto}>
        <Text style={styles.uploadBtnText}>
          {photo ? 'Photo selected ✓' : '+ Select equipment photo'}
        </Text>
      </TouchableOpacity>
      {photo && (
        <Image source={{ uri: photo.uri }} style={styles.preview} />
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveBtnText}>{editing ? 'Update Equipment' : 'Save Equipment'}</Text>
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