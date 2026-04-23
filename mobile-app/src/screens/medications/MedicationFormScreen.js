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
  SafeAreaView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import api from '../../services/api';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function MedicationFormScreen({ navigation, route }) {
  const editId = route.params?.id;
  const [petName, setPetName] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [prescribedBy, setPrescribedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [prefilledOwner, setPrefilledOwner] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);

  useEffect(() => { 
    if (editId) {
      loadMedication(); 
    } else if (route.params?.prefill) {
      const { petName, owner, appointmentId } = route.params.prefill;
      setPetName(petName || '');
      setPrefilledOwner(owner || null);
      setAppointmentId(appointmentId || null);
    }
  }, [editId, route.params?.prefill]);

  const loadMedication = async () => {
    try {
      const res = await api.get(`/medications/${editId}`);
      setPetName(res.data.petName);
      setMedicationName(res.data.medicationName);
      setDosage(res.data.dosage);
      setFrequency(res.data.frequency);
      setStartDate(new Date(res.data.startDate));
      if (res.data.endDate) setEndDate(new Date(res.data.endDate));
      setPrescribedBy(res.data.prescribedBy || '');
      setNotes(res.data.notes || '');
    } catch (err) { 
      Alert.alert('Error', 'Could not load record details'); 
    }
  };

  const handleSubmit = async () => {
    if (!petName || !medicationName || !dosage || !frequency)
      return Alert.alert('Error', 'Please fill in all mandatory fields');
    
    setLoading(true);
    try {
      const payload = { 
        petName, 
        medicationName, 
        dosage, 
        frequency,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        prescribedBy, 
        notes,
        owner: prefilledOwner,
        appointment: appointmentId
      };

      if (editId) {
        await api.put(`/medications/${editId}`, payload);
      } else {
        await api.post('/medications', payload);
      }
      navigation.goBack();
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
          <Text style={styles.title}>{editId ? 'Update Prescription' : 'New Medication'}</Text>
          <Text style={styles.subtitle}>Log dosage details and schedules for your pet</Text>
        </View>

        <View style={styles.form}>
          <FormInput label="Pet Name" value={petName} onChangeText={setPetName} placeholder="E.g. Buddy" icon="paw-outline" />
          <FormInput label="Medication Name" value={medicationName} onChangeText={setMedicationName} placeholder="E.g. Amoxicillin" icon="medkit-outline" />
          <FormInput label="Dosage" value={dosage} onChangeText={setDosage} placeholder="E.g. 5ml" icon="flask-outline" />
          <FormInput label="Frequency" value={frequency} onChangeText={setFrequency} placeholder="E.g. Twice daily" icon="repeat-outline" />
          <FormInput label="Prescribed By" value={prescribedBy} onChangeText={setPrescribedBy} placeholder="E.g. Dr. Richards" icon="person-outline" />

          <View style={styles.dateRow}>
            <View style={styles.dateGroup}>
              <Text style={styles.label}>Start Date</Text>
              {Platform.OS === 'web' ? (
                React.createElement('input', {
                  type: 'date',
                  value: startDate.toISOString().split('T')[0],
                  onChange: (e) => {
                    const [year, month, day] = e.target.value.split('-');
                    setStartDate(new Date(year, month - 1, day));
                  },
                  style: webInputStyle
                })
              ) : (
                <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowStartPicker(true)}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.pickerValue}>{startDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.dateGroup}>
              <Text style={styles.label}>End Date</Text>
              {Platform.OS === 'web' ? (
                React.createElement('input', {
                  type: 'date',
                  value: endDate.toISOString().split('T')[0],
                  min: startDate.toISOString().split('T')[0],
                  onChange: (e) => {
                    const [year, month, day] = e.target.value.split('-');
                    setEndDate(new Date(year, month - 1, day));
                  },
                  style: webInputStyle
                })
              ) : (
                <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowEndPicker(true)}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.error} />
                  <Text style={styles.pickerValue}>{endDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {Platform.OS !== 'web' && showStartPicker && (
            <DateTimePicker 
              value={startDate} 
              mode="date" 
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, d) => { setShowStartPicker(false); if(d) setStartDate(d); }} 
            />
          )}
          {Platform.OS !== 'web' && showEndPicker && (
            <DateTimePicker 
              value={endDate} 
              mode="date" 
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={startDate}
              onChange={(e, d) => { setShowEndPicker(false); if(d) setEndDate(d); }} 
            />
          )}

          <Text style={styles.label}>Dosage Notes</Text>
          <View style={styles.textareaContainer}>
            <TextInput 
              style={styles.textarea} 
              value={notes} 
              onChangeText={setNotes} 
              placeholder="E.g. Mix with food" 
              multiline 
              numberOfLines={4} 
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : (
              <Text style={styles.submitText}>{editId ? 'Save Changes' : 'Log Medication'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelLinkText}>Discard Changes</Text>
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
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  dateGroup: {
    flex: 1,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerValue: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 6,
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