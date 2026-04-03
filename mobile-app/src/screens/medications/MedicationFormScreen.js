import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../../services/api';

export default function MedicationFormScreen({ navigation, route }) {
  const editId = route.params?.id;
  const [petName, setPetName] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (editId) loadMedication(); }, []);

  const loadMedication = async () => {
    try {
      const res = await api.get(`/medications/${editId}`);
      setPetName(res.data.petName);
      setMedicationName(res.data.medicationName);
      setDosage(res.data.dosage);
      setFrequency(res.data.frequency);
      setStartDate(res.data.startDate?.split('T')[0]);
      setEndDate(res.data.endDate?.split('T')[0] || '');
      setPrescribedBy(res.data.prescribedBy || '');
      setNotes(res.data.notes || '');
    } catch (err) { Alert.alert('Error', 'Could not load medication'); }
  };

  const handleSubmit = async () => {
    if (!petName || !medicationName || !dosage || !frequency || !startDate)
      return Alert.alert('Error', 'Please fill all required fields');
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/medications/${editId}`, { petName, medicationName, dosage, frequency, startDate, endDate, prescribedBy, notes });
      } else {
        await api.post('/medications', { petName, medicationName, dosage, frequency, startDate, endDate, prescribedBy, notes });
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{editId ? 'Edit Medication' : 'New Medication'}</Text>
      <Text style={styles.label}>Pet Name *</Text>
      <TextInput style={styles.input} value={petName} onChangeText={setPetName} placeholder="Enter pet name" />
      <Text style={styles.label}>Medication Name *</Text>
      <TextInput style={styles.input} value={medicationName} onChangeText={setMedicationName} placeholder="Enter medication name" />
      <Text style={styles.label}>Dosage *</Text>
      <TextInput style={styles.input} value={dosage} onChangeText={setDosage} placeholder="e.g. 250mg" />
      <Text style={styles.label}>Frequency *</Text>
      <TextInput style={styles.input} value={frequency} onChangeText={setFrequency} placeholder="e.g. Twice daily" />
      <Text style={styles.label}>Start Date * (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="2026-03-19" />
      <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="2026-03-26" />
      <Text style={styles.label}>Prescribed By</Text>
      <TextInput style={styles.input} value={prescribedBy} onChangeText={setPrescribedBy} placeholder="Enter vet name" />
      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes} placeholder="Additional notes" multiline numberOfLines={4} />
      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>{editId ? 'Update' : 'Create'} Medication</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, marginTop: 40, color: '#333' },
  label: { fontSize: 14, fontWeight: '500', color: '#555', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 15 },
  textarea: { height: 100, textAlignVertical: 'top' },
  btn: { backgroundColor: '#4A90E2', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 40 },
  cancelText: { color: '#888', fontSize: 16 }
});