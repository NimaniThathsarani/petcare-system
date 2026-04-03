import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

const SIZES = ['Small', 'Medium', 'Large'];
const TYPES = ['AC', 'Non-AC'];

export default function CageManagementScreen() {
  const [cages, setCages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [editingCage, setEditingCage] = useState(null);
  
  // Form state
  const [cageNumber, setCageNumber] = useState('');
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [selectedType, setSelectedType] = useState('Non-AC');
  const [saving, setSaving] = useState(false);

  const fetchCages = async () => {
    try {
      const res = await api.get('/cages');
      setCages(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch cages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchCages(); }, []));

  const resetForm = () => {
    setCageNumber('');
    setSelectedSize('Medium');
    setSelectedType('Non-AC');
    setEditingCage(null);
  };

  const openEdit = (cage) => {
    setEditingCage(cage);
    setCageNumber(cage.cageNumber);
    setSelectedSize(cage.size);
    setSelectedType(cage.type);
    setModalVisible(true);
  };

  const handleSave = async () => {
    console.log('HANDLESAVE CALLED');
    Alert.alert('Debug', 'Save button pressed');
    if (!cageNumber) {
      return Alert.alert('Error', 'Please enter a cage number');
    }

    setSaving(true);
    try {
      const payload = { cageNumber, size: selectedSize, type: selectedType };
      if (editingCage) {
        await api.put(`/cages/${editingCage._id}`, payload);
        Alert.alert('Success', 'Cage updated successfully');
      } else {
        await api.post('/cages', payload);
        Alert.alert('Success', 'Cage added successfully');
      }
      setModalVisible(false);
      resetForm();
      fetchCages();
    } catch (err) {
      console.log('CAGE SAVE ERROR:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save cage';
      Alert.alert('Save Error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      return Alert.alert('Error', 'Please provide a reason for deletion');
    }

    try {
      // Axios delete with body requires { data: { ... } } config
      await api.delete(`/cages/${deletingId}`, { 
        data: { reason: deleteReason } 
      });
      setDeleteModalVisible(false);
      setDeleteReason('');
      setDeletingId(null);
      fetchCages();
      Alert.alert('Success', 'Cage deleted successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to delete cage: ' + (err.response?.data?.message || err.message));
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setDeleteReason('');
    setDeleteModalVisible(true);
  };

  const renderCageItem = ({ item }) => (
    <View style={styles.cageCard}>
      <View style={styles.cageInfo}>
        <View style={styles.cageHeader}>
          <Ionicons name="cube-outline" size={20} color={COLORS.primary} />
          <Text style={styles.cageNumber}>Cage {item.cageNumber}</Text>
        </View>
        <View style={styles.tagRow}>
          <View style={[styles.tag, { backgroundColor: COLORS.info + '15' }]}>
            <Text style={[styles.tagText, { color: COLORS.info }]}>{item.size}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: COLORS.accent + '15' }]}>
            <Text style={[styles.tagText, { color: COLORS.accent }]}>{item.type}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cageActions}>
        <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionIcon}>
          <Ionicons name="pencil-outline" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(item._id)} style={styles.actionIcon}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Facility Cages</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={cages}
          keyExtractor={item => item._id}
          renderItem={renderCageItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchCages();
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyStateText}>No cages registered yet</Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingCage ? 'Edit Cage' : 'New Cage'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Cage Number/Identifier</Text>
                <TextInput
                  style={[styles.input, editingCage && styles.inputDisabled]}
                  value={cageNumber}
                  onChangeText={setCageNumber}
                  placeholder="e.g. 101, A-12"
                  editable={!editingCage}
                />
              </View>

              <View style={[styles.formGroup, editingCage && { opacity: 0.6 }]}>
                <Text style={styles.label}>Size Category {editingCage && '(Read-only)'}</Text>
                <View style={styles.selectionRow} pointerEvents={editingCage ? 'none' : 'auto'}>
                  {SIZES.map(s => (
                    <TouchableOpacity 
                      key={s} 
                      style={[styles.selectionBtn, selectedSize === s && styles.selectionBtnActive]}
                      onPress={() => setSelectedSize(s)}
                    >
                      <Text style={[styles.selectionText, selectedSize === s && styles.selectionTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.selectionRow}>
                  {TYPES.map(t => (
                    <TouchableOpacity 
                      key={t} 
                      style={[styles.selectionBtn, selectedType === t && styles.selectionBtnActive]}
                      onPress={() => setSelectedType(t)}
                    >
                      <Text style={[styles.selectionText, selectedType === t && styles.selectionTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color={COLORS.white} /> : (
                  <Text style={styles.saveBtnText}>{editingCage ? 'Update Cage' : 'Add Cage'}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Delete Reason Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderRadius: 24, paddingBottom: SPACING.xl }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reason for Deletion</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.deleteWarnText}>
              Please provide a reason why this cage is being removed from the facility.
            </Text>

            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              value={deleteReason}
              onChangeText={setDeleteReason}
              placeholder="e.g. Broken lock, Under maintenance, Facility upgrade..."
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalActionBtn, { backgroundColor: COLORS.border }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.modalActionText, { color: COLORS.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalActionBtn, { backgroundColor: COLORS.error }]}
                onPress={handleDelete}
              >
                <Text style={styles.modalActionText}>Confirm Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  cageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  cageInfo: {
    flex: 1,
  },
  cageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cageNumber: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginLeft: 8,
  },
  tagRow: {
    flexDirection: 'row',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
  },
  cageActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyStateText: {
    marginTop: 12,
    color: COLORS.textLight,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  selectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectionBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectionBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectionText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: FONTS.medium,
  },
  selectionTextActive: {
    color: COLORS.white,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: FONTS.bold,
  },
  inputDisabled: {
    backgroundColor: COLORS.border + '30',
    color: COLORS.textLight,
  },
  deleteWarnText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalActionBtn: {
    flex: 0.48,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.white,
  },
});
