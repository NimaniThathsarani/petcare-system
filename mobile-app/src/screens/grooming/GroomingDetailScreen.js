import React, { useState, useEffect, useContext } from 'react';
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
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function GroomingDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const { user } = useContext(AuthContext);
  const [grooming, setGrooming] = useState(null);
  const [loading, setLoading] = useState(true);

  const isManager = user?.role !== 'owner';

  useEffect(() => { 
    fetchGrooming(); 
  }, [id]);

  const fetchGrooming = async () => {
    try {
      const res = await api.get(`/grooming/${id}`);
      setGrooming(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load session details');
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      await api.put(`/grooming/${id}`, { status: newStatus });
      await fetchGrooming();
      Alert.alert('Success', `Session marked as ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', 'Could not update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Session', 'Are you sure you want to remove this grooming record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/grooming/${id}`);
          navigation.goBack();
        } catch (err) { 
          Alert.alert('Error', 'Could not delete record'); 
        }
      }}
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return COLORS.success;
      case 'Cancelled': return COLORS.error;
      case 'Scheduled': return COLORS.info;
      default: return COLORS.textLight;
    }
  };

  if (loading && !grooming) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!grooming) return <Text style={styles.errorText}>Record not found</Text>;

  const baseUrl = api.defaults.baseURL.replace('/api', '');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {grooming.image && (
          <Image 
            source={{ uri: `${baseUrl}${grooming.image}` }} 
            style={styles.headerImage} 
            resizeMode="cover"
          />
        )}

        <View style={styles.headerSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(grooming.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(grooming.status) }]}>{grooming.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.petName}>{grooming.petName}'s Grooming</Text>
          <Text style={styles.dateText}>
            {new Date(grooming.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {isManager && grooming.owner && (
          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Owner Information</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerInfo}>
                <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
                <View style={{ marginLeft: SPACING.md }}>
                  <Text style={styles.ownerName}>{grooming.owner.name}</Text>
                  <Text style={styles.ownerEmail}>{grooming.owner.email}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <DetailItem icon="cut-outline" label="Service Type" value={grooming.serviceType} />
          <DetailItem icon="cash-outline" label="Service Rate" value={grooming.cost ? `LKR ${grooming.cost}` : 'TBD'} isLast />
        </View>

        {grooming.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Instructions & Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{grooming.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionSection}>
          {grooming.status === 'Scheduled' && (
            <>
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('GroomingForm', { id: grooming._id })}
              >
                <Ionicons name="create-outline" size={20} color={COLORS.white} />
                <Text style={styles.primaryBtnText}>Edit Details</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.secondaryBtn, { borderColor: COLORS.error }]}
                onPress={() => {
                  Alert.alert('Cancel Session', 'Are you sure you want to cancel this grooming session?', [
                    { text: 'Keep It', style: 'cancel' },
                    { text: 'Cancel Session', style: 'destructive', onPress: () => handleUpdateStatus('Cancelled') }
                  ]);
                }}
              >
                <Text style={[styles.secondaryBtnText, { color: COLORS.error }]}>Cancel Session</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.deleteBtnText}>Remove Record</Text>
          </TouchableOpacity>
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
    paddingBottom: SPACING.xxl,
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  headerSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
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
    paddingHorizontal: SPACING.md,
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
    marginHorizontal: SPACING.md,
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
    paddingHorizontal: SPACING.md,
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
    paddingHorizontal: SPACING.md,
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
  secondaryBtn: {
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
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
  }
});