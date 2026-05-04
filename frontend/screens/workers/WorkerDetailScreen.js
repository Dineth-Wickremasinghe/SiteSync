import React from 'react'
import {
  View, Text, ScrollView, Image,
  StyleSheet, TouchableOpacity, Alert
} from 'react-native'
import { colors, common, typography } from '../../theme'
import api from '../../services/api'

export default function WorkerDetailScreen({ navigation, route }) {
  const { worker, token } = route.params

  const deleteWorker = async () => {
    Alert.alert('Delete Worker', `Delete "${worker.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/workers/${worker._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            navigation.goBack()
          } catch (error) {
            Alert.alert('Error', 'Failed to delete worker')
          }
        }
      }
    ])
  }

  const getStatusStyle = () => ({
    bg:   worker.status === 'Active' ? colors.successLight : colors.borderLight,
    text: worker.status === 'Active' ? colors.success      : colors.textMuted,
  })

  const statusStyle = getStatusStyle()

  return (
    <ScrollView style={common.screenContainer} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* ── Hero Image ── */}
      {worker.idPhotoUrl ? (
        <Image
          source={{ uri: worker.idPhotoUrl }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroInitial}>
            {worker.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* ── Status badge over image ── */}
      <View style={styles.statusOverlay}>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {worker.status}
          </Text>
        </View>
      </View>

      {/* ── Name + Trade ── */}
      <View style={styles.nameSection}>
        <Text style={styles.workerName}>{worker.name}</Text>
        <Text style={styles.workerTrade}>{worker.trade}</Text>
      </View>

      {/* ── Info Cards ── */}
      <View style={styles.infoGrid}>

        <InfoRow icon="📱" label="Phone" value={worker.phone} />
        <InfoRow icon="🔨" label="Trade" value={worker.trade} />
        <InfoRow
          icon="📅"
          label="Added On"
          value={new Date(worker.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        />
        {worker.createdBy?.name && (
          <InfoRow icon="👤" label="Added By" value={worker.createdBy.name} />
        )}
        {worker.userId?.name && (
          <InfoRow icon="🔗" label="Linked Account" value={`${worker.userId.name} (${worker.userId.email})`} />
        )}

      </View>

      {/* ── Actions ── */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('WorkerFormScreen', { worker, token })}
        >
          <Text style={styles.editBtnText}>✏️  Edit Worker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={deleteWorker}>
          <Text style={styles.deleteBtnText}>🗑️  Delete</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    height: 300,
  },
  heroPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInitial: {
    fontSize: 96,
    fontWeight: '800',
    color: colors.primary,
  },

  statusOverlay: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot:  { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },

  nameSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  workerName:  { fontSize: 28, fontWeight: '800', color: colors.textDark, marginBottom: 4 },
  workerTrade: { fontSize: 16, color: colors.textMuted },

  infoGrid: {
    paddingHorizontal: 20,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoIcon:  { fontSize: 22, marginRight: 14 },
  infoText:  { flex: 1 },
  infoLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 15, color: colors.textDark, fontWeight: '600' },

  actions: {
    paddingHorizontal: 20,
    marginTop: 28,
    gap: 12,
  },
  editBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
  },
  editBtnText:   { color: colors.background, fontSize: 16, fontWeight: '700' },
  deleteBtn:     { backgroundColor: colors.dangerLight, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: colors.danger },
  deleteBtnText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
})