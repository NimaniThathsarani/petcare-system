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

export default function DietFormScreen({ navigation, route }) {
  const editId = route.params?.id;
  const [petName, setPetName] = useState('');
  const [foodType, setFoodType] = useState('');
  const [brand, setBrand] = useState('');
  const [portionSize, setPortionSize] = useState('');
  const [frequency, setFrequency] = useState('');
  const [feedingTimes, setFeedingTimes] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [prefilledOwner, setPrefilledOwner] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);

  useEffect(() => { 
    if (editId) {
      loadDiet(); 
    } else if (route.params?.prefill) {
      const { petName, owner, appointmentId } = route.params.prefill;
      setPetName(petName || '');
      setPrefilledOwner(owner || null);
      setAppointmentId(appointmentId || null);
    }
  }, [editId, route.params?.prefill]);

  const loadDiet = async () => {
    try {
      const res = await api.get(`/diet/${editId}`);
      setPetName(res.data.petName);
      setFoodType(res.data.foodType);
      setBrand(res.data.brand || '');
      setPortionSize(res.data.portionSize);
      setFrequency(res.data.frequency);
      setFeedingTimes(res.data.feedingTimes?.join(', ') || '');
      setStartDate(new Date(res.data.startDate));
      setNotes(res.data.notes || '');
    } catch (err) { 
      Alert.alert('Error', 'Could not load diet plan'); 
    }
  };

  const handleSubmit = async () => {
    if (!petName || !foodType || !portionSize || !frequency)
      return Alert.alert('Error', 'Please fill in all mandatory fields');
    
    setLoading(true);
    try {
      const feedingTimesArray = feedingTimes.split(',').map(t => t.trim()).filter(t => t);
      const payload = { 
        petName, 
        foodType, 
        brand, 
        portionSize, 
        frequency, 
        feedingTimes: feedingTimesArray, 
        startDate: startDate.toISOString(), 
        notes,
        owner: prefilledOwner,
        appointment: appointmentId
      };

      if (editId) {
        await api.put(`/diet/${editId}`, payload);
      } else {
        await api.post('/diet', payload);
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
          <Text style={styles.title}>{editId ? 'Update Plan' : 'New Diet Plan'}</Text>
          <Text style={styles.subtitle}>Create a healthy nutrition schedule for your pet</Text>
        </View>

        <View style={styles.form}>
          <FormInput label="Pet Name" value={petName} onChangeText={setPetName} placeholder="E.g. Buddy" icon="paw-outline" />
          <FormInput label="Food Type" value={foodType} onChangeText={setFoodType} placeholder="E.g. Dry Kibble" icon="nutrition-outline" />
          <FormInput label="Brand" value={brand} onChangeText={setBrand} placeholder="E.g. Royal Canin" icon="pricetag-outline" />
          
          <View style={styles.row}>
            <View style={styles.flex1}>
              <FormInput label="Portion Size" value={portionSize} onChangeText={setPortionSize} placeholder="E.g. 200g" icon="scale-outline" />
            </View>
            <View style={styles.flex1}>
              <FormInput label="Frequency" value={frequency} onChangeText={setFrequency} placeholder="E.g. 2x Daily" icon="repeat-outline" />
            </View>
          </View>

          <FormInput 
            label="Feeding Times" 
            value={feedingTimes} 
            onChangeText={setFeedingTimes} 
            placeholder="E.g. 8:00 AM, 6:00 PM" 
            icon="time-outline" 
          />

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
              <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                <Text style={styles.pickerValue}>{startDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
            )}
          </View>

          {Platform.OS !== 'web' && showDatePicker && (
            <DateTimePicker 
              value={startDate} 
              mode="date" 
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, d) => { setShowDatePicker(false); if(d) setStartDate(d); }} 
            />
          )}

          <Text style={styles.label}>Dietary Notes</Text>
          <View style={styles.textareaContainer}>
            <TextInput 
              style={styles.textarea} 
              value={notes} 
              onChangeText={setNotes} 
              placeholder="E.g. Soak in water, avoid poultry..." 
              multiline 
              numberOfLines={4} 
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : (
              <Text style={styles.submitText}>{editId ? 'Save Changes' : 'Create Plan'}</Text>
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
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  flex1: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: SPACING.md,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerValue: {
    fontSize: 15,
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