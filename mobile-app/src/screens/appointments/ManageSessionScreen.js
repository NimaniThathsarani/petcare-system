import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar,
  RefreshControl,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function ManageSessionsScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const res = await api.get('/sessions');
      setSessions(res.data);
    } catch (err) {
      console.log('Error fetching sessions:', err);
      Alert.alert('Error', 'Could not load doctor sessions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSessions();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return COLORS.success;
      case 'Rescheduled': return COLORS.accent;
      case 'Cancelled': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.doctorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.doctor.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.doctorName}>Dr. {item.doctor.name}</Text>
            <Text style={styles.doctorEmail}>{item.doctor.email}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.sessionDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
          <Text style={styles.detailText}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={18} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.startTime} - {item.endTime}</Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.notesBox}>
          <Text style={styles.notesTitle}>Doctor's Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.createBtn]}
          onPress={() => navigation.navigate('AppointmentForm', { 
            prefill: { 
              vetName: `Dr. ${item.doctor.name}`,
              date: item.date,
              time: item.startTime,
              slotMode: true
            } 
          })}
        >
          <Ionicons name="add-circle-outline" size={18} color={COLORS.white} />
          <Text style={styles.actionBtnText}>Create Slot</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Appointments', { 
            initialTab: 'availability' 
          })}
        >
          <Text style={styles.actionBtnText}>Manage Slots</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Doctor Sessions</Text>
        <Text style={styles.subtitle}>Review doctor availability for scheduling</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>No doctor sessions submitted yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  doctorEmail: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: FONTS.bold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border + '50',
    marginBottom: SPACING.md,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    fontFamily: FONTS.medium,
  },
  notesBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: FONTS.bold,
    color: COLORS.textLight,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.textLight,
    borderRadius: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createBtn: {
    backgroundColor: COLORS.primary,
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: FONTS.bold,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
});
