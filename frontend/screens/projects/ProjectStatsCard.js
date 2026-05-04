import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import api from '../../services/api'
import { colors } from '../../theme'

export default function ProjectStatsCard({ token, refreshTrigger, onFilterByStatus }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Total') // Total, Active, On Hold, Completed

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await api.get('/projects/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data)
    } catch (error) {
      console.error('Stats error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [refreshTrigger])

  if (loading) return <ActivityIndicator color={colors.primary} />

  // Get count based on active tab
  const getActiveCount = () => {
    switch(activeTab) {
      case 'Total': return stats?.total || 0
      case 'Active': return stats?.active || 0
      case 'On Hold': return stats?.onHold || 0
      case 'Completed': return stats?.completed || 0
      default: return stats?.total || 0
    }
  }

  const tabs = [
    { name: 'Total', count: stats?.total || 0 },
    { name: 'Active', count: stats?.active || 0 },
    { name: 'On Hold', count: stats?.onHold || 0 },
    { name: 'Completed', count: stats?.completed || 0 }
  ]

  const statusFilters = ['All', 'Active', 'On Hold', 'Completed']

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, activeTab === tab.name && styles.tabActive]}
            onPress={() => setActiveTab(tab.name)}
          >
            <Text style={[styles.tabCount, activeTab === tab.name && styles.tabCountActive]}>
              {tab.count}
            </Text>
            <Text style={[styles.tabLabel, activeTab === tab.name && styles.tabLabelActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Filters</Text>
        <View style={styles.filterChips}>
          {statusFilters.map(status => (
            <TouchableOpacity
              key={status}
              style={styles.filterChip}
              onPress={() => onFilterByStatus?.(status)}
            >
              <Text style={styles.filterChipText}>{status}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats Info */}
      <View style={styles.statsInfo}>
        <Text style={styles.statsText}>📈 Completion Rate: {stats?.completionRate || 0}%</Text>
        <Text style={styles.statsText}>🆕 Recent (30d): {stats?.recentProjects || 0}</Text>
        <Text style={styles.statsText}>🏆 Top Client: {stats?.topClient || 'None'}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  tabCountActive: {
    color: colors.background,
  },
  tabLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.background,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  statsInfo: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statsText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
})