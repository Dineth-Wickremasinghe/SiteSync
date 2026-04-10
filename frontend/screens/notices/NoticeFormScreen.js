import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../config';

const CATEGORIES = ['Safety', 'Schedule', 'General'];

const CATEGORY_ACCENT = {
  Safety: '#D7302D',
  Schedule: '#1D4ED8',
  General: '#15803D',
};

const FormLabel = ({ label, required }) => (
  <Text style={styles.label}>
    {label}
    {required && <Text style={styles.required}> *</Text>}
  </Text>
);

const NoticeFormScreen = ({ navigation, route, token: propToken }) => {
  const existingNotice = route.params?.notice;
  const isEditing = !!existingNotice;

  const [title, setTitle] = useState(existingNotice?.title || '');
  const [message, setMessage] = useState(existingNotice?.message || '');
  const [category, setCategory] = useState(existingNotice?.category || 'General');
  const [postedBy, setPostedBy] = useState(existingNotice?.postedBy || '');
  const [imageUri, setImageUri] = useState(null);
  const [existingImage, setExistingImage] = useState(existingNotice?.noticeImage || null);
  const [loading, setLoading] = useState(false);

  const getToken = async () => {
    return propToken || await AsyncStorage.getItem('token');
  };

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Notice' : 'New Notice',
    });
  }, [isEditing, navigation]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setExistingImage(null);
    }
  };

  const validate = () => {
    if (!title.trim()) { Alert.alert('Validation', 'Title is required.'); return false; }
    if (!message.trim()) { Alert.alert('Validation', 'Message is required.'); return false; }
    if (!postedBy.trim()) { Alert.alert('Validation', 'Posted By is required.'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('message', message.trim());
      formData.append('category', category);
      formData.append('postedBy', postedBy.trim());

      if (imageUri) {
        const filename = imageUri.split('/').pop();
        const type = 'image/' + (filename.split('.').pop() === 'png' ? 'png' : 'jpeg');
        formData.append('noticeImage', { uri: imageUri, name: filename, type });
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (isEditing) {
        await axios.put(`${API_URL}/api/notices/${existingNotice._id}`, formData, config);
        Alert.alert('Success', 'Notice updated successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await axios.post(`${API_URL}/api/notices`, formData, config);
        Alert.alert('Success', 'Notice posted successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const accentColor = CATEGORY_ACCENT[category];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Page title */}
          <View style={styles.pageHeader}>
            <View style={[styles.pageHeaderAccent, { backgroundColor: accentColor }]} />
            <Text style={styles.pageTitle}>{isEditing ? 'Edit Notice' : 'New Notice'}</Text>
          </View>

          {/* Title */}
          <View style={styles.fieldGroup}>
            <FormLabel label="Title" required />
            <TextInput
              style={styles.input}
              placeholder="e.g. Site Safety Briefing"
              placeholderTextColor="#CBD5E1"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
          </View>

          {/* Message */}
          <View style={styles.fieldGroup}>
            <FormLabel label="Message" required />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write the notice content here…"
              placeholderTextColor="#CBD5E1"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View style={styles.fieldGroup}>
            <FormLabel label="Category" required />
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => {
                const selected = category === cat;
                const catColor = CATEGORY_ACCENT[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      selected && { backgroundColor: catColor, borderColor: catColor },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Posted By */}
          <View style={styles.fieldGroup}>
            <FormLabel label="Posted By" required />
            <TextInput
              style={styles.input}
              placeholder="e.g. Site Manager"
              placeholderTextColor="#CBD5E1"
              value={postedBy}
              onChangeText={setPostedBy}
              returnKeyType="done"
            />
          </View>

          {/* Image Picker */}
          <View style={styles.fieldGroup}>
            <FormLabel label="Notice Image" />
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
              ) : existingImage ? (
                <Image
                  source={{ uri: existingImage }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderIcon}>🖼️</Text>
                  <Text style={styles.imagePlaceholderText}>Tap to upload image</Text>
                  <Text style={styles.imagePlaceholderSub}>JPG, PNG supported</Text>
                </View>
              )}
            </TouchableOpacity>
            {(imageUri || existingImage) && (
              <TouchableOpacity
                onPress={() => { setImageUri(null); setExistingImage(null); }}
                style={styles.removeImage}
              >
                <Text style={styles.removeImageText}>✕  Remove image</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: accentColor }, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.submitText}>{isEditing ? 'Update Notice' : 'Post Notice'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20, paddingBottom: 40 },

  pageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 10 },
  pageHeaderAccent: { width: 4, height: 26, borderRadius: 2 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A', letterSpacing: -0.5 },

  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8, letterSpacing: 0.3 },
  required: { color: '#D7302D' },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0F172A',
  },
  textArea: { minHeight: 110, paddingTop: 13 },

  categoryRow: { flexDirection: 'row', gap: 10 },
  categoryChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  categoryChipTextSelected: { color: '#FFFFFF' },

  imagePicker: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  imagePreview: { width: '100%', height: 200 },
  imagePlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  imagePlaceholderIcon: { fontSize: 36 },
  imagePlaceholderText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  imagePlaceholderSub: { fontSize: 12, color: '#94A3B8' },
  removeImage: { marginTop: 8, alignSelf: 'flex-start' },
  removeImageText: { fontSize: 13, color: '#D7302D', fontWeight: '500' },

  submitBtn: {
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  cancelBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontSize: 15, color: '#94A3B8', fontWeight: '500' },
});

export default NoticeFormScreen;