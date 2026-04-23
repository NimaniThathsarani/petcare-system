import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function DietDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const { user } = useContext(AuthContext);
  const [diet, setDiet] = useState(null);
  const [activeMeds, setActiveMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const canManageDiet = ['doctor', 'admin'].includes(user?.role);
  const isManager = user?.role !== 'owner';

  useEffect(() => { 
    fetchDiet(); 
  }, [id]);

  const fetchDiet = async () => {
    try {
      const res = await api.get(`/diet/${id}`);
      setDiet(res.data);
      
      // Also fetch medications for this pet
      if (res.data.petName) {
        const medRes = await api.get('/medications');
        const petMeds = medRes.data.filter(m => 
          m.petName === res.data.petName && m.status === 'Active'
        );
        setActiveMeds(petMeds);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not load diet plan');
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Plan', 'Are you sure you want to remove this diet plan?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/diet/${id}`);
          navigation.goBack();
        } catch (err) { 
          Alert.alert('Error', 'Could not delete plan'); 
        }
      }}
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return COLORS.success;
      case 'On Hold': return COLORS.warning;
      case 'Completed': return COLORS.secondary;
      default: return COLORS.textLight;
    }
  };

  if (loading && !diet) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!diet) return <Text style={styles.errorText}>Plan not found</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(diet.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(diet.status) }]}>{diet.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.petName}>{diet.foodType}</Text>
          <Text style={styles.dateText}>Dietary plan for {diet.petName}</Text>
        </View>

        {isManager && diet.owner && (
          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Owner Information</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerInfo}>
                <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
                <View style={{ marginLeft: SPACING.md }}>
                  <Text style={styles.ownerName}>{diet.owner.name}</Text>
                  <Text style={styles.ownerEmail}>{diet.owner.email}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <DetailItem icon="pricetag-outline" label="Brand" value={diet.brand || 'Any Brand'} />
          <DetailItem icon="scale-outline" label="Portion Size" value={diet.portionSize} />
          <DetailItem icon="repeat-outline" label="Frequency" value={diet.frequency} />
          <DetailItem icon="time-outline" label="Feeding Times" value={diet.feedingTimes?.join(', ') || 'Not specified'} />
          <DetailItem icon="calendar-outline" label="Start Date" value={new Date(diet.startDate).toLocaleDateString()} isLast />
        </View>

        {diet.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Dietary Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{diet.notes}</Text>
            </View>
          </View>
        )}

        {activeMeds.length > 0 && (
          <View style={styles.medsSection}>
            <Text style={styles.sectionTitle}>Active Patient Medications</Text>
            <Text style={styles.sectionSubtitle}>Nutritionists should review these for potential interactions</Text>
            {activeMeds.map(med => (
              <View key={med._id} style={styles.medContextCard}>
                <View style={styles.medContextIcon}>
                  <Ionicons name="pulse" size={18} color={COLORS.error} />
                </View>
                <View style={styles.medContextBody}>
                  <Text style={styles.medContextTitle}>{med.medicationName}</Text>
                  <Text style={styles.medContextSub}>{med.dosage} · {med.frequency}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionSection}>
          {canManageDiet && (
            <>
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('DietForm', { id: diet._id })}
              >
                <Ionicons name="create-outline" size={20} color={COLORS.white} />
                <Text style={styles.primaryBtnText}>Update Diet Plan</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                <Text style={styles.deleteBtnText}>Remove Plan</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailItem = ({ icon, label, value, isLast }) => (
  <View style={[styles.detailItem, !isLast && styles.detailBorder]}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  headerSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: SPACING.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: FONTS.bold,
    letterSpacing: 1,
  },
  petName: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  ownerSection: {
    marginBottom: SPACING.lg,
  },
  ownerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  ownerEmail: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  detailBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: FONTS.medium,
    color: COLORS.text,
  },
  notesSection: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  notesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  notesText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  actionSection: {
    marginTop: SPACING.xxl,
    gap: SPACING.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: FONTS.bold,
    marginLeft: 8,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  deleteBtnText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: FONTS.semiBold,
    marginLeft: 6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 100,
  },
  medsSection: {
    marginTop: SPACING.xl,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  medContextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  medContextIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.error + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  medContextBody: {
    flex: 1,
  },
  medContextTitle: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  medContextSub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
});