import React, { useState, useCallback  } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../../services/api'

export default function WorkerListScreen({ navigation, token }) {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)

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

  useFocusEffect(
    useCallback(() => {
      fetchWorkers()
    }, [])
  )

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
        onPress={() => navigation.navigate('WorkerForm', { worker: item, token })}
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A5276" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('WorkerForm', { worker: null, token })}
      >
        <Text style={styles.addBtnText}>+ Add Worker</Text>
      </TouchableOpacity>

      {workers.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No workers found. Add one!</Text>
        </View>
      ) : (
        <FlatList
          data={workers}
          keyExtractor={item => item._id}
          renderItem={renderWorker}
          contentContainerStyle={{ paddingBottom: 20 }}
          onRefresh={fetchWorkers}
          refreshing={loading}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  center:               { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addBtn:               { backgroundColor: '#1A5276', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 16 },
  addBtnText:           { color: '#fff', fontSize: 15, fontWeight: '600' },
  card:                 { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10 },
  cardTop:              { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  photo:                { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  photoPlaceholder:     { width: 56, height: 56, borderRadius: 8, backgroundColor: '#D6EAF8', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  photoPlaceholderText: { fontSize: 22, fontWeight: 'bold', color: '#1A5276' },
  cardInfo:             { flex: 1 },
  name:                 { fontSize: 15, fontWeight: '600', color: '#1B2631', marginBottom: 2 },
  sub:                  { fontSize: 13, color: '#888', marginBottom: 6 },
  cardActions:          { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  badge:                { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeGreen:           { backgroundColor: '#EAF3DE' },
  badgeGray:            { backgroundColor: '#F1EFE8' },
  badgeText:            { fontSize: 11, fontWeight: '500' },
  badgeTextGreen:       { color: '#3B6D11' },
  badgeTextGray:        { color: '#5F5E5A' },
  editBtn:              { backgroundColor: '#D6EAF8', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 7 },
  editBtnText:          { color: '#1A5276', fontSize: 13, fontWeight: '500' },
  deleteBtn:            { backgroundColor: '#FCEBEB', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 7 },
  deleteBtnText:        { color: '#A32D2D', fontSize: 13, fontWeight: '500' },
  emptyText:            { color: '#888', fontSize: 15 }
})