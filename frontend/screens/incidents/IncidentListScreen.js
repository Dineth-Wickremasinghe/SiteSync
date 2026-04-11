import React, { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'

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

  useFocusEffect(
    useCallback(() => {
      fetchIncidents()
    }, [])
  )

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
      default:       return { bg: '#EAF3DE', text: '#3B6D11' }
    }
  }

  const renderIncident = ({ item }) => {
    const severityStyle = getSeverityStyle(item.severity)
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {item.incidentImg ? (
            <Image source={{ uri: item.incidentImg }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>⚠️</Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.sub} numberOfLines={2}>{item.description}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: severityStyle.bg }]}>
                <Text style={[styles.badgeText, { color: severityStyle.text }]}>
                  {item.severity}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: item.status === 'Resolved' ? '#EAF3DE' : '#FDEDEC' }]}>
                <Text style={[styles.badgeText, { color: item.status === 'Resolved' ? '#3B6D11' : '#922B21' }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('IncidentForm', { incident: item, token })}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deleteIncident(item._id)}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A5276" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('IncidentForm', { incident: null, token })}
      >
        <Text style={styles.addBtnText}>+ Report Incident</Text>
      </TouchableOpacity>

      {incidents.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No incidents reported yet.</Text>
        </View>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={item => item._id}
          renderItem={renderIncident}
          contentContainerStyle={{ paddingBottom: 20 }}
          onRefresh={fetchIncidents}
          refreshing={loading}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  center:               { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addBtn:               { backgroundColor: '#1A5276', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 16 },
  addBtnText:           { color: '#fff', fontSize: 15, fontWeight: '600' },
  card:                 { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10 },
  cardTop:              { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  photo:                { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  photoPlaceholder:     { width: 56, height: 56, borderRadius: 8, backgroundColor: '#FDEDEC', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  photoPlaceholderText: { fontSize: 22 },
  cardInfo:             { flex: 1 },
  name:                 { fontSize: 15, fontWeight: '600', color: '#1B2631', marginBottom: 2 },
  sub:                  { fontSize: 13, color: '#888', marginBottom: 6 },
  badgeRow:             { flexDirection: 'row', gap: 6 },
  badge:                { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText:            { fontSize: 11, fontWeight: '500' },
  cardActions:          { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  editBtn:              { backgroundColor: '#D6EAF8', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 7 },
  editBtnText:          { color: '#1A5276', fontSize: 13, fontWeight: '500' },
  deleteBtn:            { backgroundColor: '#FCEBEB', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 7 },
  deleteBtnText:        { color: '#A32D2D', fontSize: 13, fontWeight: '500' },
  emptyText:            { color: '#888', fontSize: 15 }
})