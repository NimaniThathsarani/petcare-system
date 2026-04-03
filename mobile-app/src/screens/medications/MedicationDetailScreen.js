import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../../services/api';

export default function MedicationDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const [medication, setMedication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMedication(); }, []);

  const fetchMedication = async () => {
    try {
      const res = await api.get(`/medications/${id}`);
      setMedication(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load medication');
    } finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/medications/${id}`);
          navigation.goBack();
        } catch (err) { Alert.alert('Error', 'Could not delete'); }
      }}
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 100 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Medication Details</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Pet Name</Text><Text style={styles.value}>{medication.petName}</Text>
        <Text style={styles.label}>Medication</Text><Text style={styles.value}>{medication.medicationName}</Text>
        <Text style={styles.label}>Dosage</Text><Text style={styles.value}>{medication.dosage}</Text>
        <Text style={styles.label}>Frequency</Text><Text style={styles.value}>{medication.frequency}</Text>
        <Text style={styles.label}>Start Date</Text><Text style={styles.value}>{new Date(medication.startDate).toDateString()}</Text>
        <Text style={styles.label}>End Date</Text><Text style={styles.value}>{medication.endDate ? new Date(medication.endDate).toDateString() : 'N/A'}</Text>
        <Text style={styles.label}>Prescribed By</Text><Text style={styles.value}>{medication.prescribedBy || 'N/A'}</Text>
        <Text style={styles.label}>Status</Text><Text style={styles.value}>{medication.status}</Text>
        <Text style={styles.label}>Notes</Text><Text style={styles.value}>{medication.notes || 'N/A'}</Text>
      </View>
      <TouchableOpacity style={styles.editBtn}
        onPress={() => navigation.navigate('MedicationForm', { id: medication._id })}>
        <Text style={styles.editText}>Edit Medication</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete Medication</Text>
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