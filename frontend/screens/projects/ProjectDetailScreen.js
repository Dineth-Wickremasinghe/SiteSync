import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity, Alert, ActivityIndicator, StatusBar
} from 'react-native'
import api from '../../services/api'
import { colors, typography, common } from '../../theme'

const STATUS_COLOR = {
  Active:    { bg: colors.successLight, text: colors.success,  dot: colors.success  },
  'On Hold': { bg: colors.warningLight, text: colors.warning,  dot: colors.warning  },
  Completed: { bg: '#1E3A5F',           text: '#60A5FA',        dot: '#60A5FA'       },
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
      <View style={[common.center, common.screenContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!project) return null

  const statusStyle = STATUS_COLOR[project.status] || STATUS_COLOR['Active']
  const createdAt = new Date(project.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const updatedAt = new Date(project.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <View style={common.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
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
          <InfoCard icon="👤" label="Client"        value={project.clientName} />
          {project.createdBy?.name && (
            <InfoCard icon="🛠️" label="Created By"  value={project.createdBy.name} />
          )}
          <InfoCard icon="📅" label="Created"       value={createdAt} />
          <InfoCard icon="🔄" label="Last Updated"  value={updatedAt} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={common.primaryBtn}
            onPress={() => navigation.navigate('ProjectForm', { project, token })}
          >
            <Text style={common.primaryBtnText}>✏️  Edit Project</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[common.deleteBtn, styles.deleteBtnFull]} onPress={handleDelete}>
            <Text style={common.deleteBtnText}>🗑️  Delete</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}

function InfoCard({ icon, label, value }) {
  return (
    <View style={[common.card, styles.infoCard]}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoText}>
        <Text style={[typography.label, styles.infoLabel]}>{label}</Text>
        <Text style={typography.cardTitle}>{value}</Text>
      </View>
    </View>
  )
}

// Screen-specific styles only
const styles = StyleSheet.create({
  content:        { paddingBottom: 40 },
  heroImage:      { width: '100%', height: 240 },
  heroPlaceholder:{ width: '100%', height: 160, backgroundColor: colors.inputBg, justifyContent: 'center', alignItems: 'center' },
  heroIcon:       { fontSize: 56 },
  statusContainer:{ paddingHorizontal: 20, paddingTop: 20 },
  statusBadge:    { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot:      { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText:     { fontSize: 13, fontWeight: '700' },
  projectTitle:   { fontSize: 26, fontWeight: '800', color: colors.textDark, paddingHorizontal: 20, marginTop: 10, marginBottom: 20, lineHeight: 32 },
  infoGrid:       { paddingHorizontal: 20, gap: 10 },
  infoCard:       { flexDirection: 'row', alignItems: 'center', marginBottom: 0 },
  infoIcon:       { fontSize: 22, marginRight: 14 },
  infoText:       { flex: 1 },
  infoLabel:      { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2, marginTop: 0 },
  actions:        { paddingHorizontal: 20, marginTop: 8 },
  deleteBtnFull:  { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
})