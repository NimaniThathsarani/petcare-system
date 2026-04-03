import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../../services/api';

export default function VaccinationFormScreen({ navigation, route }) {
  const editId = route.params?.id;
  const [petName, setPetName] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [dateGiven, setDateGiven] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [veterinarian, setVeterinarian] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (editId) loadVaccination(); }, []);

  const loadVaccination = async () => {
    try {
      const res = await api.get(`/vaccinations/${editId}`);
      setPetName(res.data.petName);
      setVaccineName(res.data.vaccineName);
      setManufacturer(res.data.manufacturer || '');
      setDateGiven(res.data.dateGiven?.split('T')[0]);
      setNextDueDate(res.data.nextDueDate?.split('T')[0] || '');
      setVeterinarian(res.data.veterinarian || '');
      setNotes(res.data.notes || '');
    } catch (err) { Alert.alert('Error', 'Could not load vaccination'); }
  };

  const handleSubmit = async () => {
    if (!petName || !vaccineName || !dateGiven)
      return Alert.alert('Error', 'Pet name, vaccine name and date are required');
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/vaccinations/${editId}`, { petName, vaccineName, manufacturer, dateGiven, nextDueDate, veterinarian, notes });
      } else {
        await api.post('/vaccinations', { petName, vaccineName, manufacturer, dateGiven, nextDueDate, veterinarian, notes });
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{editId ? 'Edit Vaccination' : 'New Vaccination'}</Text>
      <Text style={styles.label}>Pet Name *</Text>
      <TextInput style={styles.input} value={petName} onChangeText={setPetName} placeholder="Enter pet name" />
      <Text style={styles.label}>Vaccine Name *</Text>
      <TextInput style={styles.input} value={vaccineName} onChangeText={setVaccineName} placeholder="Enter vaccine name" />
      <Text style={styles.label}>Manufacturer</Text>
      <TextInput style={styles.input} value={manufacturer} onChangeText={setManufacturer} placeholder="Enter manufacturer" />
      <Text style={styles.label}>Date Given * (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={dateGiven} onChangeText={setDateGiven} placeholder="2026-03-01" />
      <Text style={styles.label}>Next Due Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={nextDueDate} onChangeText={setNextDueDate} placeholder="2027-03-01" />
      <Text style={styles.label}>Veterinarian</Text>
      <TextInput style={styles.input} value={veterinarian} onChangeText={setVeterinarian} placeholder="Enter vet name" />
      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes} placeholder="Additional notes" multiline numberOfLines={4} />
      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>{editId ? 'Update' : 'Create'} Vaccination</Text>}
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