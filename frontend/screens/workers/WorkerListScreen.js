import React, { useState, useCallback, useMemo } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image,
  TextInput
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'
import { colors, common, typography } from '../../theme'

const TRADES   = ['All', 'Mason', 'Electrician', 'Plumber', 'General']
const STATUSES = ['All', 'Active', 'Inactive']
const SORTS    = ['Name', 'Trade', 'Status']

export default function WorkerListScreen({ navigation, token }) {
  const [workers,        setWorkers]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [search,         setSearch]         = useState('')
  const [selectedTrade,  setSelectedTrade]  = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [sortBy,         setSortBy]         = useState('Name')

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

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    workers.length,
    active:   workers.filter(w => w.status === 'Active').length,
    inactive: workers.filter(w => w.status === 'Inactive').length,
    linked:   workers.filter(w => w.userId).length,
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

  // ── Render card ───────────────────────────────────────────────────────────
  const renderWorker = ({ item }) => (
    <View style={common.card}>
      <View style={styles.cardTop}>
        {item.idPhotoUrl ? (
          <Image source={{ uri: item.idPhotoUrl }} style={common.photo} />
        ) : (
          <View style={common.photoPlaceholder}>
            <Text style={common.photoPlaceholderText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={typography.cardTitle}>{item.name}</Text>
          <Text style={typography.cardSubtitle}>{item.trade} · {item.phone}</Text>
          <View style={styles.badgeRow}>
            <View style={[common.badge, item.status === 'Active' ? common.badgeGreen : common.badgeGray]}>
              <Text style={[common.badgeText, item.status === 'Active' ? common.badgeTextGreen : common.badgeTextGray]}>
                {item.status}
              </Text>
            </View>
            {item.userId && (
              <View style={styles.badgeLinked}>
                <Text style={styles.badgeLinkedText}>
                  🔗 {item.userId?.name || item.userId?.email || 'Linked'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={common.cardActions}>
        <TouchableOpacity
          style={common.editBtn}
          onPress={() => navigation.navigate('WorkerFormScreen', { worker: item, token })}
        >
          <Text style={common.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={common.deleteBtn}
          onPress={() => deleteWorker(item._id)}
        >
          <Text style={common.deleteBtnText}>Delete</Text>
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
            <Text style={[styles.statNumber, { color: colors.success }]}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.textMuted }]}>{stats.inactive}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.linked}</Text>
            <Text style={styles.statLabel}>Linked</Text>
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
          placeholderTextColor={colors.textLight}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Trade filter ── */}
      <Text style={styles.filterLabel}>Trade</Text>
      <View style={common.optionRow}>
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
      <Text style={[styles.filterLabel, { marginTop: 14 }]}>Status</Text>
      <View style={common.optionRow}>
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
      <Text style={[styles.filterLabel, { marginTop: 14 }]}>Sort by</Text>
      <View style={common.optionRow}>
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
      <View style={common.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={common.screenContainer}>
      {/* ── Header ── */}
      <View style={common.header}>
        <View>
          <Text style={typography.screenTitle}>Workers</Text>
          <Text style={typography.screenSubtitle}>
            {stats.total} worker{stats.total !== 1 ? 's' : ''} · {stats.active} active
          </Text>
        </View>
        <TouchableOpacity
          style={common.addBtn}
          onPress={() => navigation.navigate('WorkerFormScreen', { worker: null, token })}
        >
          <Text style={common.addBtnText}>+ Add</Text>
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
          <View style={common.center}>
            <Text style={common.emptyIcon}>🔍</Text>
            <Text style={typography.emptyText}>
              {workers.length === 0 ? 'No workers yet. Add one!' : 'No workers match your search.'}
            </Text>
          </View>
        }
      />
    </View>
  )
}

// Only screen-specific styles remain here
const styles = StyleSheet.create({
  cardTop:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardInfo: { flex: 1 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  badgeLinked:     { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: colors.primaryLight },
  badgeLinkedText: { fontSize: 11, fontWeight: '500', color: colors.primary },

  statsCard:   { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  statsRow:    { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 },
  statItem:    { alignItems: 'center' },
  statNumber:  { fontSize: 28, fontWeight: '800', color: colors.primary },
  statLabel:   { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.borderLight },
  tradeRow:    { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderLight },
  tradeItem:   { alignItems: 'center' },
  tradeCount:  { fontSize: 18, fontWeight: '700', color: colors.primary },
  tradeLabel:  { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  searchBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, elevation: 1 },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: colors.textDark },
  clearSearch: { fontSize: 14, color: colors.textLight, paddingLeft: 8 },

  filterLabel:    { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginBottom: 6 },
  resultsText:    { fontSize: 12, color: colors.textMuted, marginBottom: 12, marginTop: 14 },

  chip:           { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: colors.card },
  chipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:       { fontSize: 13, color: '#555' },
  chipTextActive: { color: colors.card },
})