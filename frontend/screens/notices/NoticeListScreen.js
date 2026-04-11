import React, { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'

const CATEGORY_COLORS = {
  Safety:   { bg: '#FFF1F0', text: '#D7302D', dot: '#D7302D' },
  Schedule: { bg: '#EFF6FF', text: '#1D4ED8', dot: '#1D4ED8' },
  General:  { bg: '#F0FDF4', text: '#15803D', dot: '#15803D' },
}

const CategoryBadge = ({ category }) => {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.General
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: colors.dot }]} />
      <Text style={[styles.badgeText, { color: colors.text }]}>{category}</Text>
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

  useFocusEffect(
    useCallback(() => {
      fetchNotices()
    }, [])
  )

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
    <View style={styles.card}>
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
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('NoticeFormScreen', { notice: item, token })}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteNotice(item._id)}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notice Board</Text>
          <Text style={styles.headerSub}>{notices.length} notice{notices.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('NoticeFormScreen', { notice: null, token })}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {notices.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No Notices Yet</Text>
          <Text style={styles.emptyText}>Tap "+ Add" to post the first notice.</Text>
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
  container:            { flex: 1, backgroundColor: '#F8FAFC' },
  center:               { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:               { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle:          { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  headerSub:            { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  addButton:            { backgroundColor: '#1D4ED8', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10 },
  addButtonText:        { color: '#fff', fontWeight: '600', fontSize: 14 },
  card:                 { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', elevation: 3 },
  cardImage:            { width: '100%', height: 160 },
  cardImagePlaceholder: { width: '100%', height: 100, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  placeholderIcon:      { fontSize: 36 },
  cardBody:             { padding: 16 },
  cardHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge:                { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5 },
  badgeDot:             { width: 6, height: 6, borderRadius: 3 },
  badgeText:            { fontSize: 12, fontWeight: '600' },
  cardDate:             { fontSize: 12, color: '#94A3B8' },
  cardTitle:            { fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 6, lineHeight: 24 },
  cardMessage:          { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 14 },
  cardFooter:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPostedBy:         { fontSize: 12, color: '#64748B', flex: 1 },
  cardPostedByLabel:    { color: '#94A3B8' },
  cardActions:          { flexDirection: 'row', gap: 8 },
  editBtn:              { backgroundColor: '#EFF6FF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  editBtnText:          { color: '#1D4ED8', fontWeight: '600', fontSize: 13 },
  deleteBtn:            { backgroundColor: '#FFF1F0', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  deleteBtnText:        { color: '#D7302D', fontWeight: '600', fontSize: 13 },
  emptyIcon:            { fontSize: 52, marginBottom: 16 },
  emptyTitle:           { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  emptyText:            { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
})