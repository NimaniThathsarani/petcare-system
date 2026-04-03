import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const getRoleTitle = (role) => {
    switch (role) {
      case 'owner': return 'Pet Owner Dashboard';
      case 'admin': return 'System Administrator';
      case 'vet_manager': return 'Vet Appointment Manager';
      case 'vaccine_manager': return 'Vaccination Manager';
      case 'medication_manager': return 'Medication Manager';
      case 'grooming_manager': return 'Grooming Manager';
      case 'diet_manager': return 'Diet Plan Manager';
      case 'boarding_manager': return 'Boarding Manager';
      default: return 'Dashboard';
    }
  };

  const getMenuOptions = (role) => {
    const common = [
      { title: 'Profile', icon: 'person-circle-outline', screen: 'Profile' },
    ];

    switch (role) {
      case 'owner':
        return [
          { title: 'My Pets', icon: 'paw', screen: 'MyPets' },
          { title: 'Book Vet', icon: 'medical', screen: 'Appointments' },
          { title: 'Vaccinations', icon: 'shield-checkmark', screen: 'Vaccinations' },
          { title: 'Medications', icon: 'flask', screen: 'Medications' },
          { title: 'Book Grooming', icon: 'cut', screen: 'Grooming' },
          { title: 'Diet Plans', icon: 'restaurant', screen: 'Diet' },
          { title: 'Request Boarding', icon: 'bed', screen: 'Boarding', params: { screen: 'BoardingForm' } },
          ...common
        ];
      case 'vet_manager':
        return [
          { title: 'All Appointments', icon: 'calendar', screen: 'Appointments' },
          { title: 'Pending List', icon: 'time-outline', screen: 'Appointments' },
          { title: 'Update Status', icon: 'checkmark-done-circle', screen: 'Appointments' },
          ...common
        ];
      case 'vaccine_manager':
        return [
          { title: 'Add Record', icon: 'add-circle-outline', screen: 'Vaccinations' },
          { title: 'View All', icon: 'list', screen: 'Vaccinations' },
          { title: 'Update Due', icon: 'calendar-outline', screen: 'Vaccinations' },
          ...common
        ];
      case 'medication_manager':
        return [
          { title: 'Add Prescription', icon: 'medkit-outline', screen: 'Medications' },
          { title: 'Active Meds', icon: 'pulse-outline', screen: 'Medications' },
          { title: 'Update Status', icon: 'refresh-circle-outline', screen: 'Medications' },
          ...common
        ];
      case 'grooming_manager':
        return [
          { title: 'Bookings', icon: 'cut-outline', screen: 'Grooming' },
          { title: 'Schedule', icon: 'calendar-outline', screen: 'Grooming' },
          { title: 'History', icon: 'journal-outline', screen: 'Grooming' },
          ...common
        ];
      case 'diet_manager':
        return [
          { title: 'Create Plan', icon: 'restaurant-outline', screen: 'Diet' },
          { title: 'Current Plans', icon: 'fast-food-outline', screen: 'Diet' },
          { title: 'Update Meal', icon: 'time-outline', screen: 'Diet' },
          ...common
        ];
      case 'boarding_manager':
        return [
          { title: 'Requests', icon: 'bed-outline', screen: 'Boarding' },
          { title: 'Active Stay', icon: 'home-outline', screen: 'Boarding' },
          { title: 'Check-In/Out', icon: 'log-in-outline', screen: 'Boarding' },
          ...common
        ];
      case 'admin':
        return [
          { title: 'Manage Users', icon: 'people-outline', screen: 'Users' },
          { title: 'Staff', icon: 'briefcase-outline', screen: 'Staff' },
          { title: 'Services', icon: 'settings-outline', screen: 'Services' },
          { title: 'Reports', icon: 'bar-chart-outline', screen: 'Reports' },
          ...common
        ];
      default: return common;
    }
  };

  const menuOptions = getMenuOptions(user?.role);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.roleCard}>
          <Text style={styles.roleTitle}>{getRoleTitle(user?.role)}</Text>
          <Text style={styles.roleSubtitle}>What would you like to do today?</Text>
        </View>

        <View style={styles.menuGrid}>
          {menuOptions.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen, item.params)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  welcome: {
    fontSize: 16,
    color: COLORS.textLight,
    fontFamily: FONTS.medium,
  },
  name: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  roleCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  roleTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: FONTS.bold,
  },
  roleSubtitle: {
    color: COLORS.white + 'CC',
    fontSize: 14,
    marginTop: 4,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
});
