import React, { useContext, useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [meds, setMeds] = useState([]);
  const [diets, setDiets] = useState([]);
  const [groomings, setGroomings] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medRes, dietRes, groomRes, vacRes, petRes] = await Promise.all([
        api.get('/medications'),
        api.get('/diet'),
        api.get('/grooming'),
        api.get('/vaccinations'),
        api.get('/pets')
      ]);

      setMeds(medRes.data);
      setDiets(dietRes.data);
      setGroomings(groomRes.data);
      setVaccinations(vacRes.data);
      setPets(petRes.data);

      // Auto-select first pet if none selected
      if (petRes.data.length > 0 && !selectedPet) {
        setSelectedPet(petRes.data[0]);
      } else if (petRes.data.length === 0) {
        setSelectedPet(null);
      }
    } catch (err) {
      console.log('Error fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Filtering Logic
  const filteredMeds = meds.filter(m => m.petName === selectedPet?.name && m.status === 'Active');
  const filteredDiets = diets.filter(d => d.petName === selectedPet?.name && d.status === 'Active');
  const filteredGroomings = groomings.filter(g => g.petName === selectedPet?.name && g.status === 'Scheduled');
  const filteredVaccinations = vaccinations.filter(v => v.petName === selectedPet?.name);

  const renderSection = (title, data, icon, color, screen, emptyText) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate(screen)}>
          <Text style={styles.seeAllText}>Records</Text>
        </TouchableOpacity>
      </View>
      {data.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {data.map((item, idx) => (
            <TouchableOpacity 
              key={item._id || idx} 
              style={[styles.summaryCard, { borderLeftColor: color }]}
              onPress={() => navigation.navigate(screen, { screen: screen + 'Detail', params: { id: item._id } })}
            >
              <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={16} color={color} />
              </View>
              <Text style={styles.mainLabel} numberOfLines={1}>
                {item.medicationName || item.serviceType || item.foodType || item.vaccineName}
              </Text>
              <Text style={styles.subLabel}>
                {item.dosage || (item.date ? new Date(item.date).toLocaleDateString() : '') || item.portionSize || item.status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Identity Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={COLORS.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role?.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* My Pets Selectable Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Select Pet</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {pets.map(pet => (
                  <TouchableOpacity 
                    key={pet._id} 
                    style={[
                      styles.petCard, 
                      selectedPet?._id === pet._id && styles.petCardActive
                    ]}
                    onPress={() => setSelectedPet(pet)}
                  >
                    <View style={[
                      styles.petIconBox, 
                      selectedPet?._id === pet._id && { backgroundColor: COLORS.white + '30' }
                    ]}>
                      <Ionicons 
                        name="paw" 
                        size={24} 
                        color={selectedPet?._id === pet._id ? COLORS.white : COLORS.primary} 
                      />
                    </View>
                    <Text style={[
                      styles.petName, 
                      selectedPet?._id === pet._id && { color: COLORS.white }
                    ]}>{pet.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {selectedPet ? (
              <>
                <Text style={styles.petDetailsHeader}>Tracking for {selectedPet.name}</Text>
                
                {renderSection('Active Bookings', filteredGroomings, 'cut', COLORS.primary, 'Grooming', 'No scheduled bookings.')}
                {renderSection('Medications', filteredMeds, 'medical', COLORS.error, 'Medications', 'No active medications.')}
                {renderSection('Nutrition Plans', filteredDiets, 'nutrition', COLORS.success, 'Diet', 'No active plans.')}
                {renderSection('Vaccinations', filteredVaccinations, 'shield-checkmark', '#6366f1', 'Vaccinations', 'No vaccination records.')}
              </>
            ) : (
              <View style={styles.noPetContainer}>
                <Ionicons name="information-circle-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.noPetText}>Add your first pet to see their health tracking details!</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: 24,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: FONTS.bold, color: COLORS.text },
  userEmail: { fontSize: 14, color: COLORS.textLight, marginTop: 2 },
  roleBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  roleText: { color: COLORS.white, fontSize: 10, fontWeight: FONTS.bold, letterSpacing: 0.5 },
  logoutBtn: { padding: 10 },
  section: { marginBottom: SPACING.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 13, fontWeight: FONTS.bold, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 1 },
  seeAllText: { fontSize: 13, color: COLORS.primary, fontWeight: FONTS.semiBold },
  petCard: {
    width: 100,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginRight: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  petIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  petName: { fontSize: 14, fontWeight: FONTS.bold, color: COLORS.text },
  summaryCard: {
    width: 160,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginRight: SPACING.md,
    ...SHADOWS.sm,
    borderLeftWidth: 4,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainLabel: { fontSize: 14, fontWeight: FONTS.bold, color: COLORS.text, marginTop: 2 },
  subLabel: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  emptyCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  emptyText: { color: COLORS.textLight, fontSize: 12 },
  petDetailsHeader: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    marginTop: -SPACING.md,
  },
  noPetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 40,
  },
  noPetText: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: 16,
    fontSize: 14,
    fontWeight: FONTS.medium,
  }
});
