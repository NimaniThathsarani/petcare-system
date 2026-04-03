import React, { useState, useEffect } from 'react';
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
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function DietDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const [diet, setDiet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDiet(); }, []);

  const fetchDiet = async () => {
    try {
      const res = await api.get(`/diet/${id}`);
      setDiet(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load diet plan');
    } finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert('Delete Plan', 'Are you sure you want to remove this diet plan?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/diet/${id}`);
          navigation.goBack();
        } catch (err) { Alert.alert('Error', 'Could not delete plan'); }
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
        <View style={styles.headerCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="restaurant" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.petName}>{diet.petName}</Text>
          <Text style={styles.foodType}>{diet.foodType}</Text>
        </View>

        <View style={styles.detailsSection}>
          <DetailItem label="Brand" value={diet.brand || 'Any Brand'} icon="pricetag-outline" />
          <DetailItem label="Portion Size" value={diet.portionSize} icon="scale-outline" />
          <DetailItem label="Frequency" value={diet.frequency} icon="repeat-outline" />
          <DetailItem label="Feeding Times" value={diet.feedingTimes?.join(', ') || 'N/A'} icon="time-outline" />
          <DetailItem label="Start Date" value={new Date(diet.startDate).toLocaleDateString()} icon="calendar-outline" />
          <DetailItem label="Status" value={diet.status} icon="pulse-outline" />
        </View>

        {diet.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{diet.notes}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.editBtn}
            onPress={() => navigation.navigate('DietForm', { id: diet._id })}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.editBtnText}>Edit Plan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Delete Plan</Text>
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
    padding: SPACING.lg,
  },
  headerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  petName: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  foodType: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  detailsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
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
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  notesText: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  actions: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
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