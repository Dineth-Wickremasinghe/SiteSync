import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../config';

const CATEGORY_COLORS = {
  Safety: { bg: '#FFF1F0', text: '#D7302D', dot: '#D7302D' },
  Schedule: { bg: '#EFF6FF', text: '#1D4ED8', dot: '#1D4ED8' },
  General: { bg: '#F0FDF4', text: '#15803D', dot: '#15803D' },
};

const CategoryBadge = ({ category }) => {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.General;
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: colors.dot }]} />
      <Text style={[styles.badgeText, { color: colors.text }]}>{category}</Text>
    </View>
  );
};

const NoticeCard = ({ item, onEdit, onDelete }) => {
  const date = new Date(item.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      {item.noticeImage ? (
        <Image
          source={{ uri: item.noticeImage }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.placeholderIcon}>📋</Text>
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <CategoryBadge category={item.category} />
          <Text style={styles.cardDate}>{date}</Text>
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
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => onEdit(item)}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => onDelete(item._id)}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const NoticeListScreen = ({ navigation, token: propToken }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getToken = async () => {
    return propToken || await AsyncStorage.getItem('token');
  };

  const fetchNotices = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const token = await getToken();
      const { data } = await axios.get(`${API_URL}/api/notices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotices(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load notices.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [propToken]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => fetchNotices());
    return unsubscribe;
  }, [navigation, fetchNotices]);

  const handleDelete = (id) => {
    Alert.alert('Delete Notice', 'Are you sure you want to delete this notice?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            await axios.delete(`${API_URL}/api/notices/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setNotices((prev) => prev.filter((n) => n._id !== id));
          } catch {
            Alert.alert('Error', 'Failed to delete notice.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.loadingText}>Loading notices…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notice Board</Text>
          <Text style={styles.headerSub}>{notices.length} notice{notices.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('NoticeForm')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notices}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NoticeCard
            item={item}
            onEdit={(notice) => navigation.navigate('NoticeForm', { notice })}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={notices.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchNotices(true)} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No Notices Yet</Text>
            <Text style={styles.emptyText}>Tap "+ Add" to post the first notice.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  addButton: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  listContent: { padding: 16, gap: 14 },
  emptyContainer: { flex: 1 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: { width: '100%', height: 160 },
  cardImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: { fontSize: 36 },

  cardBody: { padding: 16 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },

  cardDate: { fontSize: 12, color: '#94A3B8' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 6, lineHeight: 24 },
  cardMessage: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 14 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPostedBy: { fontSize: 12, color: '#64748B', flex: 1 },
  cardPostedByLabel: { color: '#94A3B8' },

  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  editBtn: { backgroundColor: '#EFF6FF' },
  editBtnText: { color: '#1D4ED8', fontWeight: '600', fontSize: 13 },
  deleteBtn: { backgroundColor: '#FFF1F0' },
  deleteBtnText: { color: '#D7302D', fontWeight: '600', fontSize: 13 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 120 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
});

export default NoticeListScreen;