import React, { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'
import { colors, common, typography } from '../../theme'

const CATEGORY_COLORS = {
  Safety:   { bg: '#FFF1F0', text: '#D7302D', dot: '#D7302D' },
  Schedule: { bg: '#EFF6FF', text: '#1D4ED8', dot: '#1D4ED8' },
  General:  { bg: '#F0FDF4', text: '#15803D', dot: '#15803D' },
}

const CategoryBadge = ({ category }) => {
  const cat = CATEGORY_COLORS[category] || CATEGORY_COLORS.General
  return (
    <View style={[styles.badge, { backgroundColor: cat.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: cat.dot }]} />
      <Text style={[styles.badgeText, { color: cat.text }]}>{category}</Text>
    </View>
  )
}

export default function NoticeListScreen({ navigation, token }) {
  const [notices,    setNotices]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchNotices = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      const res = await api.get('/notices', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotices(res.data)
    } catch (error) {
      Alert.alert('Error', 'Failed to load notices')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(useCallback(() => { fetchNotices() }, []))

  const deleteNotice = async (id) => {
    Alert.alert('Confirm', 'Delete this notice?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/notices/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            fetchNotices()
          } catch (error) {
            Alert.alert('Error', 'Failed to delete notice')
          }
        }
      }
    ])
  }

  const renderNotice = ({ item }) => (
    <View style={[common.card, { padding: 0, overflow: 'hidden' }]}>
      {item.noticeImage ? (
        <Image source={{ uri: item.noticeImage }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.placeholderIcon}>📋</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <CategoryBadge category={item.category} />
          <Text style={styles.cardDate}>
            {new Date(item.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric'
            })}
          </Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardMessage} numberOfLines={3}>{item.message}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPostedBy}>
            <Text style={styles.cardPostedByLabel}>Posted by  </Text>
            {item.postedBy}
          </Text>
          <View style={common.cardActions}>
            <TouchableOpacity
              style={common.editBtn}
              onPress={() => navigation.navigate('NoticeFormScreen', { notice: item, token })}
            >
              <Text style={common.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={common.deleteBtn}
              onPress={() => deleteNotice(item._id)}
            >
              <Text style={common.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
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
          <Text style={typography.screenTitle}>Notice Board</Text>
          <Text style={typography.screenSubtitle}>
            {notices.length} notice{notices.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={common.addBtn}
          onPress={() => navigation.navigate('NoticeFormScreen', { notice: null, token })}
        >
          <Text style={common.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {notices.length === 0 ? (
        <View style={common.center}>
          <Text style={common.emptyIcon}>📭</Text>
          <Text style={[typography.cardTitle, { fontSize: 20, marginBottom: 8 }]}>No Notices Yet</Text>
          <Text style={typography.emptyText}>Tap "+ Add" to post the first notice.</Text>
        </View>
      ) : (
        <FlatList
          data={notices}
          keyExtractor={item => item._id}
          renderItem={renderNotice}
          contentContainerStyle={{ padding: 16, gap: 14 }}
          onRefresh={() => fetchNotices(true)}
          refreshing={refreshing}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  cardImage:            { width: '100%', height: 160 },
  cardImagePlaceholder: { width: '100%', height: 100, backgroundColor: colors.inputBg, justifyContent: 'center', alignItems: 'center' },
  placeholderIcon:      { fontSize: 36 },
  cardBody:             { padding: 16 },
  cardHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge:                { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5 },
  badgeDot:             { width: 6, height: 6, borderRadius: 3 },
  badgeText:            { fontSize: 12, fontWeight: '600' },
  cardDate:             { fontSize: 12, color: colors.textMuted },
  cardTitle:            { fontSize: 17, fontWeight: '700', color: colors.textDark, marginBottom: 6, lineHeight: 24 },
  cardMessage:          { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 14 },
  cardFooter:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPostedBy:         { fontSize: 12, color: colors.textMuted, flex: 1 },
  cardPostedByLabel:    { color: colors.textLight },
})