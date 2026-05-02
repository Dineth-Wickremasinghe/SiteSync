import { StyleSheet } from 'react-native'

// ── Colors ────────────────────────────────────────────────────────────────────
export const colors = {
  // Construction theme
  primary:      '#F59E0B',   // yellow
  primaryDark:  '#B45309',   // dark yellow
  primaryLight: '#FEF3C7',   // light yellow

  // Backgrounds
  background:   '#1C1C1E',   // near black
  card:         '#2C2C2E',   // dark card
  inputBg:      '#3A3A3C',   // dark input

  // Text
  textDark:     '#FFFFFF',   // white text on dark bg
  textMuted:    '#9CA3AF',   // gray text
  textLight:    '#6B7280',   // lighter gray

  // Borders
  border:       '#3A3A3C',
  borderLight:  '#48484A',

  // Status colors
  success:      '#22C55E',
  successLight: '#14532D',
  danger:       '#EF4444',
  dangerLight:  '#450A0A',
  warning:      '#F59E0B',
  warningLight: '#451A03',
}

// ── Typography ────────────────────────────────────────────────────────────────
export const typography = StyleSheet.create({
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  link: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
  }
})

// ── Common Styles ─────────────────────────────────────────────────────────────
export const common = StyleSheet.create({

  // Screen header
  header: {
    backgroundColor: colors.background,
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },

  // Containers
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: colors.inputBg,
    color: colors.textDark,
    marginBottom: 4,
  },
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  // Buttons
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  primaryBtnText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  addBtnText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  editBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  editBtnText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '500',
  },
  deleteBtn: {
    backgroundColor: colors.dangerLight,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  deleteBtnText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '500',
  },

  // Option chips
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  optionTextActive: {
    color: colors.background,
    fontWeight: '600',
  },

  // Image upload
  uploadBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  uploadBtnText: {
    color: colors.primary,
    fontSize: 14,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 10,
  },

  // Badges
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeGreen: {
    backgroundColor: colors.successLight,
  },
  badgeGray: {
    backgroundColor: colors.borderLight,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  badgeTextGreen: {
    color: colors.success,
  },
  badgeTextGray: {
    color: colors.textMuted,
  },

  // Card actions
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },

  // Photo
  photoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  photoPlaceholderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },

  // Empty state
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
})