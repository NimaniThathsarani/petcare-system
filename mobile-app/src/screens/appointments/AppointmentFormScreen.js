import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../../services/api';

export default function AppointmentFormScreen({ navigation, route }) {
  const editId = route.params?.id;
  const [petName, setPetName] = useState('');
  const [vetName, setVetName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (editId) loadAppointment(); }, []);

  const loadAppointment = async () => {
    try {
      const res = await api.get(`/appointments/${editId}`);
      setPetName(res.data.petName);
      setVetName(res.data.vetName);
      setClinicName(res.data.clinicName || '');
      setDate(res.data.date?.split('T')[0]);
      setReason(res.data.reason || '');
      setNotes(res.data.notes || '');
    } catch (err) { Alert.alert('Error', 'Could not load appointment'); }
  };

  const handleSubmit = async () => {
    if (!petName || !vetName || !date)
      return Alert.alert('Error', 'Pet name, vet name and date are required');
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/appointments/${editId}`, { petName, vetName, clinicName, date, reason, notes });
      } else {
        await api.post('/appointments', { petName, vetName, clinicName, date, reason, notes });
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{editId ? 'Edit Appointment' : 'New Appointment'}</Text>
      <Text style={styles.label}>Pet Name *</Text>
      <TextInput style={styles.input} value={petName} onChangeText={setPetName} placeholder="Enter pet name" />
      <Text style={styles.label}>Vet Name *</Text>
      <TextInput style={styles.input} value={vetName} onChangeText={setVetName} placeholder="Enter vet name" />
      <Text style={styles.label}>Clinic Name</Text>
      <TextInput style={styles.input} value={clinicName} onChangeText={setClinicName} placeholder="Enter clinic name" />
      <Text style={styles.label}>Date * (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-04-10" />
      <Text style={styles.label}>Reason</Text>
      <TextInput style={styles.input} value={reason} onChangeText={setReason} placeholder="Reason for visit" />
      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes} placeholder="Additional notes" multiline numberOfLines={4} />
      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>{editId ? 'Update' : 'Create'} Appointment</Text>}
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