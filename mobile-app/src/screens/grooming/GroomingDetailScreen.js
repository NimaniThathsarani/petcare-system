import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import api from '../../services/api';

export default function GroomingDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const [grooming, setGrooming] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchGrooming(); }, []);

  const fetchGrooming = async () => {
    try {
      const res = await api.get(`/grooming/${id}`);
      setGrooming(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load grooming session');
    } finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/grooming/${id}`);
          navigation.goBack();
        } catch (err) { Alert.alert('Error', 'Could not delete'); }
      }}
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 100 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Grooming Details</Text>
      {grooming.image && <Image source={{ uri: `${api.defaults.baseURL.replace('/api', '')}${grooming.image}` }} style={styles.image} />}
      <View style={styles.card}>
        <Text style={styles.label}>Pet Name</Text><Text style={styles.value}>{grooming.petName}</Text>
        <Text style={styles.label}>Service Type</Text><Text style={styles.value}>{grooming.serviceType}</Text>
        <Text style={styles.label}>Groomer</Text><Text style={styles.value}>{grooming.groomerName || 'N/A'}</Text>
        <Text style={styles.label}>Salon</Text><Text style={styles.value}>{grooming.salonName || 'N/A'}</Text>
        <Text style={styles.label}>Date</Text><Text style={styles.value}>{new Date(grooming.date).toDateString()}</Text>
        <Text style={styles.label}>Cost</Text><Text style={styles.value}>LKR {grooming.cost || 'N/A'}</Text>
        <Text style={styles.label}>Status</Text><Text style={styles.value}>{grooming.status}</Text>
        <Text style={styles.label}>Notes</Text><Text style={styles.value}>{grooming.notes || 'N/A'}</Text>
      </View>
      <TouchableOpacity style={styles.editBtn}
        onPress={() => navigation.navigate('GroomingForm', { id: grooming._id })}>
        <Text style={styles.editText}>Edit Session</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, marginTop: 40, color: '#333' },
  image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16 },
  label: { fontSize: 12, color: '#888', marginTop: 12, fontWeight: '500' },
  value: { fontSize: 15, color: '#333', marginTop: 2 },
  editBtn: { backgroundColor: '#4A90E2', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 12 },
  editText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ff4444', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 40 },
  deleteText: { color: '#ff4444', fontSize: 16, fontWeight: '600' }
});