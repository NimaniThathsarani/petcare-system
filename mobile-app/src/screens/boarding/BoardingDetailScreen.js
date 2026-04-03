import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function BoardingDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const [boarding, setBoarding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBoarding(); }, []);

  const fetchBoarding = async () => {
    try {
      const res = await api.get(`/boarding/${id}`);
      setBoarding(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load boarding record');
    } finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert('Delete Record', 'Are you sure you want to remove this boarding record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/boarding/${id}`);
          navigation.goBack();
        } catch (err) { Alert.alert('Error', 'Could not delete record'); }
      }}
    ]);
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {boarding.image && (
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: `${api.defaults.baseURL.split('/api')[0]}${boarding.image}` }} 
              style={styles.image} 
            />
            <View style={styles.imageOverlay} />
          </View>
        )}

        <View style={[styles.headerSection, !boarding.image && { marginTop: SPACING.lg }]}>
          <Text style={styles.petName}>{boarding.petName}</Text>
          <Text style={styles.facilityName}>{boarding.facilityName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.primary + '15' }]}>
            <Text style={[styles.statusText, { color: COLORS.primary }]}>{boarding.status}</Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <DetailItem label="Owner Name" value={boarding.ownerName || boarding.owner?.name || 'N/A'} icon="person-outline" />
          <DetailItem label="Breed" value={boarding.breed || 'N/A'} icon="git-branch-outline" />
          <DetailItem label="Pet Age" value={boarding.petAge ? `${boarding.petAge} years` : 'N/A'} icon="hourglass-outline" />
          <DetailItem label="Check-in" value={new Date(boarding.checkInDate).toDateString()} icon="calendar-outline" />
          <DetailItem label="Check-out" value={new Date(boarding.checkOutDate).toDateString()} icon="exit-outline" />
          <DetailItem label="Cost Per Day" value={`LKR ${boarding.costPerDay || '0.00'}`} icon="cash-outline" />
          <DetailItem label="Total Cost" value={`LKR ${boarding.totalCost || '0.00'}`} icon="wallet-outline" />
        </View>

        {(boarding.specialInstructions || boarding.notes) && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Additional Info</Text>
            {boarding.specialInstructions && (
              <View style={styles.noteItem}>
                <Text style={styles.noteLabel}>Special Instructions</Text>
                <Text style={styles.noteText}>{boarding.specialInstructions}</Text>
              </View>
            )}
            {boarding.notes && (
              <View style={styles.noteItem}>
                <Text style={styles.noteLabel}>Notes</Text>
                <Text style={styles.noteText}>{boarding.notes}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.editBtn}
            onPress={() => navigation.navigate('BoardingForm', { id: boarding._id })}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.editBtnText}>Edit Record</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Delete Record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailItem = ({ label, value, icon }) => (
  <View style={styles.detailItem}>
    <Ionicons name={icon} size={20} color={COLORS.textLight} style={{ marginRight: 12 }} />
    <View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  imageWrapper: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    ...SHADOWS.sm,
  },
  petName: {
    fontSize: 26,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  facilityName: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: SPACING.xs,
  },
  statusText: {
    fontSize: 13,
    fontWeight: FONTS.semiBold,
    textTransform: 'uppercase',
  },
  detailsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: {
    fontSize: 12,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: FONTS.medium,
    color: COLORS.text,
    marginTop: 2,
  },
  notesSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  noteItem: {
    marginBottom: SPACING.md,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  actions: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  editBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  editBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: FONTS.bold,
  },
  deleteBtn: {
    padding: 16,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: FONTS.semiBold,
  },
});