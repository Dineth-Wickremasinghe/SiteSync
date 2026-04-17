import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity, Alert, ActivityIndicator, StatusBar
} from 'react-native'
import api from '../../services/api'

const STATUS_COLOR = {
  Active:    { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' },
  'On Hold': { bg: '#FFF8E1', text: '#F57F17', dot: '#FFC107' },
  Completed: { bg: '#E3F2FD', text: '#1565C0', dot: '#2196F3' },
}

export default function ProjectDetailScreen({ route, navigation }) {
  const { projectId, token } = route.params
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProject()
  }, [])

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProject(res.data)
    } catch (err) {
      Alert.alert('Error', 'Could not load project')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      `Delete "${project.projectName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/projects/${project._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
              navigation.goBack()
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Delete failed')
            }
          }
        }
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1B4332" />
      </View>
    )
  }

  if (!project) return null

  const statusStyle = STATUS_COLOR[project.status] || STATUS_COLOR['Active']
  const createdAt = new Date(project.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const updatedAt = new Date(project.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B4332" />
      <ScrollView contentContainerStyle={styles.content}>

        {project.blueprintImage ? (
          <Image source={{ uri: project.blueprintImage }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroIcon}>🏗️</Text>
          </View>
        )}

        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{project.status}</Text>
          </View>
        </View>

        <Text style={styles.projectTitle}>{project.projectName}</Text>

        <View style={styles.infoGrid}>
          <InfoCard icon="📍" label="Location"     value={project.location}   />
          <InfoCard icon="👤" label="Client"       value={project.clientName} />
          {project.createdBy?.name && (
            <InfoCard icon="🛠️" label="Created By" value={project.createdBy.name} />
          )}
          <InfoCard icon="📅" label="Created"      value={createdAt} />
          <InfoCard icon="🔄" label="Last Updated" value={updatedAt} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('ProjectForm', { project, token })}
          >
            <Text style={styles.editBtnText}>✏️  Edit Project</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>🗑️  Delete</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}

function InfoCard({ icon, label, value }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F4F6F4' },
  centered:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content:         { paddingBottom: 40 },
  heroImage:       { width: '100%', height: 240 },
  heroPlaceholder: { width: '100%', height: 160, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  heroIcon:        { fontSize: 56 },
  statusContainer: { paddingHorizontal: 20, paddingTop: 20 },
  statusBadge:     { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot:       { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText:      { fontSize: 13, fontWeight: '700' },
  projectTitle:    { fontSize: 26, fontWeight: '800', color: '#1B2B1E', paddingHorizontal: 20, marginTop: 10, marginBottom: 20, lineHeight: 32 },
  infoGrid:        { paddingHorizontal: 20, gap: 10 },
  infoCard:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, elevation: 2 },
  infoIcon:        { fontSize: 22, marginRight: 14 },
  infoText:        { flex: 1 },
  infoLabel:       { fontSize: 11, color: '#9DB8A2', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue:       { fontSize: 15, color: '#1B2B1E', fontWeight: '600' },
  actions:         { paddingHorizontal: 20, marginTop: 28, gap: 12 },
  editBtn:         { backgroundColor: '#1B4332', borderRadius: 14, paddingVertical: 16, alignItems: 'center', elevation: 3 },
  editBtnText:     { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  deleteBtn:       { backgroundColor: '#FFF0F0', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#FFCDD2' },
  deleteBtnText:   { color: '#C62828', fontSize: 15, fontWeight: '600' },
})