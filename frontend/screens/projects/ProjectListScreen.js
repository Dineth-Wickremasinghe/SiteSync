import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, Image, StatusBar, ActivityIndicator,
  TextInput, Modal
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'
import { colors, typography, common } from '../../theme'
import ProjectStatsCard from './ProjectStatsCard'

const STATUS_COLOR = {
  Active: { bg: colors.successLight, text: colors.success },
  'On Hold': { bg: colors.warningLight, text: colors.warning },
  Completed: { bg: '#1E3A5F', text: '#60A5FA' }
}

const STATUS_FILTERS = ['All', 'Active', 'On Hold', 'Completed']

export default function ProjectListScreen({ navigation, token }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [showStats, setShowStats] = useState(true)
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  
  const isInitialMount = useRef(true)
  const isFilterOrSearchChange = useRef(false)

  // Debounce search: Wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== debouncedSearch) {
        setDebouncedSearch(searchQuery)
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchProjects = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      
      let url = '/projects?'
      const params = []
      
      if (selectedStatus && selectedStatus !== 'All') {
        params.push(`status=${encodeURIComponent(selectedStatus)}`)
      }
      
      if (debouncedSearch && debouncedSearch.trim()) {
        params.push(`search=${encodeURIComponent(debouncedSearch.trim())}`)
      }
      
      url += params.join('&')
      
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const projectsData = res.data.projects || res.data
      setProjects(projectsData)
      setStatsRefreshTrigger(prev => prev + 1)
      
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message)
      Alert.alert('Error', err.response?.data?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Handle filter changes (status filter)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    fetchProjects(true)
  }, [selectedStatus])

  // Handle search changes (debounced)
  useEffect(() => {
    if (isInitialMount.current) {
      return
    }
    fetchProjects(true)
  }, [debouncedSearch])

  // Initial load
  useEffect(() => {
    fetchProjects(true)
  }, [])

  // Refresh when screen comes into focus (after returning from detail/form)
  useFocusEffect(
    useCallback(() => {
      fetchProjects(true)
      return () => {}
    }, [])
  )

  const filterByStatus = (status) => {
    setSelectedStatus(status)
    setShowFilter(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setDebouncedSearch('')
    setIsSearching(false)
    fetchProjects(true)
  }

  const clearAllFilters = () => {
    setSelectedStatus('All')
    setSearchQuery('')
    setDebouncedSearch('')
    setIsSearching(false)
    fetchProjects(true)
  }

  const handleSearchChange = (text) => {
    setSearchQuery(text)
    setIsSearching(true)
  }

  const handleSearchSubmit = () => {
    setDebouncedSearch(searchQuery)
    setIsSearching(false)
  }

  const handleDelete = async (id, name) => {
    Alert.alert('Delete Project', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/projects/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            fetchProjects(true)
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete')
          }
        }
      }
    ])
  }

  const renderItem = ({ item }) => {
    const statusStyle = STATUS_COLOR[item.status] || STATUS_COLOR.Active

    return (
      <TouchableOpacity
        style={[common.card, styles.card]}
        onPress={() => navigation.navigate('ProjectDetail', { projectId: item._id, token })}
        activeOpacity={0.85}
      >
        {item.blueprintImage ? (
          <Image source={{ uri: item.blueprintImage }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.placeholderIcon}>🏗️</Text>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={typography.cardTitle}>{item.projectName}</Text>
            <View style={[common.badge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[common.badgeText, { color: statusStyle.text }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={typography.cardSubtitle}>📍 {item.location}</Text>
          <Text style={typography.cardSubtitle}>👤 {item.clientName}</Text>
          <Text style={[typography.cardSubtitle, styles.dateText]}>
            📅 {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          
          <View style={common.cardActions}>
            <TouchableOpacity
              style={common.editBtn}
              onPress={() => navigation.navigate('ProjectForm', { project: item, token })}
            >
              <Text style={common.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={common.deleteBtn}
              onPress={() => handleDelete(item._id, item.projectName)}
            >
              <Text style={common.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Show loading only on first load
  if (loading && projects.length === 0) {
    return (
      <View style={[common.center, common.screenContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
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
            {projects.length} project{projects.length !== 1 ? 's' : ''}
            {selectedStatus !== 'All' && ` • Filter: ${selectedStatus}`}
            {debouncedSearch ? ` • Search: "${debouncedSearch}"` : ''}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          {(selectedStatus !== 'All' || searchQuery) && (
            <TouchableOpacity style={styles.clearAllBtn} onPress={clearAllFilters}>
              <Text style={styles.clearAllBtnText}>Clear</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={common.addBtn}
            onPress={() => navigation.navigate('ProjectForm', { project: null, token })}
          >
            <Text style={common.addBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => setShowStats(!showStats)} style={styles.statsToggle}>
        <Text style={styles.statsToggleText}>
          {showStats ? '▼ Hide Stats' : '▶ Show Dashboard'}
        </Text>
      </TouchableOpacity>
      
      {showStats && (
        <View style={{ paddingHorizontal: 16 }}>
          <ProjectStatsCard 
            token={token} 
            refreshTrigger={statsRefreshTrigger}
            onFilterByStatus={filterByStatus}
          />
        </View>
      )}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search by name, location or client..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity style={styles.clearBtn} onPress={clearSearch}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.filterBtn, selectedStatus !== 'All' && styles.filterBtnActive]} 
            onPress={() => setShowFilter(true)}
          >
            <Text style={styles.filterBtnText}>
              {selectedStatus === 'All' ? '⚡ Filter' : selectedStatus}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Typing indicator - shows while waiting for debounce */}
      {isSearching && searchQuery.length > 0 && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.typingText}>Searching...</Text>
        </View>
      )}

      <FlatList
        data={projects}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchProjects(true) }}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={[common.center, styles.emptyContainer]}>
            <Text style={typography.emptyText}>No projects found</Text>
            {(selectedStatus !== 'All' || debouncedSearch) && (
              <TouchableOpacity onPress={clearAllFilters} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>Clear filters to see all projects</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <Modal 
        visible={showFilter} 
        transparent 
        animationType="slide" 
        onRequestClose={() => setShowFilter(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Status</Text>
            {STATUS_FILTERS.map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  selectedStatus === status && styles.filterOptionActive
                ]}
                onPress={() => filterByStatus(status)}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedStatus === status && styles.filterOptionTextActive
                ]}>
                  {status}
                  {selectedStatus === status && ' ✓'}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowFilter(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 32 },
  card: { 
    marginBottom: 12, 
    padding: 0, 
    overflow: 'hidden',
    borderRadius: 12
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderIcon: {
    fontSize: 36,
  },
  placeholderText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  cardBody: {
    padding: 14,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  dateText: { 
    marginTop: 4, 
    fontSize: 11 
  },
  searchContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    marginBottom: 12, 
    gap: 8 
  },
  searchInput: { 
    flex: 1, 
    backgroundColor: colors.inputBg, 
    borderRadius: 10, 
    padding: 12, 
    color: colors.textDark, 
    fontSize: 14 
  },
  filterBtn: { 
    backgroundColor: colors.primary, 
    borderRadius: 10, 
    paddingHorizontal: 16, 
    justifyContent: 'center' 
  },
  filterBtnActive: {
    backgroundColor: colors.success,
  },
  filterBtnText: { 
    color: colors.background, 
    fontWeight: 'bold' 
  },
  clearBtn: { 
    backgroundColor: colors.dangerLight, 
    borderRadius: 10, 
    width: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  clearBtnText: { 
    color: colors.danger, 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  statsToggle: { 
    alignItems: 'center', 
    paddingVertical: 8, 
    marginBottom: 4 
  },
  statsToggleText: { 
    color: colors.primary, 
    fontSize: 12 
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 8,
  },
  typingText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 8,
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: colors.card, 
    borderRadius: 20, 
    padding: 20, 
    width: '80%' 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: colors.textDark, 
    marginBottom: 16, 
    textAlign: 'center' 
  },
  filterOption: { 
    padding: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border, 
    alignItems: 'center' 
  },
  filterOptionActive: { 
    backgroundColor: colors.primary + '20', 
    borderRadius: 10 
  },
  filterOptionText: { 
    color: colors.textDark, 
    fontSize: 16 
  },
  filterOptionTextActive: { 
    color: colors.primary, 
    fontWeight: 'bold' 
  },
  closeBtn: { 
    marginTop: 16, 
    padding: 12, 
    backgroundColor: colors.primary, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  closeBtnText: { 
    color: colors.background, 
    fontWeight: 'bold' 
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  clearAllBtn: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearAllBtnText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingTop: 50,
  },
  resetBtn: {
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  resetBtnText: {
    color: colors.background,
    fontWeight: 'bold',
  },
})