import React, { useState, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function GroomingServiceManagementScreen({ navigation }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('1 hour');
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/grooming-services');
      setServices(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load service menu');
    } finally {
      setLoading(true); // Wait, loading should be false
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchServices(); }, []));

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setDuration('1 hour');
    setEditingService(null);
  };

  const handleSave = async () => {
    if (!name || !price) return Alert.alert('Error', 'Name and Price are required');
    
    setSaving(true);
    try {
      const payload = { name, price: Number(price), description, duration };
      if (editingService) {
        await api.put(`/grooming-services/${editingService._id}`, payload);
      } else {
        await api.post('/grooming-services', payload);
      }
      setModalVisible(false);
      resetForm();
      fetchServices();
    } catch (err) {
      Alert.alert('Error', 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Service', 'Are you sure you want to remove this service from the menu?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/grooming-services/${id}`);
          fetchServices();
        } catch (err) {
          Alert.alert('Error', 'Could not delete service');
        }
      }}
    ]);
  };

  const openEdit = (service) => {
    setEditingService(service);
    setName(service.name);
    setPrice(service.price.toString());
    setDescription(service.description);
    setDuration(service.duration);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Service Menu</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => { resetForm(); setModalVisible(true); }}
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
          data={services}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.serviceCard}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.servicePrice}>LKR {item.price}</Text>
                <Text style={styles.serviceMeta}>{item.duration} • {item.description || 'No description'}</Text>
              </View>
              <View style={styles.serviceActions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                  <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="list-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No services defined yet</Text>
            </View>
          }
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'New Service'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={COLORS.text} /></TouchableOpacity>
            </View>
            
            <TextInput style={styles.input} placeholder="Service Name (e.g. Full Grooming)" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Price (LKR)" value={price} onChangeText={setPrice} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Duration (e.g. 2 hours)" value={duration} onChangeText={setDuration} />
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              placeholder="Description" 
              value={description} 
              onChangeText={setDescription} 
              multiline 
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save Service</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  headerTitle: { fontSize: 24, fontWeight: FONTS.bold, color: COLORS.text },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm },
  listContent: { padding: SPACING.lg },
  serviceCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.md, flexDirection: 'row', alignItems: 'center', ...SHADOWS.sm },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: FONTS.bold, color: COLORS.text },
  servicePrice: { fontSize: 15, fontWeight: FONTS.semiBold, color: COLORS.primary, marginVertical: 2 },
  serviceMeta: { fontSize: 12, color: COLORS.textLight },
  serviceActions: { flexDirection: 'row' },
  actionBtn: { padding: 8, marginLeft: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.textLight, marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: 18, fontWeight: FONTS.bold, color: COLORS.text },
  input: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, marginBottom: SPACING.md, fontSize: 15, borderWidth: 1, borderColor: COLORS.border },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: SPACING.md, marginBottom: SPACING.xl },
  saveBtnText: { color: COLORS.white, fontWeight: FONTS.bold, fontSize: 16 }
});
