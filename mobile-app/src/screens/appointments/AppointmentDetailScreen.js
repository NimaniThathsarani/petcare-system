import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../../services/api';

export default function AppointmentDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAppointment(); }, []);

  const fetchAppointment = async () => {
    try {
      const res = await api.get(`/appointments/${id}`);
      setAppointment(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load appointment');
    } finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert('Delete', 'Are you sure you want to delete this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/appointments/${id}`);
          navigation.goBack();
        } catch (err) { Alert.alert('Error', 'Could not delete appointment'); }
      }}
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 100 }} />;
  if (!appointment) return <Text style={{ textAlign: 'center', marginTop: 100 }}>Not found</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Appointment Details</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Pet Name</Text><Text style={styles.value}>{appointment.petName}</Text>
        <Text style={styles.label}>Vet Name</Text><Text style={styles.value}>{appointment.vetName}</Text>
        <Text style={styles.label}>Clinic</Text><Text style={styles.value}>{appointment.clinicName || 'N/A'}</Text>
        <Text style={styles.label}>Date</Text><Text style={styles.value}>{new Date(appointment.date).toDateString()}</Text>
        <Text style={styles.label}>Reason</Text><Text style={styles.value}>{appointment.reason || 'N/A'}</Text>
        <Text style={styles.label}>Status</Text><Text style={styles.value}>{appointment.status}</Text>
        <Text style={styles.label}>Notes</Text><Text style={styles.value}>{appointment.notes || 'N/A'}</Text>
      </View>
      <TouchableOpacity style={styles.editBtn}
        onPress={() => navigation.navigate('AppointmentForm', { id: appointment._id })}>
        <Text style={styles.editText}>Edit Appointment</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete Appointment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, marginTop: 40, color: '#333' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16 },
  label: { fontSize: 12, color: '#888', marginTop: 12, fontWeight: '500' },
  value: { fontSize: 15, color: '#333', marginTop: 2 },
  editBtn: { backgroundColor: '#4A90E2', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 12 },
  editText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ff4444', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 40 },
  deleteText: { color: '#ff4444', fontSize: 16, fontWeight: '600' }
});