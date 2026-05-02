import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Image
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../../services/api'
import { colors, common, typography } from '../../theme'

export default function EquipmentFormScreen({ navigation, route }) {
  const { equipment, token } = route.params
  const editing = equipment !== null

  const [name,      setName]      = useState(editing ? equipment.name      : '')
  const [type,      setType]      = useState(editing ? equipment.type      : 'Heavy')
  const [condition, setCondition] = useState(editing ? equipment.condition : 'Good')
  const [quantity,  setQuantity]  = useState(editing ? String(equipment.quantity) : '')
  const [photo,     setPhoto]     = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState({})

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
    if (!name.trim())   e.name     = 'Equipment name is required'
    if (!quantity.trim()) e.quantity = 'Quantity is required'
    else if (isNaN(quantity) || Number(quantity) < 0) e.quantity = 'Quantity must be a valid number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name',      name.trim())
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
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to save equipment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={common.formContainer}>

      <Text style={typography.sectionTitle}>
        {editing ? 'Edit Equipment' : 'Add Equipment'}
      </Text>

      {/* Name */}
      <Text style={typography.label}>
        Equipment Name <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput
        style={[common.input, errors.name && common.inputError]}
        value={name}
        onChangeText={t => {
          setName(t)
          if (errors.name) setErrors(e => ({ ...e, name: '' }))
        }}
        placeholder="e.g. Excavator"
        placeholderTextColor={colors.textLight}
      />
      {errors.name ? <Text style={typography.errorText}>{errors.name}</Text> : null}

      {/* Type */}
      <Text style={typography.label}>Type</Text>
      <View style={common.optionRow}>
        {['Heavy', 'Tool', 'Material'].map(t => (
          <TouchableOpacity
            key={t}
            style={[common.option, type === t && common.optionActive]}
            onPress={() => setType(t)}
          >
            <Text style={[common.optionText, type === t && common.optionTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Condition */}
      <Text style={typography.label}>Condition</Text>
      <View style={common.optionRow}>
        {['Good', 'Fair', 'Poor'].map(c => (
          <TouchableOpacity
            key={c}
            style={[common.option, condition === c && common.optionActive]}
            onPress={() => setCondition(c)}
          >
            <Text style={[common.optionText, condition === c && common.optionTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quantity */}
      <Text style={typography.label}>
        Quantity <Text style={{ color: colors.danger }}>*</Text>
      </Text>
      <TextInput
        style={[common.input, errors.quantity && common.inputError]}
        value={quantity}
        onChangeText={t => {
          setQuantity(t)
          if (errors.quantity) setErrors(e => ({ ...e, quantity: '' }))
        }}
        placeholder="e.g. 3"
        placeholderTextColor={colors.textLight}
        keyboardType="numeric"
      />
      {errors.quantity ? <Text style={typography.errorText}>{errors.quantity}</Text> : null}

      {/* Photo */}
      <Text style={typography.label}>Equipment Photo</Text>
      <TouchableOpacity style={common.uploadBtn} onPress={pickPhoto}>
        <Text style={common.uploadBtnText}>
          {photo ? '✓ Photo selected' : '+ Select equipment photo'}
        </Text>
      </TouchableOpacity>
      {photo && (
        <Image source={{ uri: photo.uri }} style={common.imagePreview} />
      )}
      {editing && equipment.equipmentImg && !photo && (
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
              {editing ? 'Update Equipment' : 'Save Equipment'}
            </Text>
        }
      </TouchableOpacity>

    </ScrollView>
  )
}

const styles = StyleSheet.create({})