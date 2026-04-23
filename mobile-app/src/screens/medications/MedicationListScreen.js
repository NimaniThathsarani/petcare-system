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

export default function MedicationListScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [medications, setMedications] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isManager = user?.role !== 'owner';

  const fetchMedications = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const medRes = await api.get('/medications');
      const allMeds = medRes.data;
      
      const active = allMeds.filter(m => m.status === 'Active');
      const history = allMeds.filter(m => m.status !== 'Active');
      
      setMedications([...active, ...history]); // Still sortable, but with a divider logic in render

      if (isManager) {
        const apptRes = await api.get('/appointments');
        const completed = apptRes.data.filter(a => a.status === 'Completed');
        setPendingAppointments(completed);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not load medications');
    } finally { 
      setLoading(false); 
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchMedications(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchMedications(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return COLORS.success;
      case 'Discontinued': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const renderItem = ({ item, index }) => {
    // Show a header if this is the first history item
    const showHistoryHeader = index > 0 && item.status !== 'Active' && medications[index-1].status === 'Active';

    return (
      <>
        {showHistoryHeader && (
          <View style={styles.historyHeader}>
            <Text style={styles.historyHeaderText}>Past Records / History</Text>
          </View>
        )}
        <TouchableOpacity 
          style={[styles.card, item.status === 'Active' && styles.activeCard]}
          onPress={() => navigation.navigate('MedicationDetail', { id: item._id })}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.petIconContainer, { backgroundColor: (item.status === 'Active' ? COLORS.success : COLORS.textLight) + '15' }]}>
              <Ionicons name={item.status === 'Active' ? "pulse" : "medical"} size={20} color={item.status === 'Active' ? COLORS.success : COLORS.textLight} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.petName}>{item.petName}</Text>
              <Text style={styles.medicationName}>{item.medicationName}</Text>
              {isManager && item.owner && (
                <Text style={styles.ownerName}>Owner: {item.owner.name}</Text>
              )}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Ionicons name="flask-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.footerText}>{item.dosage} · {item.frequency}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList 
            data={medications} 
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListHeaderComponent={
              <View>
                {isManager && pendingAppointments.length > 0 && (
                  <View style={styles.pendingSection}>
                    <Text style={styles.sectionTitle}>Visits Awaiting Action (Dog Details)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                      {pendingAppointments.map(appt => (
                        <TouchableOpacity 
                          key={appt._id} 
                          style={styles.pendingCard}
                          onPress={() => navigation.navigate('Appointments', { screen: 'AppointmentDetail', params: { id: appt._id } })}
                        >
                          <View style={styles.pendingBadge}>
                            <Ionicons name="paw" size={14} color={COLORS.white} />
                          </View>
                          <Text style={styles.pendingPetName}>{appt.petName}</Text>
                          <Text style={styles.pendingDate}>{new Date(appt.date).toLocaleDateString()}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {medications.length > 0 && (
                  <Text style={[styles.sectionTitle, { marginTop: SPACING.md, marginBottom: SPACING.sm }]}>
                    {medications[0].status === 'Active' ? 'Active Prescriptions' : 'Medication History'}
                  </Text>
                )}
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="medical-outline" size={64} color={COLORS.border} />
                <Text style={styles.emptyText}>No medications found</Text>
                <TouchableOpacity 
                  style={styles.emptyBtn}
                  onPress={() => {
                    if (isManager) {
                       navigation.navigate('Visits');
                    } else {
                       navigation.navigate('MedicationForm');
                    }
                  }}
                >
                  <Text style={styles.emptyBtnText}>{isManager ? 'Browse Visits' : 'Add Medication'}</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('MedicationForm')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100, // Extra space for FAB
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  headerText: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  medicationName: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  ownerName: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: FONTS.medium,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 4,
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
    marginBottom: SPACING.lg,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontWeight: FONTS.semiBold,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  pendingSection: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 20,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  pendingCard: {
    width: 140,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: SPACING.md,
    marginRight: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pendingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pendingPetName: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  pendingDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  activeCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  historyHeader: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface + '80',
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  historyHeaderText: {
    fontSize: 12,
    fontWeight: FONTS.bold,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});