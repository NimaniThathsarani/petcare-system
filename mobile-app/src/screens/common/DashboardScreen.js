import React, { useContext, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../theme/theme';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications');
      const unread = res.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.log('Error fetching unread count:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  const getRoleTitle = (role) => {
    switch (role) {
      case 'owner': return 'Pet Care Portal';
      case 'admin': return 'Hospital Administrator';
      case 'vet_manager': return 'Clinical Director';
      case 'vaccine_manager': return 'Immunization Dept';
      case 'grooming_manager': return 'Grooming Salon';
      case 'boarding_manager': return 'Recovery & Boarding';
      case 'doctor': return 'Veterinarian Portal';
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
          { title: 'Add Pet', icon: 'paw', screen: 'PetForm' },
          { title: 'Book Vet', icon: 'medical', screen: 'Appointments', params: { screen: 'AvailableSlots' } },
          { title: 'Book Grooming', icon: 'cut', screen: 'Grooming' },
          { title: 'Request Boarding', icon: 'bed', screen: 'Boarding', params: { screen: 'BoardingForm' } },
          ...common
        ];
      case 'vet_manager':
        return [
          { title: 'Doctor Sessions', icon: 'people-outline', screen: 'ManageSessions' },
          { title: 'Add Appointment Slots', icon: 'calendar', screen: 'Appointments', params: { initialTab: 'availability' } },
          { title: 'Vet Appointments', icon: 'time-outline', screen: 'Appointments', params: { initialTab: 'bookings' } },
        ];
      case 'vaccine_manager':
        return [
          { title: 'Appointments', icon: 'calendar-outline', screen: 'Appointments' },
          { title: 'Vaccine Rx', icon: 'mail-unread-outline', screen: 'VaccineRequests' },
          { title: 'Records', icon: 'shield-checkmark-outline', screen: 'Vaccinations' },
        ];
      case 'grooming_manager':
        return [
          { title: 'Active Bookings', icon: 'cut', screen: 'Grooming' },
          { title: 'Service Menu', icon: 'settings-outline', screen: 'Grooming', params: { screen: 'GroomingServiceManagement' } },
        ];
      case 'boarding_manager':
        return [
          { title: 'New Requests', icon: 'mail-unread-outline', screen: 'Boarding', params: { initialTab: 'Requests' } },
          { title: 'Active Stays', icon: 'bed-outline', screen: 'Boarding', params: { initialTab: 'Active' } },
          { title: 'Cage Layout', icon: 'cube-outline', screen: 'Cages' },
        ];
      case 'doctor':
        return [
          { title: 'My Sessions', icon: 'calendar-outline', screen: 'DoctorSessions' },
          { title: 'Add Prescription', icon: 'medkit-outline', screen: 'Appointments' },
          { title: 'Current Plans', icon: 'fast-food-outline', screen: 'Diet' },
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
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: FONTS.bold,
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
  menuLabel: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.text,
    textAlign: 'center',
  },
});
