import React, { useState, useEffect, useContext } from 'react';
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

export default function GroomingFormScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const editId = route.params?.id;
  const isOwner = user?.role === 'owner';
  const [petName, setPetName] = useState('');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceType, setServiceType] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);

  useEffect(() => { 
    fetchServices();
    if (editId) loadGrooming(); 
    if (isOwner) fetchPets();
  }, [editId]);

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

  const fetchServices = async () => {
    try {
      const res = await api.get('/grooming-services');
      setServices(res.data);
    } catch (err) {
      console.log('Error fetching services:', err);
    }
  };

  const loadGrooming = async () => {
    try {
      const res = await api.get(`/grooming/${editId}`);
      setPetName(res.data.petName);
      setServiceType(res.data.serviceType);
      setDate(new Date(res.data.date));
      setCost(res.data.cost?.toString() || '');
      setNotes(res.data.notes || '');
      if (res.data.service) {
        setSelectedService(res.data.service._id);
        setServiceType(res.data.service.name);
      }
    } catch (err) { 
      Alert.alert('Error', 'Could not load session details'); 
    }
  };

  const handleSubmit = async () => {
    if (!petName) return Alert.alert('Missing Field', 'Please enter the pet name');
    if (!serviceType) return Alert.alert('Missing Selection', 'Please select a grooming service from the list');
    if (!date) return Alert.alert('Missing Field', 'Please select an appointment date');
    
    setLoading(true);
    try {
      const payload = { 
        petName, 
        serviceType, 
        date: date.toISOString(),
        cost: cost ? parseFloat(cost) : undefined,
        notes,
        service: selectedService 
      };

      if (editId) {
        await api.put(`/grooming/${editId}`, payload);
        Alert.alert('Success', 'Grooming session updated');
      } else {
        await api.post('/grooming', payload);
        Alert.alert('Success', 'Grooming session booked successfully!');
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
          <Text style={styles.title}>{editId ? 'Edit Session' : 'Book Grooming'}</Text>
          <Text style={styles.subtitle}>Choose a service to keep your pet looking sharp</Text>
        </View>

        <View style={styles.form}>
          {isOwner ? (
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
              )}
            </View>
          ) : (
            <FormInput label="Pet Name" value={petName} onChangeText={setPetName} placeholder="E.g. Buddy" icon="paw-outline" />
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Service</Text>
            {services.length === 0 ? (
              <Text style={styles.emptyServicesText}>No services available. Manage them in the Service Menu.</Text>
            ) : (
              <View style={styles.serviceSelectionList}>
                {services.map(s => (
                  <TouchableOpacity 
                    key={s._id} 
                    style={[styles.serviceOption, selectedService === s._id && styles.serviceOptionActive]}
                    onPress={() => {
                      setSelectedService(s._id);
                      setServiceType(s.name);
                      setCost(s.price.toString());
                    }}
                  >
                    <Text style={[styles.serviceOptionText, selectedService === s._id && styles.serviceOptionTextActive]}>{s.name}</Text>
                    <Text style={[styles.serviceOptionPrice, selectedService === s._id && styles.serviceOptionTextActive]}>LKR {s.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Hidden but managed field for backward compatibility or custom override if admin */}
          {user?.role === 'admin' && (
            <FormInput label="Custom Service override (Admin only)" value={serviceType} onChangeText={setServiceType} placeholder="E.g. Full Grooming" icon="cut-outline" />
          )}

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Date</Text>
              {Platform.OS === 'web' ? (
                React.createElement('input', {
                  type: 'date',
                  value: date.toISOString().split('T')[0],
                  onChange: (e) => {
                    const [year, month, day] = e.target.value.split('-');
                    setDate(new Date(year, month - 1, day));
                  },
                  style: webInputStyle
                })
              ) : (
                <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowDatePicker(true)}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.pickerValue}>{date.toLocaleDateString()}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {Platform.OS !== 'web' && showDatePicker && (
            <DateTimePicker 
              value={date} 
              mode="date" 
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, d) => { setShowDatePicker(false); if(d) setDate(d); }} 
            />
          )}

          <Text style={styles.label}>Special Requirements</Text>
          <View style={styles.textareaContainer}>
            <TextInput 
              style={styles.textarea} 
              value={notes} 
              onChangeText={setNotes} 
              placeholder="E.g. Sensitive skin, flea treatment..." 
              multiline 
              numberOfLines={4} 
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : (
              <Text style={styles.submitText}>{editId ? 'Update Session' : 'Confirm Service'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelLinkText}>Back to List</Text>
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
    alignItems: 'flex-start',
  },
  flex1: {
    flex: 1,
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
    marginBottom: SPACING.md,
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
  },
  serviceSelectionList: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  serviceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  serviceOptionText: {
    fontSize: 15,
    fontWeight: FONTS.semiBold,
    color: COLORS.text,
  },
  serviceOptionPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: FONTS.bold,
  },
  serviceOptionTextActive: {
    color: COLORS.white,
    fontWeight: FONTS.bold,
  },
  emptyServicesText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
    padding: SPACING.md,
    textAlign: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
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
  backgroundColor: '#FFFFFF',
  fontSize: 16,
  color: '#1E293B',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
  height: '50px'
};