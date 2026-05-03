import React from 'react'
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert
} from 'react-native'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { colors, common, typography } from '../../theme'
import api from '../../services/api'

export default function ReportDetailScreen({ navigation, route }) {
  const { report, token, role } = route.params
  const isSupervisor = role === 'supervisor' || role === 'admin'

  const handleDelete = () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this report?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/reports/${report._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            Alert.alert('Success', 'Report deleted')
            navigation.goBack()
          } catch (error) {
            Alert.alert('Error', 'Failed to delete report')
          }
        }
      }
    ])
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTimestamp = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ── PDF export ────────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    try {
      // Build photo section: embed via URL if available
      const photoSection = report.reportPhoto
        ? `<div class="photo-wrap">
             <img src="${report.reportPhoto}" alt="Report Photo" />
           </div>`
        : `<div class="no-photo">📋 No photo attached</div>`

      // Updated-at row (only when different from createdAt)
      const updatedRow = report.updatedAt !== report.createdAt
        ? `<tr>
             <td class="label">Last Updated</td>
             <td>${formatTimestamp(report.updatedAt)}</td>
           </tr>`
        : ''

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  /* ── Reset & base ── */
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 13px;
    color: #1a1a2e;
    background: #ffffff;
  }

  /* ── Cover banner ── */
  .cover {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
    color: #ffffff;
    padding: 36px 32px 28px;
    position: relative;
    overflow: hidden;
  }
  .cover::after {
    content: '';
    position: absolute;
    right: -40px; top: -40px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
  }
  .cover-label {
    font-size: 10px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.55);
    margin-bottom: 8px;
  }
  .cover-title {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1.2;
    margin-bottom: 18px;
  }
  .cover-chips {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .chip {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 5px 14px;
    font-size: 11px;
    color: rgba(255,255,255,0.85);
  }
  .chip.green {
    background: rgba(39,174,96,0.25);
    border-color: rgba(39,174,96,0.4);
    color: #a8e6c1;
  }

  /* ── Photo ── */
  .photo-wrap {
    width: 100%;
    background: #f4f6f9;
  }
  .photo-wrap img {
    width: 100%;
    height: auto;
    object-fit: contain;
    display: block;
  }
  .no-photo {
    background: #f4f6f9;
    text-align: center;
    padding: 40px;
    font-size: 18px;
    color: #9ba5b7;
    letter-spacing: 0.5px;
  }

  /* ── Body content ── */
  .body { padding: 28px 32px 20px; }

  .section-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #9ba5b7;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 2px solid #f0f2f6;
  }

  .work-done-box {
    background: #f8f9fc;
    border-left: 4px solid #0f3460;
    border-radius: 0 8px 8px 0;
    padding: 16px 18px;
    line-height: 1.75;
    color: #2d3561;
    font-size: 13px;
    margin-bottom: 28px;
  }

  /* ── Meta table ── */
  .meta-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  .meta-table tr {
    border-bottom: 1px solid #f0f2f6;
  }
  .meta-table tr:last-child { border-bottom: none; }
  .meta-table td {
    padding: 10px 4px;
    font-size: 12px;
    vertical-align: top;
  }
  .meta-table td.label {
    color: #9ba5b7;
    font-weight: 600;
    width: 38%;
    padding-right: 12px;
  }
  .meta-table td:not(.label) { color: #1a1a2e; font-weight: 500; }

  /* ── Footer ── */
  .footer {
    margin: 32px 32px 0;
    padding: 14px 0;
    border-top: 1px solid #e8ecf2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: #b8c2d1;
  }
  .footer-brand { font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
</style>
</head>
<body>

  <!-- Cover -->
  <div class="cover">
    <p class="cover-label">Daily Site Report</p>
    <h1 class="cover-title">${report.projectName}</h1>
    <div class="cover-chips">
      <span class="chip">📅 ${formatDate(report.reportDate)}</span>
      <span class="chip green">👷 ${report.workerCount} workers on site</span>
    </div>
  </div>

  <!-- Photo -->
  ${photoSection}

  <!-- Body -->
  <div class="body">

    <p class="section-label">Work Completed</p>
    <div class="work-done-box">${report.workDone}</div>

    <p class="section-label">Report Details</p>
    <table class="meta-table">
      <tr>
        <td class="label">Created By</td>
        <td>${report.createdBy?.name || 'Unknown'}</td>
      </tr>
      <tr>
        <td class="label">Email</td>
        <td>${report.createdBy?.email || '—'}</td>
      </tr>
      <tr>
        <td class="label">Created At</td>
        <td>${formatTimestamp(report.createdAt)}</td>
      </tr>
      ${updatedRow}
      <tr>
        <td class="label">Worker Count</td>
        <td>${report.workerCount}</td>
      </tr>
    </table>

  </div>

  <!-- Footer -->
  <div class="footer">
    <span class="footer-brand">Site Manager</span>
    <span>Generated ${formatTimestamp(new Date().toISOString())}</span>
  </div>

</body>
</html>`

      const { uri } = await Print.printToFileAsync({ html, base64: false })

      const canShare = await Sharing.isAvailableAsync()
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Report – ${report.projectName}`,
          UTI: 'com.adobe.pdf',
        })
      } else {
        Alert.alert('Saved', `PDF saved to:\n${uri}`)
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to generate PDF')
      console.error(err)
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Photo header ── */}
        {report.reportPhoto ? (
          <Image source={{ uri: report.reportPhoto }} style={styles.headerPhoto} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderIcon}>📋</Text>
            <Text style={styles.photoPlaceholderText}>No photo attached</Text>
          </View>
        )}

        {/* ── Content card ── */}
        <View style={styles.card}>

          {/* Project name */}
          <Text style={styles.projectName}>{report.projectName}</Text>

          {/* Date chip */}
          <View style={styles.dateChip}>
            <Text style={styles.dateChipText}>📅 {formatDate(report.reportDate)}</Text>
          </View>

          {/* Worker count badge */}
          <View style={styles.workerBadge}>
            <Text style={styles.workerBadgeIcon}>👷</Text>
            <Text style={styles.workerBadgeText}>{report.workerCount} workers on site</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Work done section */}
          <Text style={styles.sectionTitle}>Work Completed</Text>
          <Text style={styles.workDoneText}>{report.workDone}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Metadata */}
          <Text style={styles.sectionTitle}>Report Details</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created by</Text>
            <Text style={styles.metaValue}>
              {report.createdBy?.name || 'Unknown'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Email</Text>
            <Text style={styles.metaValue}>
              {report.createdBy?.email || '—'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created at</Text>
            <Text style={styles.metaValue}>
              {formatTimestamp(report.createdAt)}
            </Text>
          </View>
          {report.updatedAt !== report.createdAt && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Last updated</Text>
              <Text style={styles.metaValue}>
                {formatTimestamp(report.updatedAt)}
              </Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* ── Action bar ── */}
      <View style={styles.actionBar}>

        {/* PDF button — visible to everyone */}
        <TouchableOpacity style={styles.pdfBtn} onPress={handleDownloadPDF}>
          <Text style={styles.pdfBtnText}>📄  PDF</Text>
        </TouchableOpacity>

        {/* Edit / Delete — supervisor/admin only */}
        {isSupervisor && (
          <>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('ReportFormScreen', { report, token })}
            >
              <Text style={styles.editBtnText}>✏️  Edit Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },
  scrollView:  { flex: 1 },

  // Header photo
  headerPhoto: {
    width: '100%',
    height: 280,
    backgroundColor: colors.borderLight,
  },
  photoPlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderIcon: { fontSize: 64, opacity: 0.3, marginBottom: 8 },
  photoPlaceholderText: { fontSize: 14, color: colors.textLight },

  // Content card
  card: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20,
    paddingTop: 24,
  },
  projectName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 12,
  },
  dateChip: {
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  dateChipText: { fontSize: 13, color: colors.textMuted },
  workerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  workerBadgeIcon: { fontSize: 16 },
  workerBadgeText: { fontSize: 14, fontWeight: '600', color: colors.success },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  workDoneText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textDark,
  },

  // Metadata rows
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  metaLabel: { fontSize: 13, color: colors.textMuted },
  metaValue: { fontSize: 13, color: colors.textDark, fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 16 },

  // Action bar
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pdfBtn: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pdfBtnText: { color: colors.textDark, fontSize: 14, fontWeight: '700' },
  editBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  editBtnText: { color: colors.background, fontSize: 15, fontWeight: '700' },
  deleteBtn: {
    backgroundColor: colors.dangerLight,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
})