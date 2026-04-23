import React, { useState, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function VaccinePrescriptionListScreen({ navigation }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get('/vaccine-prescriptions');
      // Filter for 'Pending' ones for the manager
      setPrescriptions(res.data.filter(p => p.status === 'Pending'));
    } catch (err) {
      Alert.alert('Error', 'Could not load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPrescriptions(); }, []));

  const handleSchedule = (item) => {
    navigation.navigate('Appointments', { 
      screen: 'AppointmentForm', 
      params: { 
        prefill: {
          petName: item.petName,
          ownerId: item.owner._id,
          reason: `Vaccination: ${item.vaccineName}`,
          prescriptionId: item._id
        } 
      } 
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-outline" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.petName}>{item.petName}</Text>
          <Text style={styles.vaccineName}>{item.vaccineName} ({item.dosage})</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate('VaccinePrescriptionForm', { id: item._id })}>
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => {
            Alert.alert('Delete Request', 'Are you sure you want to remove this prescription?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: async () => {
                try {
                  await api.delete(`/vaccine-prescriptions/${item._id}`);
                  fetchPrescriptions();
                } catch (err) { Alert.alert('Error', 'Could not delete prescription'); }
              }}
            ]);
          }}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.ownerText}>Owner: {item.owner?.name}</Text>
        <Text style={styles.prescribedByText}>Prescribed By: {item.prescribedBy?.name || 'Veterinarian'}</Text>
        {item.notes && <Text style={styles.notesText}>Notes: {item.notes}</Text>}
      </View>

      <TouchableOpacity style={styles.scheduleBtn} onPress={() => handleSchedule(item)}>
        <Ionicons name="calendar-outline" size={18} color={COLORS.white} />
        <Text style={styles.scheduleBtnText}>Schedule Appointment</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.centered} />
      ) : (
        <FlatList
          data={prescriptions}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchPrescriptions(); }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-open-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>No pending vaccine requests</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: SPACING.md },
  centered: { flex: 1, justifyContent: 'center' },
  card: { backgroundColor: COLORS.surface, borderRadius: 20, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  headerText: { flex: 1 },
  petName: { fontSize: 18, fontWeight: FONTS.bold, color: COLORS.text },
  vaccineName: { fontSize: 14, color: COLORS.textLight },
  statusBadge: { backgroundColor: COLORS.accent + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: FONTS.bold, color: COLORS.accent },
  details: { paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, marginBottom: SPACING.md },
  ownerText: { fontSize: 14, fontWeight: FONTS.medium, color: COLORS.primary },
  prescribedByText: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  notesText: { fontSize: 13, color: COLORS.textLight, marginTop: 4, fontStyle: 'italic' },
  scheduleBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scheduleBtnText: { color: COLORS.white, fontWeight: FONTS.bold, marginLeft: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: COLORS.textLight, marginTop: 16 }
});
