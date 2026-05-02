import React, { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image, Platform
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'
import { colors, common, typography } from '../../theme'

export default function EquipmentListScreen({ navigation, token }) {
  const [equipment, setEquipment] = useState([])
  const [loading,   setLoading]   = useState(true)

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const res = await api.get('/equipment', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEquipment(res.data)
    } catch (error) {
      Alert.alert('Error', 'Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(useCallback(() => { fetchEquipment() }, []))

  const deleteEquipment = async (id) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Delete this equipment?')
      if (!confirmed) return
      try {
        await api.delete(`/equipment/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchEquipment()
      } catch (error) {
        Alert.alert('Error', 'Failed to delete equipment')
      }
    } else {
      Alert.alert('Confirm', 'Delete this equipment?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/equipment/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
              fetchEquipment()
            } catch (error) {
              Alert.alert('Error', 'Failed to delete equipment')
            }
          }
        }
      ])
    }
  }

  const getConditionStyle = (condition) => {
    if (condition === 'Good') return { bg: { backgroundColor: colors.successLight }, text: { color: colors.success } }
    if (condition === 'Fair') return { bg: { backgroundColor: '#FEF9E7' },           text: { color: '#9A7D0A' } }
    if (condition === 'Poor') return { bg: { backgroundColor: colors.dangerLight },  text: { color: colors.danger } }
    return { bg: { backgroundColor: colors.borderLight }, text: { color: colors.textMuted } }
  }

  const renderEquipment = ({ item }) => {
    const condStyle = getConditionStyle(item.condition)
    return (
      <View style={common.card}>
        <View style={styles.cardTop}>
          {item.equipmentImg ? (
            <Image source={{ uri: item.equipmentImg }} style={common.photo} />
          ) : (
            <View style={common.photoPlaceholder}>
              <Text style={common.photoPlaceholderText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={typography.cardTitle}>{item.name}</Text>
            <Text style={typography.cardSubtitle}>{item.type} · Qty: {item.quantity}</Text>
            <View style={[common.badge, condStyle.bg]}>
              <Text style={[common.badgeText, condStyle.text]}>{item.condition}</Text>
            </View>
          </View>
        </View>
        <View style={common.cardActions}>
          <TouchableOpacity
            style={common.editBtn}
            onPress={() => navigation.navigate('EquipmentFormScreen', { equipment: item, token })}
          >
            <Text style={common.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={common.deleteBtn}
            onPress={() => deleteEquipment(item._id)}
          >
            <Text style={common.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={common.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={common.screenContainer}>
      <View style={common.header}>
        <View>
          <Text style={typography.screenTitle}>Equipment</Text>
          <Text style={typography.screenSubtitle}>
            {equipment.length} item{equipment.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={common.addBtn}
          onPress={() => navigation.navigate('EquipmentFormScreen', { equipment: null, token })}
        >
          <Text style={common.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {equipment.length === 0 ? (
        <View style={common.center}>
          <Text style={common.emptyIcon}>🔧</Text>
          <Text style={typography.emptyText}>No equipment found. Add one!</Text>
        </View>
      ) : (
        <FlatList
          data={equipment}
          keyExtractor={item => item._id}
          renderItem={renderEquipment}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          onRefresh={fetchEquipment}
          refreshing={loading}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  cardTop:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardInfo: { flex: 1 },
})