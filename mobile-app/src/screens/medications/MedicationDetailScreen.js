import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function MedicationDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const { user } = useContext(AuthContext);
  const [medication, setMedication] = useState(null);
  const [loading, setLoading] = useState(true);

  const canManageMedication = ['doctor', 'vet_manager', 'admin'].includes(user?.role);
  const isManager = user?.role !== 'owner';

  useEffect(() => { 
    fetchMedication(); 
  }, [id]);

  const fetchMedication = async () => {
    try {
      const res = await api.get(`/medications/${id}`);
      setMedication(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load medication details');
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      await api.put(`/medications/${id}`, { status: newStatus });
      await fetchMedication();
      Alert.alert('Success', `Medication marked as ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', 'Could not update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Record', 'Are you sure you want to remove this medication record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/medications/${id}`);
          navigation.goBack();
        } catch (err) { 
          Alert.alert('Error', 'Could not delete record'); 
        }
      }}
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return COLORS.success;
      case 'Completed': return COLORS.secondary;
      case 'Discontinued': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  if (loading && !medication) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!medication) return <Text style={styles.errorText}>Record not found</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(medication.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(medication.status) }]}>{medication.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.petName}>{medication.medicationName}</Text>
          <Text style={styles.dateText}>for {medication.petName}</Text>
        </View>

        {isManager && medication.owner && (
          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Owner Information</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerInfo}>
                <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
                <View style={{ marginLeft: SPACING.md }}>
                  <Text style={styles.ownerName}>{medication.owner.name}</Text>
                  <Text style={styles.ownerEmail}>{medication.owner.email}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <DetailItem icon="flask-outline" label="Dosage" value={medication.dosage} />
          <DetailItem icon="repeat-outline" label="Frequency" value={medication.frequency} />
          <DetailItem icon="calendar-outline" label="Start Date" value={new Date(medication.startDate).toLocaleDateString()} />
          <DetailItem icon="stop-circle-outline" label="End Date" value={medication.endDate ? new Date(medication.endDate).toLocaleDateString() : 'Continuous'} />
          <DetailItem icon="person-outline" label="Prescribed By" value={medication.prescribedBy || 'Not specified'} isLast />
        </View>

        {medication.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Dosage Instructions</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{medication.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionSection}>
          {canManageMedication && (
            <>
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('MedicationForm', { id: medication._id })}
              >
                <Ionicons name="create-outline" size={20} color={COLORS.white} />
                <Text style={styles.primaryBtnText}>Update Prescription</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: COLORS.secondary }]}
                onPress={() => navigation.navigate('VaccinePrescriptionForm', { 
                  prefill: { petName: medication.petName, ownerId: medication.owner._id } 
                })}
              >
                <Ionicons name="shield-outline" size={20} color={COLORS.white} />
                <Text style={styles.primaryBtnText}>Prescribe Vaccine</Text>
              </TouchableOpacity>

              {medication.status === 'Active' && (
                <TouchableOpacity 
                  style={[styles.secondaryBtn, { borderColor: COLORS.secondary }]}
                  onPress={() => handleUpdateStatus('Completed')}
                >
                  <Text style={[styles.secondaryBtnText, { color: COLORS.secondary }]}>Mark as Completed</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                <Text style={styles.deleteBtnText}>Delete Record</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailItem = ({ icon, label, value, isLast }) => (
  <View style={[styles.detailItem, !isLast && styles.detailBorder]}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  headerSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: SPACING.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: FONTS.bold,
    letterSpacing: 1,
  },
  petName: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  ownerSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  ownerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  ownerEmail: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  detailBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: FONTS.medium,
    color: COLORS.text,
  },
  notesSection: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  notesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  notesText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  actionSection: {
    marginTop: SPACING.xxl,
    gap: SPACING.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: FONTS.bold,
    marginLeft: 8,
  },
  secondaryBtn: {
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  deleteBtnText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: FONTS.semiBold,
    marginLeft: 6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 100,
  }
});