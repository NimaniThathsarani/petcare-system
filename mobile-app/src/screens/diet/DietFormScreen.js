import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../../services/api';

export default function DietFormScreen({ navigation, route }) {
  const editId = route.params?.id;
  const [petName, setPetName] = useState('');
  const [foodType, setFoodType] = useState('');
  const [brand, setBrand] = useState('');
  const [portionSize, setPortionSize] = useState('');
  const [frequency, setFrequency] = useState('');
  const [feedingTimes, setFeedingTimes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (editId) loadDiet(); }, []);

  const loadDiet = async () => {
    try {
      const res = await api.get(`/diet/${editId}`);
      setPetName(res.data.petName);
      setFoodType(res.data.foodType);
      setBrand(res.data.brand || '');
      setPortionSize(res.data.portionSize);
      setFrequency(res.data.frequency);
      setFeedingTimes(res.data.feedingTimes?.join(', ') || '');
      setStartDate(res.data.startDate?.split('T')[0]);
      setNotes(res.data.notes || '');
    } catch (err) { Alert.alert('Error', 'Could not load diet plan'); }
  };

  const handleSubmit = async () => {
    if (!petName || !foodType || !portionSize || !frequency || !startDate)
      return Alert.alert('Error', 'Please fill all required fields');
    setLoading(true);
    try {
      const feedingTimesArray = feedingTimes.split(',').map(t => t.trim()).filter(t => t);
      if (editId) {
        await api.put(`/diet/${editId}`, { petName, foodType, brand, portionSize, frequency, feedingTimes: feedingTimesArray, startDate, notes });
      } else {
        await api.post('/diet', { petName, foodType, brand, portionSize, frequency, feedingTimes: feedingTimesArray, startDate, notes });
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{editId ? 'Edit Diet Plan' : 'New Diet Plan'}</Text>
      <Text style={styles.label}>Pet Name *</Text>
      <TextInput style={styles.input} value={petName} onChangeText={setPetName} placeholder="Enter pet name" />
      <Text style={styles.label}>Food Type *</Text>
      <TextInput style={styles.input} value={foodType} onChangeText={setFoodType} placeholder="e.g. Dry kibble" />
      <Text style={styles.label}>Brand</Text>
      <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="e.g. Royal Canin" />
      <Text style={styles.label}>Portion Size *</Text>
      <TextInput style={styles.input} value={portionSize} onChangeText={setPortionSize} placeholder="e.g. 200g" />
      <Text style={styles.label}>Frequency *</Text>
      <TextInput style={styles.input} value={frequency} onChangeText={setFrequency} placeholder="e.g. Twice daily" />
      <Text style={styles.label}>Feeding Times (comma separated)</Text>
      <TextInput style={styles.input} value={feedingTimes} onChangeText={setFeedingTimes} placeholder="e.g. 8:00 AM, 6:00 PM" />
      <Text style={styles.label}>Start Date * (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="2026-03-19" />
      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes} placeholder="Additional notes" multiline numberOfLines={4} />
      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>{editId ? 'Update' : 'Create'} Diet Plan</Text>}
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