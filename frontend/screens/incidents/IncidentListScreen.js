import React, { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'
import { colors, common, typography } from '../../theme'

export default function IncidentListScreen({ navigation, token }) {
  const [incidents, setIncidents] = useState([])
  const [loading,   setLoading]   = useState(true)

  const fetchIncidents = async () => {
    try {
      setLoading(true)
      const res = await api.get('/incidents', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIncidents(res.data)
    } catch (error) {
      Alert.alert('Error', 'Failed to load incidents')
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(useCallback(() => { fetchIncidents() }, []))

  const deleteIncident = async (id) => {
    Alert.alert('Confirm', 'Delete this incident?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/incidents/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            fetchIncidents()
          } catch (error) {
            Alert.alert('Error', 'Failed to delete incident')
          }
        }
      }
    ])
  }

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'High':   return { bg: '#FDEBD0', text: '#935116' }
      case 'Medium': return { bg: '#FEF9E7', text: '#9A7D0A' }
      default:       return { bg: colors.successLight, text: colors.success }
    }
  }

  const renderIncident = ({ item }) => {
    const severityStyle = getSeverityStyle(item.severity)
    return (
      <View style={common.card}>
        <View style={styles.cardTop}>
          {item.incidentImg ? (
            <Image source={{ uri: item.incidentImg }} style={common.photo} />
          ) : (
            <View style={[common.photoPlaceholder, { backgroundColor: colors.dangerLight }]}>
              <Text style={{ fontSize: 22 }}>⚠️</Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={typography.cardTitle}>{item.title}</Text>
            <Text style={typography.cardSubtitle} numberOfLines={2}>{item.description}</Text>
            <View style={styles.badgeRow}>
              <View style={[common.badge, { backgroundColor: severityStyle.bg }]}>
                <Text style={[common.badgeText, { color: severityStyle.text }]}>
                  {item.severity}
                </Text>
              </View>
              <View style={[common.badge, {
                backgroundColor: item.status === 'Resolved' ? colors.successLight : colors.dangerLight
              }]}>
                <Text style={[common.badgeText, {
                  color: item.status === 'Resolved' ? colors.success : colors.danger
                }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={common.cardActions}>
          <TouchableOpacity
            style={common.editBtn}
            onPress={() => navigation.navigate('IncidentFormScreen', { incident: item, token })}
          >
            <Text style={common.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={common.deleteBtn}
            onPress={() => deleteIncident(item._id)}
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
          <Text style={typography.screenTitle}>Incidents</Text>
          <Text style={typography.screenSubtitle}>
            {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={common.addBtn}
          onPress={() => navigation.navigate('IncidentFormScreen', { incident: null, token })}
        >
          <Text style={common.addBtnText}>+ Report</Text>
        </TouchableOpacity>
      </View>

      {incidents.length === 0 ? (
        <View style={common.center}>
          <Text style={common.emptyIcon}>⚠️</Text>
          <Text style={typography.emptyText}>No incidents reported yet.</Text>
        </View>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={item => item._id}
          renderItem={renderIncident}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          onRefresh={fetchIncidents}
          refreshing={loading}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  cardTop:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardInfo: { flex: 1 },
  badgeRow: { flexDirection: 'row', gap: 6 },
})