import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  SafeAreaView,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function AppointmentFormScreen({ navigation, route }) {
  const { user } = React.useContext(AuthContext);
  const editId = route.params?.id;
  const isOwner = user?.role === 'owner';
  const [petName, setPetName] = useState('');
  const [vetName, setVetName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 1);
  defaultDate.setHours(9, 0, 0, 0);
  const [date, setDate] = useState(defaultDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSlotMode, setIsSlotMode] = useState(true); 
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  useEffect(() => { 
    if (editId) {
      loadAppointment(); 
    } else if (route.params?.prefill) {
      const { petName, ownerId, reason, prescriptionId, vetName, date, slotMode } = route.params.prefill;
      
      if (vetName) setVetName(vetName);
      if (date) setDate(new Date(date));
      if (slotMode !== undefined) setIsSlotMode(slotMode);
      
      setPetName(petName || '');
      setReason(reason || '');
      // We'll store prescriptionId to update it on submit
      setNotes(prev => prev + (prescriptionId ? `\n[System: Linked to Prescription ${prescriptionId}]` : ''));
    }
    if (isOwner) fetchPets();
  }, [editId, route.params?.prefill]);

  const fetchPets = async () => {
    try {
      setPetsLoading(true);
      const res = await api.get('/pets');
      setPets(res.data);
    } catch (err) {
      console.log('Error fetching pets:', err);
    } finally {
      setPetsLoading(false);
    }
  };

  const loadAppointment = async () => {
    try {
      const res = await api.get(`/appointments/${editId}`);
      setPetName(res.data.petName || '');
      setVetName(res.data.vetName);
      setClinicName(res.data.clinicName || '');
      setDate(new Date(res.data.date));
      setReason(res.data.reason || '');
      setNotes(res.data.notes || '');
      setIsSlotMode(res.data.status === 'Available');
    } catch (err) { 
      Alert.alert('Error', 'Could not load appointment details'); 
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDate(newDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const handleSubmit = async () => {
    if (!isSlotMode && !petName)
      return Alert.alert('Error', 'Pet name is required for booked appointments');
    if (!vetName)
      return Alert.alert('Error', 'Vet name is required');
    
    setLoading(true);
    try {
      const payload = { 
        petName: isSlotMode ? undefined : petName, 
        vetName, 
        clinicName, 
        date: date.toISOString(), 
        reason: isSlotMode ? undefined : reason, 
        notes,
        status: isSlotMode ? 'Available' : (isOwner ? 'Pending' : 'Scheduled'),
        owner: route.params?.prefill?.ownerId || (isOwner ? user._id : undefined)
      };

      let res;
      if (editId) {
        res = await api.put(`/appointments/${editId}`, payload);
      } else {
        res = await api.post('/appointments', payload);
        
        // If prefilled from a vaccine prescription, update its status
        if (route.params?.prefill?.prescriptionId) {
          await api.put(`/vaccine-prescriptions/${route.params.prefill.prescriptionId}`, {
            status: 'Scheduled'
          });
        }
      }

      Alert.alert(
        'Success', 
        editId ? 'Appointment recalculated. The owner has been notified of the new time.' : 'Appointment scheduled successfully. The owner has been notified.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {editId ? 'Reschedule' : 'Create Available Slot'}
          </Text>
          <Text style={styles.subtitle}>
            {editId 
              ? 'Update the date and time for this appointment'
              : 'Add an open slot to the hospital schedule for owners to book'
            }
          </Text>
        </View>


        <View style={styles.form}>
          {!isSlotMode && (
            isOwner ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Pet *</Text>
                {petsLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} style={{ alignSelf: 'flex-start' }} />
                ) : pets.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
                    {pets.map(pet => (
                      <TouchableOpacity 
                        key={pet._id} 
                        style={[styles.petOption, petName === pet.name && styles.petOptionSelected]}
                        onPress={() => setPetName(pet.name)}
                      >
                        <Ionicons 
                          name="paw" 
                          size={16} 
                          color={petName === pet.name ? COLORS.white : COLORS.primary} 
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.petOptionText, petName === pet.name && styles.petOptionTextSelected]}>
                          {pet.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <TouchableOpacity 
                    style={styles.noPetWarning}
                    onPress={() => navigation.navigate('PetForm')}
                  >
                    <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                    <Text style={styles.noPetText}>No pets found. <Text style={styles.linkText}>Register one now First.</Text></Text>
                  </TouchableOpacity>
                )
              }
              </View>
            ) : (
              <FormInput label="Pet Name" value={petName} onChangeText={setPetName} placeholder="E.g. Buddy" icon="paw-outline" />
            )
          )}
          <FormInput label="Veterinarian" value={vetName} onChangeText={setVetName} placeholder="E.g. Dr. Smith" icon="person-outline" />
          {!isSlotMode && (
            <FormInput label="Clinic Name" value={clinicName} onChangeText={setClinicName} placeholder="E.g. City Vet Clinic" icon="business-outline" />
          )}

          <Text style={styles.label}>Date & Time</Text>
          <View style={styles.dateTimeRow}>
            {Platform.OS === 'web' ? (
              <View style={styles.webPickerContainer}>
                {React.createElement('input', {
                  type: 'date',
                  value: date.toISOString().split('T')[0],
                  min: new Date().toISOString().split('T')[0],
                  onChange: (e) => {
                    const [year, month, day] = e.target.value.split('-');
                    const newDate = new Date(date);
                    newDate.setFullYear(year);
                    newDate.setMonth(month - 1);
                    newDate.setDate(day);
                    setDate(newDate);
                  },
                  style: webInputStyle
                })}
                <View style={{ width: SPACING.sm }} />
                {React.createElement('input', {
                  type: 'time',
                  value: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                  onChange: (e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const newDate = new Date(date);
                    newDate.setHours(hours);
                    newDate.setMinutes(minutes);
                    setDate(newDate);
                  },
                  style: webInputStyle
                })}
              </View>
            ) : (
              <>
                <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowDatePicker(true)}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.pickerValue}>{date.toLocaleDateString()}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowTimePicker(true)}>
                  <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.pickerValue}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {Platform.OS !== 'web' && showDatePicker && (
            <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} minimumDate={new Date()} />
          )}
          {Platform.OS !== 'web' && showTimePicker && (
            <DateTimePicker value={date} mode="time" display="default" onChange={onTimeChange} />
          )}

          {!isSlotMode && (
            <View>
              <FormInput label="Reason for Visit" value={reason} onChangeText={setReason} placeholder="E.g. Annual Checkup" icon="medical-outline" />
              {isOwner && (
                <Text style={styles.inputHint}>
                  Note: For vaccinations, please include <Text style={{fontWeight: 'bold'}}>"Vaccination"</Text> in the reason.
                </Text>
              )}
            </View>
          )}
          
          {!isSlotMode && (
            <>
              <Text style={styles.label}>Notes</Text>
              <View style={styles.textareaContainer}>
                <TextInput 
                  style={styles.textarea} 
                  value={notes} 
                  onChangeText={setNotes} 
                  placeholder="Any specific symptoms or concerns?" 
                  multiline 
                  numberOfLines={4} 
                  textAlignVertical="top"
                />
              </View>
            </>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : (
              <Text style={styles.submitText}>
                {editId ? 'Save Changes' : 'Create Slot'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelLinkText}>Back to Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const FormInput = ({ label, value, onChangeText, placeholder, icon, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color={COLORS.textLight} style={styles.inputIcon} />
      <TextInput 
        style={styles.input} 
        value={value} 
        onChangeText={onChangeText} 
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight + '80'}
        {...props} 
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 24,
    ...SHADOWS.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.text,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  pickerTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputHint: { fontSize: 12, color: COLORS.textLight, marginTop: -8, marginBottom: 12, marginLeft: 4, fontStyle: 'italic' },
  pickerValue: {
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 8,
  },
  textareaContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  textarea: {
    minHeight: 100,
    fontSize: 16,
    color: COLORS.text,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: FONTS.bold,
  },
  cancelLink: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  cancelLinkText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: FONTS.medium,
  },
  webPickerContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  petSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  petOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  petOptionText: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.text,
  },
  petOptionTextSelected: {
    color: COLORS.white,
  },
  noPetWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  noPetText: {
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.text,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
  }
});

const webInputStyle = {
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  backgroundColor: '#F8FAFC',
  fontSize: 14,
  color: '#1E293B',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
};