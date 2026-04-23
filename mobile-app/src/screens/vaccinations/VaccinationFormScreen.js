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

export default function VaccinationFormScreen({ navigation, route }) {
  const editId = route.params?.id;
  const [petName, setPetName] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [dateGiven, setDateGiven] = useState(new Date());
  const [nextDueDate, setNextDueDate] = useState(new Date());
  const [showGivenPicker, setShowGivenPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [veterinarian, setVeterinarian] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [prefilledOwner, setPrefilledOwner] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);

  useEffect(() => { 
    if (editId) {
      loadVaccination(); 
    } else if (route.params?.prefill) {
      const { petName, owner, appointmentId } = route.params.prefill;
      setPetName(petName || '');
      setPrefilledOwner(owner || null);
      setAppointmentId(appointmentId || null);
    }
  }, [editId, route.params?.prefill]);

  const loadVaccination = async () => {
    try {
      const res = await api.get(`/vaccinations/${editId}`);
      setPetName(res.data.petName);
      setVaccineName(res.data.vaccineName);
      setManufacturer(res.data.manufacturer || '');
      setDateGiven(new Date(res.data.dateGiven));
      if (res.data.nextDueDate) setNextDueDate(new Date(res.data.nextDueDate));
      setVeterinarian(res.data.veterinarian || '');
      setNotes(res.data.notes || '');
    } catch (err) { 
      Alert.alert('Error', 'Could not load record details'); 
    }
  };

  const handleSubmit = async () => {
    if (!petName || !vaccineName)
      return Alert.alert('Error', 'Pet name and vaccine name are required');
    
    setLoading(true);
    try {
      const payload = { 
        petName, 
        vaccineName, 
        manufacturer, 
        dateGiven: dateGiven.toISOString(),
        nextDueDate: nextDueDate.toISOString(),
        veterinarian, 
        notes,
        owner: prefilledOwner,
        appointment: appointmentId
      };

      if (editId) {
        await api.put(`/vaccinations/${editId}`, payload);
      } else {
        await api.post('/vaccinations', payload);
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
          <Text style={styles.title}>{editId ? 'Update Record' : 'Log Vaccination'}</Text>
          <Text style={styles.subtitle}>Keep track of your pet's immunization history</Text>
        </View>

        <View style={styles.form}>
          <FormInput label="Pet Name" value={petName} onChangeText={setPetName} placeholder="E.g. Buddy" icon="paw-outline" />
          <FormInput label="Vaccine Name" value={vaccineName} onChangeText={setVaccineName} placeholder="E.g. Rabies" icon="shield-checkmark-outline" />
          <FormInput label="Veterinarian" value={veterinarian} onChangeText={setVeterinarian} placeholder="E.g. Dr. Miller" icon="person-outline" />
          <FormInput label="Manufacturer" value={manufacturer} onChangeText={setManufacturer} placeholder="E.g. Zoetis" icon="business-outline" />

          <View style={styles.dateRow}>
            <View style={styles.dateGroup}>
              <Text style={styles.label}>Date Given</Text>
              {Platform.OS === 'web' ? (
                React.createElement('input', {
                  type: 'date',
                  value: dateGiven.toISOString().split('T')[0],
                  onChange: (e) => {
                    const [year, month, day] = e.target.value.split('-');
                    setDateGiven(new Date(year, month - 1, day));
                  },
                  style: webInputStyle
                })
              ) : (
                <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowGivenPicker(true)}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.pickerValue}>{dateGiven.toLocaleDateString()}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.dateGroup}>
              <Text style={styles.label}>Next Due</Text>
              {Platform.OS === 'web' ? (
                React.createElement('input', {
                  type: 'date',
                  value: nextDueDate.toISOString().split('T')[0],
                  min: dateGiven.toISOString().split('T')[0],
                  onChange: (e) => {
                    const [year, month, day] = e.target.value.split('-');
                    setNextDueDate(new Date(year, month - 1, day));
                  },
                  style: webInputStyle
                })
              ) : (
                <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowDuePicker(true)}>
                  <Ionicons name="alert-circle-outline" size={18} color={COLORS.accent} />
                  <Text style={styles.pickerValue}>{nextDueDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {Platform.OS !== 'web' && showGivenPicker && (
            <DateTimePicker 
              value={dateGiven} 
              mode="date" 
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, d) => { setShowGivenPicker(false); if(d) setDateGiven(d); }} 
            />
          )}
          {Platform.OS !== 'web' && showDuePicker && (
            <DateTimePicker 
              value={nextDueDate} 
              mode="date" 
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={dateGiven}
              onChange={(e, d) => { setShowDuePicker(false); if(d) setNextDueDate(d); }} 
            />
          )}

          <Text style={styles.label}>Notes</Text>
          <View style={styles.textareaContainer}>
            <TextInput 
              style={styles.textarea} 
              value={notes} 
              onChangeText={setNotes} 
              placeholder="Any side effects or batch numbers?" 
              multiline 
              numberOfLines={4} 
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : (
              <Text style={styles.submitText}>{editId ? 'Save Changes' : 'Add Record'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelLinkText}>Back to History</Text>
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