import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function AppointmentDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const { user } = useContext(AuthContext);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [petName, setPetName] = useState('');
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const isManager = user?.role !== 'owner';

  useFocusEffect(
    useCallback(() => {
      fetchAppointment();
    }, [id])
  );

  const fetchAppointment = async () => {
    try {
      const res = await api.get(`/appointments/${id}`);
      setAppointment(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load appointment details');
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      await api.put(`/appointments/${id}`, { status: newStatus });
      await fetchAppointment();
      Alert.alert('Success', `Appointment marked as ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', 'Could not update status');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async () => {
    if (!petName) return Alert.alert('Error', 'Please enter your pet\'s name');
    
    try {
      setBookingLoading(true);
      await api.put(`/appointments/${id}/book`, { petName, reason });
      setBookingModalVisible(false);
      await fetchAppointment();
      Alert.alert('Success', 'Appointment booked successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not book slot');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Appointment', 'Are you sure you want to remove this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/appointments/${id}`);
          navigation.goBack();
        } catch (err) { 
          Alert.alert('Error', 'Could not delete appointment'); 
        }
      }}
    ]);
  };

  const handleMedicationDelete = (medId) => {
    Alert.alert('Delete Medication', 'Are you sure you want to remove this medication log?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/medications/${medId}`);
          fetchAppointment();
        } catch (err) { Alert.alert('Error', 'Could not delete medication'); }
      }}
    ]);
  };

  const handleDietDelete = (dietId) => {
    Alert.alert('Delete Diet Plan', 'Are you sure you want to remove this diet plan?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/diet/${dietId}`);
          fetchAppointment();
        } catch (err) { Alert.alert('Error', 'Could not delete diet plan'); }
      }}
    ]);
  };

  const canManageMedication = ['doctor', 'vet_manager', 'admin'].includes(user?.role);
  const canManageDiet = ['doctor', 'admin'].includes(user?.role);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return COLORS.primary;
      case 'Pending': return COLORS.warning;
      case 'Scheduled': return COLORS.info;
      case 'Completed': return COLORS.success;
      case 'Cancelled': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  if (loading && !appointment) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!appointment) return <Text style={styles.errorText}>Appointment not found</Text>;

  const apptDate = new Date(appointment.date);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>{appointment.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.petName}>
            {appointment.status === 'Available' ? 'Available Appointment Slot' : `${appointment.petName}'s Visit`}
          </Text>
          <Text style={styles.dateText}>
            {apptDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={styles.timeText}>
            {apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {isManager && appointment.owner && (
          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Owner Information</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerInfo}>
                <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
                <View style={{ marginLeft: SPACING.md }}>
                  <Text style={styles.ownerName}>{appointment.owner.name}</Text>
                  <Text style={styles.ownerEmail}>{appointment.owner.email}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <DetailItem icon="person-outline" label="Veterinarian" value={appointment.vetName} />
          {appointment.status !== 'Available' && (
            <DetailItem icon="business-outline" label="Clinic" value={appointment.clinicName || 'Not specified'} />
          )}
          <DetailItem icon="medkit-outline" label="Reason" value={appointment.reason || (appointment.status === 'Available' ? 'Clinical Appointment' : 'General Checkup')} isLast />
        </View>

        {appointment.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionSection}>
          {appointment.status === 'Available' && (
            isManager ? (
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('AppointmentForm', { id: appointment._id })}
              >
                <Ionicons name="create-outline" size={20} color={COLORS.white} />
                <Text style={styles.primaryBtnText}>Edit Slot Details</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => setBookingModalVisible(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={COLORS.white} />
                <Text style={styles.primaryBtnText}>Book This Slot</Text>
              </TouchableOpacity>
            )
          )}


          {appointment.status === 'Scheduled' && (
            <>
              {isManager && (
                <TouchableOpacity 
                  style={styles.primaryBtn}
                  onPress={() => handleUpdateStatus('Completed')}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Mark as Completed</Text>
                </TouchableOpacity>
              )}

              {!isManager && (
                <TouchableOpacity 
                  style={styles.primaryBtn}
                  onPress={() => navigation.navigate('AppointmentForm', { id: appointment._id })}
                >
                  <Ionicons name="calendar-outline" size={20} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Reschedule Visit</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {(appointment.medications?.length > 0 || appointment.diets?.length > 0 || appointment.vaccinations?.length > 0 || appointment.status === 'Completed') && (
            <View style={styles.clinicalModule}>
              {(appointment.medications?.length > 0 || appointment.diets?.length > 0 || appointment.vaccinations?.length > 0) && (
                <Text style={styles.clinicalTitle}>Clinical Records for this Visit</Text>
              )}
              
              {appointment.medications?.length > 0 && (
                <View style={[styles.linkedRecordsContainer, { borderColor: COLORS.primary }]}>
                  <View style={styles.linkedHeader}>
                    <Ionicons name="medkit" size={16} color={COLORS.primary} />
                    <Text style={[styles.linkedRecordsTitle, { color: COLORS.primary }]}>Prescribed Medications</Text>
                  </View>
                  {appointment.medications.map((med, idx) => (
                    <View key={med._id} style={styles.recordDetailBlock}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.recordMainText}>{med.medicationName} — <Text style={styles.recordSubLabel}>{med.dosage}</Text></Text>
                        {canManageMedication && (
                          <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity onPress={() => navigation.navigate('MedicationForm', { id: med._id })}>
                              <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleMedicationDelete(med._id)}>
                              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      <Text style={styles.recordSecondaryText}>Schedule: {med.frequency}</Text>
                      {med.notes && <Text style={styles.recordNoteText}>Notes: {med.notes}</Text>}
                    </View>
                  ))}
                </View>
              )}

              {appointment.diets?.length > 0 && (
                <View style={[styles.linkedRecordsContainer, { borderColor: COLORS.success }]}>
                  <View style={styles.linkedHeader}>
                    <Ionicons name="restaurant" size={16} color={COLORS.success} />
                    <Text style={[styles.linkedRecordsTitle, { color: COLORS.success }]}>Custom Diet Plan</Text>
                  </View>
                  {appointment.diets.map((diet, idx) => (
                    <View key={diet._id} style={styles.recordDetailBlock}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.recordMainText}>{diet.foodType} — <Text style={styles.recordSubLabel}>{diet.brand}</Text></Text>
                        {canManageDiet && (
                          <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity onPress={() => navigation.navigate('DietForm', { id: diet._id })}>
                              <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDietDelete(diet._id)}>
                              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      <Text style={styles.recordSecondaryText}>Portion: {diet.portionSize} ({diet.frequency})</Text>
                      {diet.notes && <Text style={styles.recordNoteText}>Dietary Notes: {diet.notes}</Text>}
                    </View>
                  ))}
                </View>
              )}

              {appointment.vaccinations?.length > 0 && (
                <View style={[styles.linkedRecordsContainer, { borderColor: COLORS.warning }]}>
                  <View style={styles.linkedHeader}>
                    <Ionicons name="shield-checkmark" size={16} color={COLORS.warning} />
                    <Text style={[styles.linkedRecordsTitle, { color: COLORS.warning }]}>Vaccination Records</Text>
                  </View>
                  {appointment.vaccinations.map((vac, idx) => (
                    <View key={vac._id} style={styles.recordDetailBlock}>
                      <Text style={styles.recordMainText}>{vac.vaccineName}</Text>
                      <Text style={styles.recordSecondaryText}>Given: {new Date(vac.dateGiven).toLocaleDateString()} by {vac.veterinarian}</Text>
                      {vac.nextDueDate && <Text style={[styles.recordNoteText, { color: COLORS.accent }]}>Next Due: {new Date(vac.nextDueDate).toLocaleDateString()}</Text>}
                    </View>
                  ))}
                </View>
              )}
              
              {appointment.vaccinePrescriptions?.length > 0 && (
                <View style={[styles.linkedRecordsContainer, { borderColor: '#6366f1' }]}>
                  <View style={styles.linkedHeader}>
                    <Ionicons name="mail" size={16} color="#6366f1" />
                    <Text style={[styles.linkedRecordsTitle, { color: '#6366f1' }]}>Pending Vaccine Rx</Text>
                  </View>
                  {appointment.vaccinePrescriptions.map((rx, idx) => (
                    <View key={rx._id} style={styles.recordDetailBlock}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.recordMainText}>{rx.vaccineName} — <Text style={styles.recordSubLabel}>{rx.status}</Text></Text>
                        {['doctor', 'admin'].includes(user?.role) && (
                          <TouchableOpacity onPress={async () => {
                            Alert.alert('Delete Request', 'Remove this vaccine prescription?', [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', style: 'destructive', onPress: async () => {
                                try {
                                  await api.delete(`/vaccine-prescriptions/${rx._id}`);
                                  fetchAppointment();
                                } catch (err) { Alert.alert('Error', 'Could not delete request'); }
                              }}
                            ]);
                          }}>
                            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text style={styles.recordSecondaryText}>Dosage: {rx.dosage}</Text>
                    </View>
                  ))}
                </View>
              )}

              {appointment.status === 'Completed' && (
                <View style={styles.clinicalGrid}>
                {['vet_manager', 'doctor', 'admin'].includes(user?.role) && (
                  <ClinicalBtn 
                    icon="medkit-outline" 
                    label="Medication" 
                    onPress={() => navigation.navigate('MedicationForm', { 
                      prefill: { 
                        petName: appointment.petName, 
                        owner: appointment.owner._id,
                        appointmentId: appointment._id
                      } 
                    })} 
                  />
                )}
                {['vet_manager', 'doctor', 'admin'].includes(user?.role) && (
                  <ClinicalBtn 
                    icon="restaurant-outline" 
                    label="Diet Plan" 
                    onPress={() => navigation.navigate('DietForm', { 
                      prefill: { 
                        petName: appointment.petName, 
                        owner: appointment.owner._id,
                        appointmentId: appointment._id
                      } 
                    })} 
                  />
                )}
                {['doctor', 'admin'].includes(user?.role) && (
                  <ClinicalBtn 
                    icon="mail-outline" 
                    label="Prescribe Vaccine" 
                    onPress={() => navigation.navigate('VaccinePrescriptionForm', { 
                      prefill: { 
                        petName: appointment.petName, 
                        ownerId: appointment.owner._id,
                        appointmentId: appointment._id
                      } 
                    })} 
                  />
                )}
                </View>
              )}
            </View>
          )}

          {(appointment.status === 'Scheduled' || appointment.status === 'Pending') && (
            <TouchableOpacity 
              style={[styles.secondaryBtn, { borderColor: COLORS.error }]}
              onPress={() => {
                Alert.alert('Cancel Appointment', 'Are you sure?', [
                  { text: 'No', style: 'cancel' },
                  { text: 'Yes, Cancel', style: 'destructive', onPress: () => handleUpdateStatus('Cancelled') }
                ]);
              }}
            >
              <Text style={[styles.secondaryBtnText, { color: COLORS.error }]}>Cancel Appointment</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.deleteBtnText}>Remove from Calendar</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={bookingModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setBookingModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Book Appointment</Text>
                <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>Please provide details for your pet's visit.</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pet Name</Text>
                <TextInput
                  style={styles.input}
                  value={petName}
                  onChangeText={setPetName}
                  placeholder="E.g. Buddy"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reason for Visit</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="E.g. Annual Checkup"
                  multiline
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, bookingLoading && { opacity: 0.7 }]} 
                onPress={handleBookSlot}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
                    <Text style={styles.primaryBtnText}>Confirm Booking</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const ClinicalBtn = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.clinicalBtn} onPress={onPress}>
    <Ionicons name={icon} size={24} color={COLORS.primary} />
    <Text style={styles.clinicalBtnLabel}>{label}</Text>
  </TouchableOpacity>
);

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
  timeText: {
    fontSize: 18,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
    marginTop: 2,
  },
  ownerSection: {
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
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  clinicalModule: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  clinicalTitle: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  clinicalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clinicalBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  clinicalBtnLabel: {
    fontSize: 11,
    color: COLORS.text,
    marginTop: 4,
    fontWeight: FONTS.medium,
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
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
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
  },
  linkedRecordsContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    ...SHADOWS.sm,
  },
  linkedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4,
  },
  linkedRecordsTitle: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  recordDetailBlock: {
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 8,
  },
  recordMainText: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  recordSubLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: FONTS.medium,
  },
  recordSecondaryText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  recordNoteText: {
    fontSize: 11,
    color: COLORS.text,
    fontStyle: 'italic',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
});