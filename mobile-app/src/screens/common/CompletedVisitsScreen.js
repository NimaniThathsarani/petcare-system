import React, { useState, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function CompletedVisitsScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const targetForm = route.params?.targetForm || 'VaccinationForm';

  const fetchCompletedAppointments = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const res = await api.get('/appointments');
      // Filter for COMPLETED appointments only
      const completed = res.data.filter(a => a.status === 'Completed');
      // Sort by date descending (newest first)
      const sorted = completed.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAppointments(sorted);
    } catch (err) {
      Alert.alert('Error', 'Could not load completed visits');
    } finally { 
      setLoading(false); 
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchCompletedAppointments(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchCompletedAppointments(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate(targetForm, { 
        prefill: { 
          petName: item.petName, 
          owner: item.owner?._id || item.owner,
          appointmentId: item._id,
          veterinarian: item.vetName
        } 
      })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.petIconContainer}>
          <Ionicons name="paw" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.petName}>{item.petName}</Text>
          <Text style={styles.ownerName}>Owner: {item.owner?.name || 'Unknown'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.footerText}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.footerItem, { marginLeft: SPACING.md }]}>
          <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.footerText}>Vet: {item.vetName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Finished Visit</Text>
        <Text style={styles.subtitle}>Choose an appointment to link the new record</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList 
            data={appointments} 
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-done-circle-outline" size={64} color={COLORS.border} />
                <Text style={styles.emptyText}>No completed visits found</Text>
                <Text style={styles.emptySub}>First, mark an appointment as "Completed" in the schedule.</Text>
              </View>
            }
          />
        )}
      </View>
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
    paddingTop: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
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
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  petIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  ownerName: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 6,
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
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  }
});
