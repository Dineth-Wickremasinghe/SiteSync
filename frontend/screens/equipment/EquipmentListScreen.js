import React, { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image,
  Platform, TextInput
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'
import { colors, common, typography } from '../../theme'

// ─────────────────────────────────────────────────────────────────────────────
// ListHeader is defined OUTSIDE the main component to prevent keyboard dismiss
// ─────────────────────────────────────────────────────────────────────────────
const ListHeader = ({
  equipment, filtered,
  activeType, activeCondition,
  handleTypePress, handleConditionPress,
  clearFilters,
  search, setSearch,
}) => {

  const totalQtyBy = (key, val) =>
    equipment
      .filter(i => i[key] === val)
      .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)

  // Build a readable label for the filter banner
  const activeLabels = [activeType, activeCondition].filter(Boolean).join(' · ')

  return (
    <View>

      {/* ── Type Summary Cards ───────────────────────────────── */}
      <Text style={styles.sectionLabel}>Equipment by Type</Text>
      <View style={styles.summaryRow}>
        {[
          { label: 'Heavy',    emoji: '⚙️', value: 'Heavy'    },
          { label: 'Tool',     emoji: '🔧', value: 'Tool'     },
          { label: 'Material', emoji: '📦', value: 'Material' },
        ].map(t => {
          const isActive = activeType === t.value
          return (
            <TouchableOpacity
              key={t.value}
              style={[styles.summaryCard, isActive && styles.summaryCardActive]}
              onPress={() => handleTypePress(t.value)}
              activeOpacity={0.75}
            >
              <Text style={styles.summaryQty}>{totalQtyBy('type', t.value)}</Text>
              <View style={styles.summaryBottom}>
                <Text style={styles.summaryEmoji}>{t.emoji}</Text>
                <Text style={[styles.summaryLabel, isActive && styles.summaryLabelActive]}>
                  {t.label}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* ── Condition Summary Cards ───────────────────────────── */}
      <Text style={styles.sectionLabel}>Equipment by Condition</Text>
      <View style={styles.summaryRow}>
        {[
          { label: 'Good', emoji: '✅', value: 'Good' },
          { label: 'Fair', emoji: '⚠️', value: 'Fair' },
          { label: 'Poor', emoji: '❌', value: 'Poor' },
        ].map(c => {
          const isActive = activeCondition === c.value
          return (
            <TouchableOpacity
              key={c.value}
              style={[styles.summaryCard, isActive && styles.summaryCardActive]}
              onPress={() => handleConditionPress(c.value)}
              activeOpacity={0.75}
            >
              <Text style={styles.summaryQty}>{totalQtyBy('condition', c.value)}</Text>
              <View style={styles.summaryBottom}>
                <Text style={styles.summaryEmoji}>{c.emoji}</Text>
                <Text style={[styles.summaryLabel, isActive && styles.summaryLabelActive]}>
                  {c.label}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* ── Active Filter Banner ──────────────────────────────── */}
      {(activeType || activeCondition) && (
        <View style={styles.filterBanner}>
          <Text style={styles.filterBannerText}>
            Showing: {activeLabels} · {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFilterText}>Clear ✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Search Bar ───────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>All Equipment</Text>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by equipment name..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {search.length > 0 && (
        <Text style={styles.resultText}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
        </Text>
      )}

    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen Component
// ─────────────────────────────────────────────────────────────────────────────
export default function EquipmentListScreen({ navigation, token }) {
  const [equipment,       setEquipment]       = useState([])
  const [loading,         setLoading]         = useState(true)
  const [search,          setSearch]          = useState('')
  const [activeType,      setActiveType]      = useState(null)
  const [activeCondition, setActiveCondition] = useState(null)

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const res = await api.get('/equipment', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEquipment(res.data)
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(useCallback(() => { fetchEquipment() }, []))

  // ── Filtering logic — all 3 filters applied simultaneously ─────
  const filtered = equipment.filter(item => {
    const matchSearch    = item.name.toLowerCase().includes(search.trim().toLowerCase())
    const matchType      = activeType      ? item.type      === activeType      : true
    const matchCondition = activeCondition ? item.condition === activeCondition : true
    return matchSearch && matchType && matchCondition
  })

  // ── Each filter toggles independently — no longer clears the other ──
  const handleTypePress = (type) => {
    setActiveType(prev => prev === type ? null : type)
  }

  const handleConditionPress = (condition) => {
    setActiveCondition(prev => prev === condition ? null : condition)
  }

  // Clear both filters at once
  const clearFilters = () => {
    setActiveType(null)
    setActiveCondition(null)
  }

  const deleteEquipment = async (id) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Delete this equipment?')
      if (!confirmed) return
      try {
        await api.delete(`/equipment/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        fetchEquipment()
      } catch (error) {
        Alert.alert('Error', 'Failed to delete equipment')
      }
    } else {
      Alert.alert('Confirm', 'Delete this equipment?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/equipment/${id}`, { headers: { Authorization: `Bearer ${token}` } })
              fetchEquipment()
            } catch (error) {
              Alert.alert('Error', 'Failed to delete equipment')
            }
          }
        }
      ])
    }
  }

  const getConditionStyle = (condition) => {
    if (condition === 'Good') return { bg: { backgroundColor: colors.successLight }, text: { color: colors.success } }
    if (condition === 'Fair') return { bg: { backgroundColor: colors.warningLight }, text: { color: colors.warning } }
    if (condition === 'Poor') return { bg: { backgroundColor: colors.dangerLight },  text: { color: colors.danger  } }
    return { bg: { backgroundColor: colors.borderLight }, text: { color: colors.textMuted } }
  }

  const renderEquipment = ({ item }) => {
    const condStyle = getConditionStyle(item.condition)
    return (
      <View style={common.card}>
        <View style={styles.cardTop}>
          {item.equipmentImg ? (
            <Image source={{ uri: item.equipmentImg }} style={common.photo} />
          ) : (
            <View style={common.photoPlaceholder}>
              <Text style={common.photoPlaceholderText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={typography.cardTitle}>{item.name}</Text>
            <Text style={typography.cardSubtitle}>{item.type} · Qty: {item.quantity}</Text>
            <View style={[common.badge, condStyle.bg]}>
              <Text style={[common.badgeText, condStyle.text]}>{item.condition}</Text>
            </View>
          </View>
        </View>
        <View style={common.cardActions}>
          <TouchableOpacity
            style={common.editBtn}
            onPress={() => navigation.navigate('EquipmentFormScreen', { equipment: item, token })}
          >
            <Text style={common.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={common.deleteBtn}
            onPress={() => deleteEquipment(item._id)}
          >
            <Text style={common.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={common.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={common.screenContainer}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={common.header}>
        <View>
          <Text style={typography.screenTitle}>Equipment</Text>
          <Text style={typography.screenSubtitle}>
            {equipment.length} item{equipment.length !== 1 ? 's' : ''} total
          </Text>
        </View>
        <TouchableOpacity
          style={common.addBtn}
          onPress={() => navigation.navigate('EquipmentFormScreen', { equipment: null, token })}
        >
          <Text style={common.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        renderItem={renderEquipment}
        ListHeaderComponent={
          <ListHeader
            equipment={equipment}
            filtered={filtered}
            activeType={activeType}
            activeCondition={activeCondition}
            handleTypePress={handleTypePress}
            handleConditionPress={handleConditionPress}
            clearFilters={clearFilters}
            search={search}
            setSearch={setSearch}
          />
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        onRefresh={fetchEquipment}
        refreshing={loading}
        ListEmptyComponent={
          <View style={[common.center, { paddingTop: 40 }]}>
            <Text style={common.emptyIcon}>🔍</Text>
            <Text style={typography.emptyText}>
              {equipment.length === 0
                ? 'No equipment found. Add one!'
                : `No results for "${[search, activeType, activeCondition].filter(Boolean).join(', ')}"`}
            </Text>
          </View>
        }
      />

    </View>
  )
}

const styles = StyleSheet.create({
  cardTop:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardInfo: { flex: 1 },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textLight,
    marginTop: 14,
    marginBottom: 7,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── Summary Cards ──────────────────────────────────────────────
  summaryRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 2,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 7,
    paddingVertical: 7,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  summaryCardActive: {
    borderBottomColor: '#F59E0B',
  },
  summaryQty: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  summaryBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  summaryEmoji: {
    fontSize: 10,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  summaryLabelActive: {
    color: '#F59E0B',
  },

  // ── Filter Banner ──────────────────────────────────────────────
  filterBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 10,
  },
  filterBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark,
  },

  // ── Search Bar ─────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 6,
  },
  searchIcon:  { fontSize: 13, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: colors.textDark },
  clearBtn:    { fontSize: 13, color: colors.textMuted, paddingLeft: 8 },
  resultText:  { fontSize: 11, color: colors.textMuted, marginBottom: 8 },
})