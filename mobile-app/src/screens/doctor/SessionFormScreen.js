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
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function SessionFormScreen({ navigation, route }) {
  const editId = route.params?.id;
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (editId) {
      loadSession();
    }
  }, [editId]);

  const loadSession = async () => {
    try {
      setFetching(true);
      const res = await api.get(`/sessions/${editId}`);
      setDate(res.data.date);
      setStartTime(res.data.startTime);
      setEndTime(res.data.endTime);
      setNotes(res.data.notes || '');
    } catch (err) {
      Alert.alert('Error', 'Could not load session details');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!date || !startTime || !endTime) {
      return Alert.alert('Error', 'Please fill in all required fields');
    }

    setLoading(true);
    try {
      const payload = { date, startTime, endTime, notes };
      if (editId) {
        await api.put(`/sessions/${editId}`, payload);
      } else {
        await api.post('/sessions', payload);
      }

      Alert.alert(
        'Success', 
        editId ? 'Session rescheduled. Vet Manager has been notified.' : 'Availability submitted. Vet Manager has been notified.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to remove this availability record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/sessions/${editId}`);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Could not delete session');
            }
          }
        }
      ]
    );
  };

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{editId ? 'Edit Session' : 'Add Availability'}</Text>
          <Text style={styles.subtitle}>
            Submit your working hours to the Vet Manager
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              value={date} 
              onChangeText={setDate}
              placeholder="2023-10-25"
            />
          </View>

          <View style={styles.timeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Start Time *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="time-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  value={startTime} 
                  onChangeText={setStartTime}
                  placeholder="08:00"
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End Time *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="time-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  value={endTime} 
                  onChangeText={setEndTime}
                  placeholder="17:00"
                />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Notes (Optional)</Text>
          <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingVertical: 10 }]}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.textLight} style={[styles.inputIcon, { marginTop: 4 }]} />
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              value={notes} 
              onChangeText={setNotes} 
              placeholder="Special instructions or constraints..." 
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleSubmit} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={COLORS.white} /> : (
              <Text style={styles.submitText}>
                {editId ? 'Reschedule Session' : 'Submit Availability'}
              </Text>
            )}
          </TouchableOpacity>

          {editId && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete Session</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelLinkText}>Back to List</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    marginBottom: SPACING.md,
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
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: FONTS.bold,
  },
  deleteBtn: {
    marginTop: SPACING.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: FONTS.medium,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  }
});
