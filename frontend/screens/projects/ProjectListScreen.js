import React, { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, Image, StatusBar, ActivityIndicator
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { getAllProjects, deleteProject } from '../../services/projectService'

const STATUS_COLOR = {
  Active:    { bg: '#E8F5E9', text: '#2E7D32' },
  'On Hold': { bg: '#FFF8E1', text: '#F57F17' },
  Completed: { bg: '#E3F2FD', text: '#1565C0' },
}

export default function ProjectListScreen({ navigation }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProjects = async () => {
    try {
      const res = await getAllProjects()
      setProjects(res.data)
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Refresh list every time this screen comes into focus
  useFocusEffect(useCallback(() => { fetchProjects() }, []))

  const handleDelete = (id, name) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(id)
              setProjects(prev => prev.filter(p => p._id !== id))
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Delete failed')
            }
          }
        }
      ]
    )
  }

  const renderItem = ({ item }) => {
    const statusStyle = STATUS_COLOR[item.status] || STATUS_COLOR['Active']
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProjectDetail', { projectId: item._id })}
      >
        {/* Blueprint image or placeholder */}
        {item.blueprintImage ? (
          <Image source={{ uri: item.blueprintImage }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.placeholderIcon}>🏗️</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={styles.projectName} numberOfLines={1}>{item.projectName}</Text>
            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.badgeText, { color: statusStyle.text }]}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.meta}>📍 {item.location}</Text>
          <Text style={styles.meta}>👤 {item.clientName}</Text>
          {item.createdBy?.name && (
            <Text style={styles.metaLight}>Added by {item.createdBy.name}</Text>
          )}

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => navigation.navigate('ProjectForm', { project: item })}
            >
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleDelete(item._id, item.projectName)}
            >
              <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1B4332" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B4332" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Projects</Text>
          <Text style={styles.headerSub}>{projects.length} site{projects.length !== 1 ? 's' : ''} active</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('ProjectForm', { project: null })}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchProjects() }}
            tintColor="#1B4332"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No projects yet</Text>
            <Text style={styles.emptyText}>Tap "+ New" to add your first project</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F4F6F4' },
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6F4' },
  loadingText: { marginTop: 12, color: '#1B4332', fontSize: 14 },

  // Header
  header: {
    backgroundColor: '#1B4332',
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  headerSub:   { fontSize: 13, color: '#A8D5B5', marginTop: 2 },
  addBtn: {
    backgroundColor: '#52B788',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  // List
  list: { padding: 16, paddingBottom: 32 },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardImage: { width: '100%', height: 140, backgroundColor: '#E8F0E9' },
  cardImagePlaceholder: {
    width: '100%', height: 100,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: { fontSize: 36 },
  cardBody: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  projectName: { fontSize: 17, fontWeight: '700', color: '#1B2B1E', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  meta: { fontSize: 13, color: '#4A6B52', marginBottom: 3 },
  metaLight: { fontSize: 12, color: '#9DB8A2', marginTop: 2 },

  // Card actions
  cardActions: { flexDirection: 'row', marginTop: 14, gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  editBtn:   { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#52B788' },
  deleteBtn: { backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#E57373' },
  editBtnText:   { color: '#2E7D32', fontWeight: '600', fontSize: 13 },
  deleteBtnText: { color: '#C62828', fontWeight: '600', fontSize: 13 },

  // Empty state
  emptyBox:   { alignItems: 'center', paddingTop: 80 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1B4332', marginBottom: 6 },
  emptyText:  { fontSize: 14, color: '#7A9B82', textAlign: 'center' },
})