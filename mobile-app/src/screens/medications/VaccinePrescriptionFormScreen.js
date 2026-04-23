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
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function VaccinePrescriptionFormScreen({ navigation, route }) {
  const editId = route.params?.id;
  const [petName, setPetName] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    fetchOwners();
    if (editId) {
      loadPrescription();
    } else if (route.params?.prefill) {
      setPetName(route.params.prefill.petName || '');
      setOwnerId(route.params.prefill.ownerId || '');
    }
  }, [editId]);

  const loadPrescription = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vaccine-prescriptions`);
      // Since no get by ID for prescriptions usually, we find it in list or add endpoint
      // Better to check if a single endpoint exists. Let's assume it does: /vaccine-prescriptions/:id
      const singleRes = await api.get(`/vaccine-prescriptions`); 
      const item = singleRes.data.find(p => p._id === editId);
      if (item) {
        setPetName(item.petName);
        setOwnerId(item.owner?._id || '');
        setVaccineName(item.vaccineName);
        setDosage(item.dosage);
        setNotes(item.notes || '');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not load prescription');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await api.get('/auth/users?role=owner'); 
      setOwners(res.data);
    } catch (err) {
      console.log('Error fetching owners');
    }
  };

  const handleSubmit = async () => {
    if (!petName || !vaccineName || !dosage) {
      return Alert.alert('Error', 'Please fill in all mandatory fields');
    }

    setLoading(true);
    try {
      if (editId) {
        await api.put(`/vaccine-prescriptions/${editId}`, {
          petName,
          owner: ownerId,
          vaccineName,
          dosage,
          notes
        });
        Alert.alert('Success', 'Prescription updated');
      } else {
        await api.post('/vaccine-prescriptions', {
          petName,
          owner: ownerId,
          vaccineName,
          dosage,
          notes
        });
        Alert.alert('Success', 'Vaccine prescription sent to Vaccination Manager');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not save prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Prescribe Vaccine</Text>
          <Text style={styles.subtitle}>Send immunization request to the Vaccination Dept</Text>
        </View>

        <View style={styles.form}>
          <FormInput label="Pet Name" value={petName} onChangeText={setPetName} placeholder="Buddy" icon="paw-outline" />
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Owner ID (for assignment)</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input} 
                value={ownerId} 
                onChangeText={setOwnerId} 
                placeholder="Owner ID" 
                placeholderTextColor={COLORS.textLight + '80'}
              />
            </View>
          </View>

          <FormInput label="Vaccine Name" value={vaccineName} onChangeText={setVaccineName} placeholder="Rabies / Parvo" icon="shield-outline" />
          <FormInput label="Dosage" value={dosage} onChangeText={setDosage} placeholder="0.5ml" icon="flask-outline" />

          <Text style={styles.label}>Clinical Notes</Text>
          <View style={styles.textareaContainer}>
            <TextInput 
              style={styles.textarea} 
              value={notes} 
              onChangeText={setNotes} 
              placeholder="Instructions for the Vaccination Manager..." 
              multiline 
              numberOfLines={4} 
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : (
              <Text style={styles.submitText}>Send Prescription</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const FormInput = ({ label, value, onChangeText, placeholder, icon }) => (
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
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: 28, fontWeight: FONTS.bold, color: COLORS.text },
  subtitle: { fontSize: 16, color: COLORS.textLight, marginTop: 4 },
  form: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: 24, ...SHADOWS.md },
  inputGroup: { marginBottom: SPACING.md },
  label: { fontSize: 14, fontWeight: FONTS.semiBold, color: COLORS.text, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, height: 50, fontSize: 16, color: COLORS.text },
  textareaContainer: { backgroundColor: COLORS.background, borderRadius: 12, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl },
  textarea: { minHeight: 100, fontSize: 16, color: COLORS.text },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: COLORS.white, fontSize: 18, fontWeight: FONTS.bold }
});
