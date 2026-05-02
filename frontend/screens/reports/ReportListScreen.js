import React, { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'
import { colors, common, typography } from '../../theme'

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

  useFocusEffect(useCallback(() => { fetchReports() }, []))

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
    <View style={common.card}>
      <View style={styles.cardTop}>
        {item.reportPhoto ? (
          <Image source={{ uri: item.reportPhoto }} style={common.photo} />
        ) : (
          <View style={common.photoPlaceholder}>
            <Text style={common.photoPlaceholderText}>
              {item.projectName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={typography.cardTitle}>{item.projectName}</Text>
          <Text style={typography.cardSubtitle}>
            {new Date(item.reportDate).toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric'
            })}
          </Text>
          <Text style={styles.workDone} numberOfLines={2}>{item.workDone}</Text>
          <View style={[common.badge, common.badgeGreen]}>
            <Text style={[common.badgeText, common.badgeTextGreen]}>
              👷 {item.workerCount} workers
            </Text>
          </View>
        </View>
      </View>
      <View style={common.cardActions}>
        <TouchableOpacity
          style={common.editBtn}
          onPress={() => navigation.navigate('ReportFormScreen', { report: item, token })}
        >
          <Text style={common.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={common.deleteBtn}
          onPress={() => deleteReport(item._id)}
        >
          <Text style={common.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

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
          <Text style={typography.screenTitle}>Daily Reports</Text>
          <Text style={typography.screenSubtitle}>
            {reports.length} report{reports.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={common.addBtn}
          onPress={() => navigation.navigate('ReportFormScreen', { report: null, token })}
        >
          <Text style={common.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {reports.length === 0 ? (
        <View style={common.center}>
          <Text style={common.emptyIcon}>📋</Text>
          <Text style={typography.emptyText}>No reports found. Add one!</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item._id}
          renderItem={renderReport}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          onRefresh={fetchReports}
          refreshing={loading}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  cardTop:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardInfo: { flex: 1 },
  workDone: { fontSize: 13, color: colors.textMuted, marginBottom: 6 },
})