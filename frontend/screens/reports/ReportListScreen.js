import React, { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'

export default function ReportListScreen({ navigation, token }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await api.get('/reports', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReports(res.data)
    } catch (error) {
      Alert.alert('Error', 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchReports()
    }, [])
  )

  const deleteReport = async (id) => {
    Alert.alert('Confirm', 'Delete this report?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/reports/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            fetchReports()
          } catch (error) {
            Alert.alert('Error', 'Failed to delete report')
          }
        }
      }
    ])
  }

  const renderReport = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        {item.reportPhoto ? (
          <Image source={{ uri: item.reportPhoto }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>
              {item.projectName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.projectName}>{item.projectName}</Text>
          <Text style={styles.sub}>{item.reportDate}</Text>
          <Text style={styles.workDone} numberOfLines={2}>{item.workDone}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>👷 {item.workerCount} workers</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('ReportForm', { report: item, token })}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteReport(item._id)}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

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
        onPress={() => navigation.navigate('ReportForm', { report: null, token })}
      >
        <Text style={styles.addBtnText}>+ Add Daily Report</Text>
      </TouchableOpacity>

      {reports.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No reports found. Add one!</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item._id}
          renderItem={renderReport}
          contentContainerStyle={{ paddingBottom: 20 }}
          onRefresh={fetchReports}
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
  photoPlaceholder:     { width: 56, height: 56, borderRadius: 8, backgroundColor: '#D6EAF8', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  photoPlaceholderText: { fontSize: 22, fontWeight: 'bold', color: '#1A5276' },
  cardInfo:             { flex: 1 },
  projectName:          { fontSize: 15, fontWeight: '600', color: '#1B2631', marginBottom: 2 },
  sub:                  { fontSize: 12, color: '#888', marginBottom: 4 },
  workDone:             { fontSize: 13, color: '#555', marginBottom: 6 },
  badge:                { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: '#EAF3DE' },
  badgeText:            { fontSize: 11, fontWeight: '500', color: '#3B6D11' },
  cardActions:          { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  editBtn:              { backgroundColor: '#D6EAF8', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 7 },
  editBtnText:          { color: '#1A5276', fontSize: 13, fontWeight: '500' },
  deleteBtn:            { backgroundColor: '#FCEBEB', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 7 },
  deleteBtnText:        { color: '#A32D2D', fontSize: 13, fontWeight: '500' },
  emptyText:            { color: '#888', fontSize: 15 }
})
