import React, { useState, useCallback, useMemo } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image, TextInput, ScrollView
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'
import { colors, common, typography } from '../../theme'

const FILTERS = ['All', 'Today', 'This Week', 'This Month']

export default function ReportListScreen({ navigation, token, role }) {
  const [reports,      setReports]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const isSupervisor = role === 'supervisor' || role === 'admin'
  const today = new Date().toISOString().substring(0, 10)

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

  // stats
  const totalCount   = reports.length
  const todayCount   = useMemo(() =>
    reports.filter(r => r.reportDate && r.reportDate.substring(0, 10) === today).length
  , [reports])
  const totalWorkers = useMemo(() =>
    reports.reduce((sum, r) => sum + (Number(r.workerCount) || 0), 0)
  , [reports])

  // date filter logic
  const getWeekStart = () => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().substring(0, 10)
  }
  const getMonthStart = () => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`
  }

  const filtered = useMemo(() => {
    let list = reports
    // apply date filter
    if (activeFilter === 'Today') {
      list = list.filter(r => r.reportDate && r.reportDate.substring(0, 10) === today)
    } else if (activeFilter === 'This Week') {
      list = list.filter(r => r.reportDate && r.reportDate.substring(0, 10) >= getWeekStart())
    } else if (activeFilter === 'This Month') {
      list = list.filter(r => r.reportDate && r.reportDate.substring(0, 10) >= getMonthStart())
    }
    // apply search on top
    if (search.trim()) {
      list = list.filter(r => r.projectName.toLowerCase().includes(search.toLowerCase()))
    }
    return list
  }, [reports, activeFilter, search])

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

  const getBorderColor = (reportDate) => {
    if (!reportDate) return colors.border
    const date = reportDate.substring(0, 10)
    if (date === today) return colors.success
    const diffDays = (new Date(today) - new Date(date)) / (1000 * 60 * 60 * 24)
    if (diffDays <= 7) return colors.warning
    return colors.borderLight
  }

  const renderReport = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: getBorderColor(item.reportDate) }]}
      onPress={() => navigation.navigate('ReportDetailScreen', { report: item, token, role })}
      activeOpacity={0.85}
    >
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
          <View style={styles.dateChip}>
            <Text style={styles.dateChipText}>📅 {
              new Date(item.reportDate).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
              })
            }</Text>
          </View>
          <Text style={styles.workDone} numberOfLines={2}>{item.workDone}</Text>
          <View style={[common.badge, common.badgeGreen]}>
            <Text style={[common.badgeText, common.badgeTextGreen]}>
              👷 {item.workerCount} workers
            </Text>
          </View>
        </View>
      </View>

      {isSupervisor && (
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
      )}
    </TouchableOpacity>
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
          <Text style={typography.screenTitle}>Daily Reports</Text>
          <Text style={typography.screenSubtitle}>
            {totalCount} total · {todayCount} today
          </Text>
        </View>
        {isSupervisor && (
          <TouchableOpacity
            style={common.addBtn}
            onPress={() => navigation.navigate('ReportFormScreen', { report: null, token })}
          >
            <Text style={common.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Stats bar ── */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{todayCount}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{totalWorkers}</Text>
          <Text style={styles.statLabel}>Total Workers</Text>
        </View>
      </View>

      {/* ── Search bar ── */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by project name..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filter chips ── */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
              {f}
            </Text>
            {activeFilter === f && filtered.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filtered.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Legend ── */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
          <Text style={styles.legendText}>This week</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.borderLight }]} />
          <Text style={styles.legendText}>Older</Text>
        </View>
        <Text style={styles.tapHint}>Tap card to view details</Text>
      </View>

      {/* ── List or empty state ── */}
      {filtered.length === 0 ? (
        <View style={common.center}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>
            {search || activeFilter !== 'All' ? 'No reports match' : 'No reports yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {search
              ? 'Try a different project name'
              : activeFilter !== 'All'
              ? `No reports for "${activeFilter}"`
              : isSupervisor
              ? 'Tap + Add to create the first report'
              : 'Reports will appear here once added'}
          </Text>
          {isSupervisor && !search && activeFilter === 'All' && (
            <TouchableOpacity
              style={[common.addBtn, { marginTop: 20 }]}
              onPress={() => navigation.navigate('ReportFormScreen', { report: null, token })}
            >
              <Text style={common.addBtnText}>+ Add First Report</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  cardTop:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardInfo: { flex: 1 },
  workDone: { fontSize: 13, color: colors.textMuted, marginBottom: 6 },
  dateChip: {
    backgroundColor: colors.inputBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  dateChipText: { fontSize: 11, color: colors.textMuted },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statNumber:  { fontSize: 22, fontWeight: '800', color: colors.textDark },
  statLabel:   { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: 8 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    margin: 16,
    marginBottom: 4,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon:  { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, color: colors.textDark, fontSize: 14, paddingVertical: 10 },
  clearBtn:    { color: colors.textMuted, fontSize: 14, paddingLeft: 8 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterChipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText:       { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  filterChipTextActive: { color: colors.background, fontWeight: '700' },
  filterBadge: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  filterBadgeText: { fontSize: 10, color: colors.primary, fontWeight: '700' },
  legend: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 4,
    alignItems: 'center',
  },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:   { width: 8, height: 8, borderRadius: 4 },
  legendText:  { fontSize: 11, color: colors.textLight },
  tapHint:     { marginLeft: 'auto', fontSize: 11, color: colors.textLight, fontStyle: 'italic' },
  emptyIcon:     { fontSize: 48, marginBottom: 12 },
  emptyTitle:    { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 32 },
})