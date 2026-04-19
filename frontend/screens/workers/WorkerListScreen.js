import React, { useState, useCallback, useMemo } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image,
  TextInput
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'

const TRADES   = ['All', 'Mason', 'Electrician', 'Plumber', 'General']
const STATUSES = ['All', 'Active', 'Inactive']
const SORTS    = ['Name', 'Trade', 'Status']

export default function WorkerListScreen({ navigation, token }) {
  const [workers,       setWorkers]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [selectedTrade, setSelectedTrade] = useState('All')
  const [selectedStatus,setSelectedStatus]= useState('All')
  const [sortBy,        setSortBy]        = useState('Name')

  const fetchWorkers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/workers', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWorkers(res.data)
    } catch (error) {
      Alert.alert('Error', 'Failed to load workers')
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(useCallback(() => { fetchWorkers() }, []))

  const deleteWorker = async (id) => {
    Alert.alert('Confirm', 'Delete this worker?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/workers/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            fetchWorkers()
          } catch (error) {
            Alert.alert('Error', 'Failed to delete worker')
          }
        }
      }
    ])
  }

  // ── Stats (calculated from full list, not filtered) ──────────────────────
  const stats = useMemo(() => ({
    total:    workers.length,
    active:   workers.filter(w => w.status === 'Active').length,
    inactive: workers.filter(w => w.status === 'Inactive').length,
    byTrade:  ['Mason', 'Electrician', 'Plumber', 'General'].map(t => ({
      trade: t,
      count: workers.filter(w => w.trade === t).length
    }))
  }), [workers])

  // ── Filter + Sort ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = workers.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
                            w.phone.includes(search)
      const matchesTrade  = selectedTrade  === 'All' || w.trade  === selectedTrade
      const matchesStatus = selectedStatus === 'All' || w.status === selectedStatus
      return matchesSearch && matchesTrade && matchesStatus
    })
    result = [...result].sort((a, b) => {
      if (sortBy === 'Name')   return a.name.localeCompare(b.name)
      if (sortBy === 'Trade')  return a.trade.localeCompare(b.trade)
      if (sortBy === 'Status') return a.status.localeCompare(b.status)
      return 0
    })
    return result
  }, [workers, search, selectedTrade, selectedStatus, sortBy])

  // ── Render ────────────────────────────────────────────────────────────────
  const renderWorker = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        {item.idPhotoUrl ? (
          <Image source={{ uri: item.idPhotoUrl }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.trade} · {item.phone}</Text>
          <View style={[styles.badge, item.status === 'Active' ? styles.badgeGreen : styles.badgeGray]}>
            <Text style={[styles.badgeText, item.status === 'Active' ? styles.badgeTextGreen : styles.badgeTextGray]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('WorkerFormScreen', { worker: item, token })}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteWorker(item._id)}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const ListHeader = () => (
    <>
      {/* ── Stats Card ── */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#3B6D11' }]}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#888' }]}>{stats.inactive}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>
        <View style={styles.tradeRow}>
          {stats.byTrade.map(({ trade, count }) => (
            <View key={trade} style={styles.tradeItem}>
              <Text style={styles.tradeCount}>{count}</Text>
              <Text style={styles.tradeLabel}>{trade}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#aaa"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Trade filter ── */}
      <Text style={styles.filterLabel}>Trade</Text>
      <View style={styles.chipRow}>
        {TRADES.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, selectedTrade === t && styles.chipActive]}
            onPress={() => setSelectedTrade(t)}
          >
            <Text style={[styles.chipText, selectedTrade === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Status filter ── */}
      <Text style={styles.filterLabel}>Status</Text>
      <View style={styles.chipRow}>
        {STATUSES.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, selectedStatus === s && styles.chipActive]}
            onPress={() => setSelectedStatus(s)}
          >
            <Text style={[styles.chipText, selectedStatus === s && styles.chipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Sort ── */}
      <Text style={styles.filterLabel}>Sort by</Text>
      <View style={styles.chipRow}>
        {SORTS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, sortBy === s && styles.chipActive]}
            onPress={() => setSortBy(s)}
          >
            <Text style={[styles.chipText, sortBy === s && styles.chipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Results count ── */}
      <Text style={styles.resultsText}>
        {filtered.length} of {workers.length} worker{workers.length !== 1 ? 's' : ''}
      </Text>
    </>
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
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Workers</Text>
          <Text style={styles.headerSub}>
            {stats.total} worker{stats.total !== 1 ? 's' : ''} · {stats.active} active
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('WorkerFormScreen', { worker: null, token })}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        renderItem={renderWorker}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        onRefresh={fetchWorkers}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              {workers.length === 0 ? 'No workers yet. Add one!' : 'No workers match your search.'}
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f5f5f5' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },

  // Header
  header: {
    backgroundColor: '#1A5276',
    paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 13, color: '#AED6F1', marginTop: 2 },
  addBtn:      { backgroundColor: '#2E86C1', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20 },
  addBtnText:  { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Stats card
  statsCard:   { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  statsRow:    { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 },
  statItem:    { alignItems: 'center' },
  statNumber:  { fontSize: 28, fontWeight: '800', color: '#1A5276' },
  statLabel:   { fontSize: 12, color: '#888', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#eee' },
  tradeRow:    { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  tradeItem:   { alignItems: 'center' },
  tradeCount:  { fontSize: 18, fontWeight: '700', color: '#1A5276' },
  tradeLabel:  { fontSize: 11, color: '#888', marginTop: 2 },

  // Search
  searchBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, elevation: 1 },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  clearSearch: { fontSize: 14, color: '#aaa', paddingLeft: 8 },

  // Filter chips
  filterLabel: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 6 },
  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip:        { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#fff' },
  chipActive:  { backgroundColor: '#1A5276', borderColor: '#1A5276' },
  chipText:    { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff' },

  // Results count
  resultsText: { fontSize: 12, color: '#888', marginBottom: 12 },

  // Card
  card:                 { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, elevation: 2 },
  cardTop:              { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  photo:                { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  photoPlaceholder:     { width: 56, height: 56, borderRadius: 8, backgroundColor: '#D6EAF8', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  photoPlaceholderText: { fontSize: 22, fontWeight: 'bold', color: '#1A5276' },
  cardInfo:             { flex: 1 },
  name:                 { fontSize: 15, fontWeight: '600', color: '#1B2631', marginBottom: 2 },
  sub:                  { fontSize: 13, color: '#888', marginBottom: 6 },
  badge:                { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeGreen:           { backgroundColor: '#EAF3DE' },
  badgeGray:            { backgroundColor: '#F1EFE8' },
  badgeText:            { fontSize: 11, fontWeight: '500' },
  badgeTextGreen:       { color: '#3B6D11' },
  badgeTextGray:        { color: '#5F5E5A' },
  cardActions:          { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  editBtn:              { backgroundColor: '#D6EAF8', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 7 },
  editBtnText:          { color: '#1A5276', fontSize: 13, fontWeight: '500' },
  deleteBtn:            { backgroundColor: '#FCEBEB', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 7 },
  deleteBtnText:        { color: '#A32D2D', fontSize: 13, fontWeight: '500' },

  // Empty
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#888', fontSize: 15, textAlign: 'center' },
})