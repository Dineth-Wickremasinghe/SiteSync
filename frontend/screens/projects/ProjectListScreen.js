import React, { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, Image, StatusBar, ActivityIndicator
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'
import { colors, typography, common } from '../../theme'

const STATUS_COLOR = {
  Active:    { bg: colors.successLight, text: colors.success },
  'On Hold': { bg: colors.warningLight, text: colors.warning },
  Completed: { bg: '#1E3A5F',           text: '#60A5FA' },
}

export default function ProjectListScreen({ navigation, token }) {
  const [projects,   setProjects]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjects(res.data)
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(useCallback(() => { fetchProjects() }, []))

  const handleDelete = (id, name) => {
    Alert.alert('Delete Project', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/projects/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            setProjects(prev => prev.filter(p => p._id !== id))
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Delete failed')
          }
        }
      }
    ])
  }

  const renderItem = ({ item }) => {
    const statusStyle = STATUS_COLOR[item.status] || STATUS_COLOR['Active']
    return (
      <TouchableOpacity
        style={[common.card, styles.card]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProjectDetail', { projectId: item._id, token })}
      >
        {item.blueprintImage ? (
          <Image source={{ uri: item.blueprintImage }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.placeholderIcon}>🏗️</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={[typography.cardTitle, styles.projectName]} numberOfLines={1}>
              {item.projectName}
            </Text>
            <View style={[common.badge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[common.badgeText, { color: statusStyle.text }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={typography.cardSubtitle}>📍 {item.location}</Text>
          <Text style={typography.cardSubtitle}>👤 {item.clientName}</Text>
          {item.createdBy?.name && (
            <Text style={[typography.cardSubtitle, styles.metaLight]}>
              Added by {item.createdBy.name}
            </Text>
          )}
          <View style={[common.cardActions, styles.cardActions]}>
            <TouchableOpacity
              style={[common.editBtn, styles.actionBtn]}
              onPress={() => navigation.navigate('ProjectForm', { project: item, token })}
            >
              <Text style={common.editBtnText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[common.deleteBtn, styles.actionBtn]}
              onPress={() => handleDelete(item._id, item.projectName)}
            >
              <Text style={common.deleteBtnText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={[common.center, common.screenContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.cardSubtitle, { marginTop: 12 }]}>Loading projects...</Text>
      </View>
    )
  }

  return (
    <View style={common.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={common.header}>
        <View>
          <Text style={typography.screenTitle}>Projects</Text>
          <Text style={typography.screenSubtitle}>
            {projects.length} site{projects.length !== 1 ? 's' : ''} active
          </Text>
        </View>
        <TouchableOpacity
          style={common.addBtn}
          onPress={() => navigation.navigate('ProjectForm', { project: null, token })}
        >
          <Text style={common.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={projects}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchProjects() }}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={[common.center, styles.emptyBox]}>
            <Text style={common.emptyIcon}>📋</Text>
            <Text style={[typography.sectionTitle, styles.emptyTitle]}>No projects yet</Text>
            <Text style={typography.emptyText}>Tap "+ New" to add your first project</Text>
          </View>
        }
      />
    </View>
  )
}

// Screen-specific styles only
const styles = StyleSheet.create({
  list:                 { padding: 16, paddingBottom: 32 },
  card:                 { padding: 0, overflow: 'hidden' },
  cardImage:            { width: '100%', height: 140 },
  cardImagePlaceholder: { width: '100%', height: 100, backgroundColor: colors.inputBg, justifyContent: 'center', alignItems: 'center' },
  placeholderIcon:      { fontSize: 36 },
  cardBody:             { padding: 14 },
  cardHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  projectName:          { flex: 1, marginRight: 8 },
  metaLight:            { color: colors.textLight, fontSize: 12, marginTop: 2 },
  cardActions:          { marginTop: 12, justifyContent: 'flex-start' },
  actionBtn:            { flex: 1 },
  emptyBox:             { paddingTop: 80 },
  emptyTitle:           { fontSize: 18, marginBottom: 6 },
})