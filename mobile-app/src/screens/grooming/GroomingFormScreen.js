import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

export default function GroomingFormScreen({ navigation, route }) {
  const editId = route.params?.id;
  const [petName, setPetName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [groomerName, setGroomerName] = useState('');
  const [salonName, setSalonName] = useState('');
  const [date, setDate] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (editId) loadGrooming(); }, []);

  const loadGrooming = async () => {
    try {
      const res = await api.get(`/grooming/${editId}`);
      setPetName(res.data.petName);
      setServiceType(res.data.serviceType);
      setGroomerName(res.data.groomerName || '');
      setSalonName(res.data.salonName || '');
      setDate(res.data.date?.split('T')[0]);
      setCost(res.data.cost?.toString() || '');
      setNotes(res.data.notes || '');
    } catch (err) { Alert.alert('Error', 'Could not load grooming session'); }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!petName || !serviceType || !date)
      return Alert.alert('Error', 'Pet name, service type and date are required');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('petName', petName);
      formData.append('serviceType', serviceType);
      formData.append('groomerName', groomerName);
      formData.append('salonName', salonName);
      formData.append('date', date);
      formData.append('cost', cost);
      formData.append('notes', notes);
      if (image) {
        formData.append('image', { uri: image.uri, type: 'image/jpeg', name: 'grooming.jpg' });
      }
      if (editId) {
        await api.put(`/grooming/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/grooming', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{editId ? 'Edit Grooming' : 'New Grooming Session'}</Text>
      <Text style={styles.label}>Pet Name *</Text>
      <TextInput style={styles.input} value={petName} onChangeText={setPetName} placeholder="Enter pet name" />
      <Text style={styles.label}>Service Type *</Text>
      <TextInput style={styles.input} value={serviceType} onChangeText={setServiceType} placeholder="e.g. Bath and trim" />
      <Text style={styles.label}>Groomer Name</Text>
      <TextInput style={styles.input} value={groomerName} onChangeText={setGroomerName} placeholder="Enter groomer name" />
      <Text style={styles.label}>Salon Name</Text>
      <TextInput style={styles.input} value={salonName} onChangeText={setSalonName} placeholder="Enter salon name" />
      <Text style={styles.label}>Date * (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-04-15" />
      <Text style={styles.label}>Cost (LKR)</Text>
      <TextInput style={styles.input} value={cost} onChangeText={setCost} placeholder="Enter cost" keyboardType="numeric" />
      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes} placeholder="Additional notes" multiline numberOfLines={4} />
      <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
        <Text style={styles.imageBtnText}>📷 {image ? 'Change Image' : 'Pick Image'}</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image.uri }} style={styles.preview} />}
      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>{editId ? 'Update' : 'Create'} Session</Text>}
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
  imageBtn: { borderWidth: 1, borderColor: '#4A90E2', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 16 },
  imageBtnText: { color: '#4A90E2', fontSize: 15 },
  preview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
  btn: { backgroundColor: '#4A90E2', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 40 },
  cancelText: { color: '#888', fontSize: 16 }
});